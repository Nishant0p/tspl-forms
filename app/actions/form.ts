'use server';

import { getCurrentUser, AuthRequiredError, ForbiddenError, getCurrentEmployee, getSuperAdminIdpConfig, getHardcodedAdminSession, isSuperAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCustomSlug } from '@/lib/url';
import { FormSchema, formSchema } from '@/schemas/form';
import { FormElementInstance } from '../(dashboard)/_components/FormElements';
import { canAccessForm, FormAccessBlockedError, FormAccessRecord, getFormAccessErrorMessage, getAccessibleFormsWhere, getFormUserPermissions, FormUserPermissions } from '@/lib/form-access';
import { decodeResponseToken } from '@/lib/response-token';
import { redirect } from 'next/navigation';
import { sendTsplWebhookNotification } from '@/lib/webhook';

class UserNotFoundErr extends Error {}

type AccessMode = 'PUBLIC' | 'AUTHENTICATED' | 'RESTRICTED';

type FormSettingsInput = {
  accessMode: AccessMode;
  oneResponsePerUser: boolean;
  loginRequired: boolean;
  startDate?: string | null;
  endDate?: string | null;
  responseLimit?: number | null;
  allowedRoles?: Array<'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE'>;
  allowedDepartments?: number[];
  allowedBranches?: number[];
  allowedEmployees?: number[];
};

function mapFormAccessRecord(form: any): FormAccessRecord {
  return {
    id: form.id,
    userId: form.userId,
    status: form.status,
    published: form.published,
    accessMode: form.accessMode,
    loginRequired: form.loginRequired,
    oneResponsePerUser: form.oneResponsePerUser,
    startDate: form.startDate,
    endDate: form.endDate,
    responseLimit: form.responseLimit,
    submissions: form.submissions,
    allowedRoles: form.allowedRoles,
    allowedDepartments: form.allowedDepartments,
    allowedBranches: form.allowedBranches,
    allowedEmployees: form.allowedEmployees,
  };
}

function normalizeOptionalDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

/** Aggregate stats for all forms accessible to current user */
export async function GetFormStats() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getCurrentEmployee();
  const superAdmin = (await isSuperAdmin()) || Boolean(
    employee?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN'
  );

  const whereClause = await getAccessibleFormsWhere(user, employee, superAdmin);

  const stats = await prisma.form.aggregate({
    where: whereClause,
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionsRate = 0;

  if (visits > 0) {
    submissionsRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionsRate;

  return {
    visits,
    submissions,
    submissionsRate,
    bounceRate,
  };
}

/**
 * Returns real per-day counts for the last N days (default 7) for sparklines
 * scoped to forms accessible to the user.
 */
export async function GetDashboardSparklineData(days = 7) {
  const user = await getCurrentUser();
  if (!user) return null;

  const employee = await getCurrentEmployee();
  const superAdmin = (await isSuperAdmin()) || Boolean(
    employee?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN'
  );

  const whereClause = await getAccessibleFormsWhere(user, employee, superAdmin);

  // Accessible form IDs for submission filtering
  const accessibleForms = await prisma.form.findMany({
    where: whereClause,
    select: { id: true },
  });
  const formIds = accessibleForms.map((f: any) => f.id);

  // Build an array of the last `days` date strings "YYYY-MM-DD"
  const dateLabels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateLabels.push(d.toISOString().slice(0, 10));
  }

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  // Real submission counts grouped by day for accessible forms
  const rawSubmissions = await prisma.formSubmissions.findMany({
    where: {
      formId: { in: formIds },
      submittedAt: { gte: since },
    },
    select: { submittedAt: true },
  });

  const submissionMap: Record<string, number> = {};
  for (const s of rawSubmissions) {
    const key = s.submittedAt.toISOString().slice(0, 10);
    submissionMap[key] = (submissionMap[key] || 0) + 1;
  }

  // Total visits & submissions for ratio across accessible forms
  const totals = await prisma.form.aggregate({
    where: whereClause,
    _sum: { visits: true, submissions: true },
  });
  const totalVisits = totals._sum.visits || 0;
  const totalSubs = totals._sum.submissions || 0;
  const globalRatio = totalSubs > 0 && totalVisits > 0 ? totalVisits / totalSubs : 2;

  const submissionsPerDay: number[] = [];
  const visitsPerDay: number[] = [];
  const conversionPerDay: number[] = [];
  const bouncePerDay: number[] = [];

  for (const label of dateLabels) {
    const subs = submissionMap[label] || 0;
    // Estimate visits = subs * global visit/submission ratio (floored to integer)
    const visits = Math.round(subs * globalRatio);
    const conversion = visits > 0 ? parseFloat(((subs / visits) * 100).toFixed(1)) : 0;
    const bounce = parseFloat((100 - conversion).toFixed(1));

    submissionsPerDay.push(subs);
    visitsPerDay.push(visits);
    conversionPerDay.push(conversion);
    bouncePerDay.push(bounce);
  }

  return {
    labels: dateLabels,
    submissionsPerDay,
    visitsPerDay,
    conversionPerDay,
    bouncePerDay,
  };
}

export async function GetActiveBranches() {
  return await prisma.branch.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });
}

export async function CreateForm(data: FormSchema & { branchId?: number | null }) {
  const user = await getCurrentUser();
  const validation = formSchema.safeParse(data);

  if (!validation.success) {
    throw new Error('Invalid form data');
  }

  if (!user) {
    throw new UserNotFoundErr();
  }

  const { name, description, content, branchId } = data;

  // Auto-increment the name if a form with the same name already exists globally
  let uniqueName = name;
  let count = 1;
  while (true) {
    const existing = await prisma.form.findFirst({
      where: {
        name: uniqueName,
      },
    });
    if (!existing) break;
    uniqueName = `${name} (${count})`;
    count++;
  }

  // Generate unique custom slug shareUrl
  let customShareUrl = generateCustomSlug(uniqueName);
  while (true) {
    const existingShare = await prisma.form.findUnique({
      where: { shareUrl: customShareUrl },
    });
    if (!existingShare) break;
    customShareUrl = generateCustomSlug(uniqueName);
  }

  const employee = await getCurrentEmployee();
  const selectedBranchId = branchId && typeof branchId === 'number' ? branchId : (employee?.branchId || null);

  const form = await (prisma as any).form.create({
    data: {
      userId: user.id,
      name: uniqueName,
      description: description || '',
      content: content || '[]',
      accessMode: 'PUBLIC',
      loginRequired: false,
      oneResponsePerUser: false,
      status: 'DRAFT',
      published: false,
      shareUrl: customShareUrl,
      branchId: selectedBranchId,
      allowedBranches: selectedBranchId
        ? {
            create: {
              branchId: selectedBranchId,
            },
          }
        : undefined,
    },
  });

  if (!form) {
    throw new Error('Failed to create form');
  }

  return form.id;
}

async function resolveUserMap(userIds: string[]) {
  const userMap = new Map<string, { name: string; email?: string }>();

  if (!userIds || userIds.length === 0) {
    return userMap;
  }

  const idpConfig = getSuperAdminIdpConfig();
  const hardcodedAdmin = getHardcodedAdminSession();
  const adminName = `${hardcodedAdmin.firstName || 'Tech'} ${hardcodedAdmin.lastName || 'Admin'}`.trim();

  if (idpConfig.idp) {
    userMap.set(idpConfig.idp, { name: adminName, email: idpConfig.email });
  }
  if (idpConfig.email) {
    userMap.set(idpConfig.email.toLowerCase(), { name: adminName, email: idpConfig.email });
  }
  userMap.set('super_admin_seed', { name: adminName, email: idpConfig.email });

  const numericIds = userIds
    .map((id) => Number(id))
    .filter((id) => !isNaN(id) && id < 1000000);

  try {
    const employees = await (prisma as any).employee.findMany({
      where: {
        OR: [
          { clerkUserId: { in: userIds } },
          { employeeId: { in: userIds } },
          { email: { in: userIds } },
          ...(numericIds.length > 0 ? [{ id: { in: numericIds } }] : []),
        ],
      },
      select: {
        id: true,
        clerkUserId: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    for (const emp of employees) {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || emp.employeeId;
      if (emp.clerkUserId) userMap.set(emp.clerkUserId, { name: fullName, email: emp.email });
      if (emp.employeeId) userMap.set(emp.employeeId, { name: fullName, email: emp.email });
      if (emp.email) userMap.set(emp.email.toLowerCase(), { name: fullName, email: emp.email });
      userMap.set(String(emp.id), { name: fullName, email: emp.email });
    }
  } catch (error) {
    console.error('Failed to resolve employees for form creators', error);
  }

  return userMap;
}

/**
 * Helper to strictly verify user permissions on a form.
 * Ensures only Form Creator, Branch Admin (for this form's branch), Assigned Users, and Super Admin can access.
 */
export async function requireFormPermission(formId: number, level: 'VIEW' | 'EDIT' | 'DELETE' | 'MANAGE') {
  const user = await getCurrentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const employee = await getCurrentEmployee();
  const superAdmin = (await isSuperAdmin()) || Boolean(
    employee?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN'
  );

  const form = await prisma.form.findFirst({
    where: { id: formId },
    include: {
      branch: true,
      allowedBranches: true,
      allowedEmployees: true,
      formViewerAccesses: true,
    } as any,
  });

  if (!form) {
    throw new Error('Form not found');
  }

  const perms = await getFormUserPermissions(form, user, employee, superAdmin);

  if (level === 'VIEW' && !perms.canView) {
    throw new ForbiddenError('You are not authorized to view this form.');
  }
  if (level === 'EDIT' && !perms.canEdit) {
    throw new ForbiddenError('You are not authorized to edit this form.');
  }
  if (level === 'DELETE' && !perms.canDelete) {
    throw new ForbiddenError('You are not authorized to delete this form.');
  }
  if (level === 'MANAGE' && !perms.canManageCollaborators) {
    throw new ForbiddenError('You are not authorized to manage collaborators for this form.');
  }

  return { form, perms, user, employee, superAdmin };
}

/** Get forms - scoped strictly to Creator, Branch Admin, Assigned Users, and Super Admin */
export async function GetForm() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getCurrentEmployee();
  const superAdmin = (await isSuperAdmin()) || Boolean(
    employee?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN'
  );

  const whereClause = await getAccessibleFormsWhere(user, employee, superAdmin);

  let forms: any[] = [];

  try {
    forms = await (prisma as any).form.findMany({
      where: whereClause,
      include: {
        branch: true,
        allowedBranches: true,
        allowedEmployees: { include: { employee: true } },
        formViewerAccesses: { include: { employee: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (e) {
    console.warn('[GetForm] Scoped forms query error, attempting fallback:', e);
    try {
      forms = await (prisma as any).form.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (e2) {
      console.error('[GetForm] Failed fallback query:', e2);
      forms = [];
    }
  }

  const userIdsInForms = Array.from(new Set(forms.map((f: any) => f.userId).filter(Boolean)));
  const userMap = await resolveUserMap(userIdsInForms as string[]);

  if (user) {
    const curName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (curName && user.id && !userMap.has(user.id)) {
      userMap.set(user.id, { name: curName });
    }
  }

  const enrichedForms = await Promise.all(
    forms.map(async (f: any) => {
      const creator: { name: string; email?: string } = userMap.get(f.userId) ||
        userMap.get(f.userId?.toLowerCase()) ||
        { name: f.userId || 'User', email: undefined };

      const perms = await getFormUserPermissions(f, user, employee, superAdmin);

      return {
        ...f,
        user: {
          name: creator.name,
          email: creator.email,
        },
        createdByName: creator.name,
        canView: perms.canView,
        canEdit: perms.canEdit,
        canDelete: perms.canDelete,
        canManageCollaborators: perms.canManageCollaborators,
        isCreator: perms.isCreator,
        isBranchAdmin: perms.isBranchAdmin,
        isAssignedEditor: perms.isAssignedEditor,
        isAssignedViewer: perms.isAssignedViewer,
        isSuperAdmin: perms.isSuperAdmin,
      };
    })
  );

  return enrichedForms;
}

export async function GetFormById(id: number | string) {
  const numId = Number(id);
  if (!id || isNaN(numId) || numId <= 0) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const employee = await getCurrentEmployee();
  const superAdmin = (await isSuperAdmin()) || Boolean(
    employee?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN'
  );

  try {
    const form = await prisma.form.findFirst({
      where: {
        id: numId,
      },
      include: {
        branch: true,
        allowedRoles: true,
        allowedDepartments: true,
        allowedBranches: true,
        allowedEmployees: {
          include: {
            employee: true,
          },
        },
        formViewerAccesses: {
          include: {
            employee: true,
          },
        },
      } as any,
    });

    if (!form) {
      return null;
    }

    const perms = await getFormUserPermissions(form, user, employee, superAdmin);

    if (!perms.canView) {
      throw new ForbiddenError('You are not authorized to view or edit this form.');
    }

    return {
      ...form,
      canView: perms.canView,
      canEdit: perms.canEdit,
      canDelete: perms.canDelete,
      canManageCollaborators: perms.canManageCollaborators,
      isCreator: perms.isCreator,
      isBranchAdmin: perms.isBranchAdmin,
      isAssignedEditor: perms.isAssignedEditor,
      isAssignedViewer: perms.isAssignedViewer,
      isSuperAdmin: perms.isSuperAdmin,
    };
  } catch (err: any) {
    if (err instanceof ForbiddenError || err?.name === 'ForbiddenError') {
      throw err;
    }
    console.error('[GetFormById] Error querying form:', err);
    return null;
  }
}

export async function UpdateFormName(id: number, name: string) {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    throw new Error('Form name cannot be empty');
  }

  await requireFormPermission(id, 'EDIT');

  return await prisma.form.update({
    where: {
      id,
    },
    data: {
      name: trimmedName,
    },
  });
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  await requireFormPermission(id, 'EDIT');

  return await prisma.form.update({
    where: {
      id,
    },
    data: {
      content: jsonContent,
    },
  });
}

export async function UpdateFormSettings(id: number, settings: FormSettingsInput) {
  await requireFormPermission(id, 'EDIT');

  const accessMode = settings.accessMode;
  const isRestricted = accessMode === 'RESTRICTED';
  const isAuthenticated = accessMode === 'AUTHENTICATED';
  const loginRequired = accessMode === 'PUBLIC' ? false : true;
  const oneResponsePerUser = accessMode === 'PUBLIC' ? false : settings.oneResponsePerUser;

  const startDate = normalizeOptionalDate(settings.startDate ?? null);
  const endDate = normalizeOptionalDate(settings.endDate ?? null);

  return await prisma.$transaction(async (tx: any) => {
    const updatedForm = await tx.form.update({
      where: { id },
      data: {
        accessMode,
        loginRequired,
        oneResponsePerUser,
        startDate,
        endDate,
        responseLimit: settings.responseLimit ?? null,
      },
    });

    await tx.formAllowedRole.deleteMany({ where: { formId: id } });
    await tx.formAllowedDepartment.deleteMany({ where: { formId: id } });
    await tx.formAllowedBranch.deleteMany({ where: { formId: id } });
    await tx.formAllowedEmployee.deleteMany({ where: { formId: id } });

    if (isRestricted) {
      if (settings.allowedRoles?.length) {
        await tx.formAllowedRole.createMany({
          data: settings.allowedRoles.map((role) => ({ formId: id, role })),
        });
      }

      if (settings.allowedDepartments?.length) {
        await tx.formAllowedDepartment.createMany({
          data: settings.allowedDepartments.map((departmentId) => ({ formId: id, departmentId })),
        });
      }

      if (settings.allowedBranches?.length) {
        await tx.formAllowedBranch.createMany({
          data: settings.allowedBranches.map((branchId) => ({ formId: id, branchId })),
        });
      }

      if (settings.allowedEmployees?.length) {
        await tx.formAllowedEmployee.createMany({
          data: settings.allowedEmployees.map((employeeId) => ({ formId: id, employeeId })),
        });
      }
    }

    return updatedForm;
  });
}

export async function PublishForm(id: number) {
  await requireFormPermission(id, 'EDIT');

  return await prisma.form.update({
    data: {
      published: true,
      status: 'PUBLISHED',
    },
    where: {
      id,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  if (!formUrl) {
    throw new Error('Form not found');
  }

  const cleanFormUrl = decodeURIComponent(formUrl).trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const numericId = Number(cleanFormUrl);
  const isNumeric = !isNaN(numericId) && Number.isInteger(numericId) && String(numericId) === cleanFormUrl;

  const form = await prisma.form.findFirst({
    where: isNumeric
      ? {
          OR: [{ id: numericId }, { shareUrl: cleanFormUrl }],
        }
      : {
          shareUrl: cleanFormUrl,
        },
    include: {
      allowedRoles: true,
      allowedDepartments: true,
      allowedBranches: true,
      allowedEmployees: true,
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  const user = await getCurrentUser();
  const access = await canAccessForm(mapFormAccessRecord(form), user ? { id: user.id } : null);

  if (!access.allowed) {
    if (access.reason === 'login-required') {
      throw new AuthRequiredError();
    }

    throw new FormAccessBlockedError(access.reason, getFormAccessErrorMessage(access.reason));
  }

  return await prisma.form.update({
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      shareUrl: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      id: form.id,
    },
  });
}

export type SubmitFormResult = {
  success: boolean;
  error?: string;
  submissionId?: number;
};

export async function SubmitForm(formUrl: string, content: string): Promise<SubmitFormResult> {
  try {
    if (!formUrl) {
      return { success: false, error: 'Form not found.' };
    }

    const cleanFormUrl = decodeURIComponent(formUrl).trim().replace(/^\/+/, '').replace(/\/+$/, '');
    const numericId = Number(cleanFormUrl);
    const isNumeric = !isNaN(numericId) && Number.isInteger(numericId) && String(numericId) === cleanFormUrl;

    const form = await prisma.form.findFirst({
      where: isNumeric
        ? {
            OR: [{ id: numericId }, { shareUrl: cleanFormUrl }],
          }
        : {
            shareUrl: cleanFormUrl,
          },
      include: {
        allowedRoles: true,
        allowedDepartments: true,
        allowedBranches: true,
        allowedEmployees: true,
      },
    });

    if (!form) {
      return { success: false, error: 'Form not found.' };
    }

    const user = await getCurrentUser();
    const access = await canAccessForm(mapFormAccessRecord(form), user ? { id: user.id } : null);

    if (!access.allowed) {
      if (access.reason === 'login-required') {
        return { success: false, error: 'Authentication is required to submit this form. Please sign in.' };
      }
      return { success: false, error: getFormAccessErrorMessage(access.reason) };
    }

    const employee = user ? await getCurrentEmployee() : null;
    let validEmployeeId: number | null = null;

    if (employee && typeof employee.id === 'number') {
      const existingEmp = await prisma.employee.findUnique({
        where: { id: employee.id },
        select: { id: true },
      });
      if (existingEmp) {
        validEmployeeId = existingEmp.id;
      }
    }

    let targetEmployeeId = validEmployeeId;

    if (targetEmployeeId) {
      // Ensure targetEmployeeId actually exists in database to prevent Foreign Key constraint errors
      const empExists = await prisma.employee.findUnique({
        where: { id: targetEmployeeId },
        select: { id: true },
      });
      if (!empExists) {
        targetEmployeeId = null;
      }
    }

    if (targetEmployeeId) {
      const existing = await prisma.formSubmissions.findFirst({
        where: {
          formId: form.id,
          employeeId: targetEmployeeId,
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        if (form.oneResponsePerUser) {
          return { success: false, error: 'You have already submitted this form.' };
        }
        // Form permits multiple submissions, but DB has a unique constraint on (formId, employeeId):
        // Set employeeId to null so subsequent submissions are accepted without colliding with the unique index
        targetEmployeeId = null;
      }
    }

    // Create submission directly without multi-query transaction block to avoid Postgres 25P02 aborts
    const submission = await prisma.formSubmissions.create({
      data: {
        formId: form.id,
        employeeId: targetEmployeeId,
        clerkUserId: user?.id ?? null,
        content,
      },
      select: {
        id: true,
      },
    });

    // Increment submissions count safely (non-fatal if count update fails)
    try {
      await prisma.form.update({
        where: {
          id: form.id,
        },
        data: {
          submissions: {
            increment: 1,
          },
        },
      });
    } catch (countErr) {
      console.warn('[SubmitForm] Non-fatal: Failed to increment submissions count:', countErr);
    }

    // Trigger TSPL Custom Elements webhook notification (reads DISCORD_WEBHOOK_URL from .env)
    sendTsplWebhookNotification({
      formName: form.name,
      formUrl: form.shareUrl,
      submissionId: submission.id,
      formContent: form.content,
      submissionContent: content,
    }).catch((webhookErr) => {
      console.warn('[SubmitForm] Non-fatal: Webhook delivery failed:', webhookErr);
    });

    return {
      success: true,
      submissionId: submission.id,
    };
  } catch (error: any) {
    console.error('[SubmitForm Error]:', error);

    if (error?.code === 'P2002') {
      return { success: false, error: 'You have already submitted a response for this form.' };
    }

    const message = error instanceof Error ? error.message : 'Something went wrong while submitting the form. Please try again.';
    return { success: false, error: message };
  }
}

export async function GetFormSubmissions(id: number | string) {
  const numId = Number(id);
  if (!id || isNaN(numId) || numId <= 0) {
    throw new Error('Valid Form ID is required');
  }

  const { perms } = await requireFormPermission(numId, 'VIEW');

  const form = await prisma.form.findFirst({
    where: {
      id: numId,
    },
    include: {
      branch: true,
      allowedBranches: true,
      allowedEmployees: true,
      formViewerAccesses: true,
      FormSubmissions: {
        include: {
          employee: {
            include: {
              department: true,
              branch: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    } as any,
  });

  if (!form) {
    throw new Error('Form not found');
  }

  return {
    ...form,
    FormSubmissions: (form as any).FormSubmissions || [],
    canView: perms.canView,
    canEdit: perms.canEdit,
    canDelete: perms.canDelete,
    canManageCollaborators: perms.canManageCollaborators,
    isCreator: perms.isCreator,
    isBranchAdmin: perms.isBranchAdmin,
    isAssignedEditor: perms.isAssignedEditor,
    isAssignedViewer: perms.isAssignedViewer,
    isSuperAdmin: perms.isSuperAdmin,
  };
}

export async function GetFormSubmissionsByShareUrl(shareUrl: string) {
  if (!shareUrl) {
    throw new Error('Share URL is required');
  }

  const cleanShareUrl = decodeURIComponent(shareUrl).trim().replace(/^\/+/, '').replace(/\/+$/, '');

  // 1. Check if token is a randomized response token (12 to 15 chars)
  let formIdFromToken: number | null = null;
  if (cleanShareUrl.length >= 12 && cleanShareUrl.length <= 15) {
    try {
      formIdFromToken = decodeResponseToken(cleanShareUrl);
    } catch {
      formIdFromToken = null;
    }
  }

  const numericId = Number(cleanShareUrl);
  const isNumeric = !isNaN(numericId) && Number.isInteger(numericId) && String(numericId) === cleanShareUrl;

  const orConditions: any[] = [];
  if (formIdFromToken) {
    orConditions.push({ id: formIdFromToken });
  }
  if (isNumeric) {
    orConditions.push({ id: numericId });
  }
  orConditions.push({ shareUrl: cleanShareUrl });

  const form = await prisma.form.findFirst({
    where: {
      OR: orConditions,
    },
    include: {
      FormSubmissions: {
        include: {
          employee: {
            include: {
              department: true,
              branch: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  // Public responses link: anyone with the shareable responses link can view responses directly without signing in
  return {
    ...form,
    FormSubmissions: form.FormSubmissions || [],
  };
}

export async function DeleteForm(id: number) {
  await requireFormPermission(id, 'DELETE');

  return await prisma.form.deleteMany({
    where: {
      id,
    },
  });
}

export async function deleteElementInstance(id: number, elementId: string) {
  await requireFormPermission(id, 'EDIT');

  const getContent = await prisma.form.findFirst({
    where: {
      id,
    },
    select: {
      content: true,
    },
  });

  if (!getContent) return;

  const content = JSON.parse(getContent.content);

  const newContent = content.filter(
    (element: FormElementInstance) => element.id !== elementId
  );

  return await prisma.form.update({
    where: {
      id,
    },
    data: {
      content: JSON.stringify(newContent),
    },
  });
}
