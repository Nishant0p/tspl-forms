'use server';

import { getCurrentUser, AuthRequiredError, ForbiddenError, getCurrentEmployee, getSuperAdminIdpConfig, getHardcodedAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCustomSlug } from '@/lib/url';
import { FormSchema, formSchema } from '@/schemas/form';
import { FormElementInstance } from '../(dashboard)/_components/FormElements';
import { canAccessForm, FormAccessBlockedError, FormAccessRecord, getFormAccessErrorMessage } from '@/lib/form-access';
import { redirect } from 'next/navigation';

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

/** Aggregate stats globally for all forms across the platform */
export async function GetFormStats() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const stats = await prisma.form.aggregate({
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
 * Returns real per-day counts for the last N days (default 7) for sparklines.
 * submissionsPerDay  — from FormSubmissions.submittedAt
 * visitsPerDay       — estimated: total visits spread weighted by submission activity
 * conversionPerDay   — submissions / estimated visits * 100
 * bouncePerDay       — 100 - conversionPerDay
 */
export async function GetDashboardSparklineData(days = 7) {
  const user = await getCurrentUser();
  if (!user) return null;

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

  // Real submission counts grouped by day
  const rawSubmissions = await prisma.formSubmissions.findMany({
    where: { submittedAt: { gte: since } },
    select: { submittedAt: true },
  });

  const submissionMap: Record<string, number> = {};
  for (const s of rawSubmissions) {
    const key = s.submittedAt.toISOString().slice(0, 10);
    submissionMap[key] = (submissionMap[key] || 0) + 1;
  }

  // Total visits & submissions for ratio
  const totals = await prisma.form.aggregate({
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

  const selectedBranchId = branchId && typeof branchId === 'number' ? branchId : null;

  const form = await (prisma as any).form.create({
    data: {
      userId: user.id,
      name: uniqueName,
      description: description || '',
      content: content || '[]',
      accessMode: selectedBranchId ? 'RESTRICTED' : 'PUBLIC',
      loginRequired: selectedBranchId ? true : false,
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

/** Get forms - scoped strictly to Creator, Super Admin, and explicit Editors / Viewers */
export async function GetForm() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getCurrentEmployee();

  let forms: any[] = [];

  // Super Admin can view all forms
  if (employee?.role === 'SUPER_ADMIN') {
    forms = await (prisma as any).form.findMany({
      include: {
        branch: true,
        allowedEmployees: { include: { employee: true } },
        formViewerAccesses: { include: { employee: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else {
    // Collect all possible caller identifiers for matching creator
    const userIds: string[] = [user.id];
    if (employee?.clerkUserId) userIds.push(employee.clerkUserId);
    if (employee?.employeeId) userIds.push(employee.employeeId);
    if (employee?.email) userIds.push(employee.email.toLowerCase());
    if (typeof employee?.id === 'number' && employee.id < 1000000) userIds.push(String(employee.id));

    const empDbId = typeof employee?.id === 'number' && employee.id < 1000000 ? employee.id : null;

    forms = await (prisma as any).form.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          ...(empDbId
            ? [
                { allowedEmployees: { some: { employeeId: empDbId } } },
                { formViewerAccesses: { some: { employeeId: empDbId } } },
              ]
            : []),
        ],
      },
      include: {
        branch: true,
        allowedEmployees: { include: { employee: true } },
        formViewerAccesses: { include: { employee: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  const userIdsInForms = Array.from(new Set(forms.map((f: any) => f.userId).filter(Boolean)));
  const userMap = await resolveUserMap(userIdsInForms as string[]);

  if (user) {
    const curName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (curName && user.id && !userMap.has(user.id)) {
      userMap.set(user.id, { name: curName });
    }
  }

  return forms.map((f: any) => {
    const creator: { name: string; email?: string } = userMap.get(f.userId) ||
      userMap.get(f.userId?.toLowerCase()) ||
      { name: f.userId || 'User', email: undefined };

    return {
      ...f,
      user: {
        name: creator.name,
        email: creator.email,
      },
      createdByName: creator.name,
    };
  });
}

export async function GetFormById(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const employee = await getCurrentEmployee();

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    include: {
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

  if (employee?.role === 'SUPER_ADMIN') {
    return form;
  }

  // Check creator
  const userIds: string[] = [user.id];
  if (employee?.clerkUserId) userIds.push(employee.clerkUserId);
  if (employee?.employeeId) userIds.push(employee.employeeId);
  if (employee?.email) userIds.push(employee.email.toLowerCase());
  if (typeof employee?.id === 'number' && employee.id < 1000000) userIds.push(String(employee.id));

  const isCreator = userIds.includes(form.userId);
  const empDbId = typeof employee?.id === 'number' && employee.id < 1000000 ? employee.id : null;
  const isAllowedEditor = empDbId && (form as any).allowedEmployees?.some((ae: any) => ae.employeeId === empDbId);
  const isAllowedViewer = empDbId && (form as any).formViewerAccesses?.some((va: any) => va.employeeId === empDbId);

  if (!isCreator && !isAllowedEditor && !isAllowedViewer) {
    throw new ForbiddenError('You are not authorized to view or edit this form.');
  }

  return form;
}

export async function UpdateFormName(id: number, name: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const trimmedName = name?.trim();
  if (!trimmedName) {
    throw new Error('Form name cannot be empty');
  }

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

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
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

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
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

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
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

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
  const user = await getCurrentUser();

  const form = await prisma.form.findUnique({
    where: {
      shareUrl: formUrl,
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

  const access = await canAccessForm(mapFormAccessRecord(form), user ? { id: user.id } : null);

  if (!access.allowed) {
    if (access.reason === 'login-required') {
      throw new AuthRequiredError();
    }

    throw new FormAccessBlockedError(access.reason, getFormAccessErrorMessage(access.reason));
  }

  return await prisma.form.update({
    select: {
      name: true,
      description: true,
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareUrl: formUrl,
    },
  });
}

export async function SubmitForm(formUrl: string, content: string) {
  const user = await getCurrentUser();

  const form = await prisma.form.findUnique({
    where: {
      shareUrl: formUrl,
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

  const access = await canAccessForm(mapFormAccessRecord(form), user ? { id: user.id } : null);

  if (!access.allowed) {
    if (access.reason === 'login-required') {
      throw new AuthRequiredError();
    }

    throw new FormAccessBlockedError(access.reason, getFormAccessErrorMessage(access.reason));
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

  if (form.oneResponsePerUser && validEmployeeId) {
    const duplicate = await prisma.formSubmissions.findFirst({
      where: {
        formId: form.id,
        employeeId: validEmployeeId,
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      throw new ForbiddenError('You have already submitted this form');
    }
  }

  try {
    return await prisma.$transaction(async (tx: any) => {
      const updatedForm = await tx.form.update({
        where: {
          id: form.id,
        },
        data: {
          submissions: {
            increment: 1,
          },
        },
      });

      const submission = await tx.formSubmissions.create({
        data: {
          formId: form.id,
          employeeId: validEmployeeId,
          clerkUserId: user?.id ?? null,
          content,
        },
      });

      return {
        form: updatedForm,
        submission,
      };
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new ForbiddenError('Duplicate submission');
    }

    throw error;
  }
}

export async function GetFormSubmissions(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const employee = await getCurrentEmployee();

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    include: {
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

  if (employee?.role === 'SUPER_ADMIN') {
    return form;
  }

  // Check creator or explicit permissions
  const userIds: string[] = [user.id];
  if (employee?.clerkUserId) userIds.push(employee.clerkUserId);
  if (employee?.employeeId) userIds.push(employee.employeeId);
  if (employee?.email) userIds.push(employee.email.toLowerCase());
  if (typeof employee?.id === 'number' && employee.id < 1000000) userIds.push(String(employee.id));

  const isCreator = userIds.includes(form.userId);
  const empDbId = typeof employee?.id === 'number' && employee.id < 1000000 ? employee.id : null;
  const isAllowedEditor = empDbId && (form as any).allowedEmployees?.some((ae: any) => ae.employeeId === empDbId);
  const isAllowedViewer = empDbId && (form as any).formViewerAccesses?.some((va: any) => va.employeeId === empDbId);

  if (!isCreator && !isAllowedEditor && !isAllowedViewer) {
    throw new ForbiddenError('You are not authorized to view submissions for this form.');
  }

  return form;
}

export async function DeleteForm(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.deleteMany({
    where: {
      id,
    },
  });
}

export async function deleteElementInstance(id: number, elementId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

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
