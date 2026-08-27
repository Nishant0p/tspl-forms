'use server';

import { getCurrentUser, AuthRequiredError, ForbiddenError, getCurrentEmployee } from '@/lib/auth';
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

/** Get forms - filtered strictly by user's branch if form has branch restriction */
export async function GetForm() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getCurrentEmployee();

  if (employee?.role === 'SUPER_ADMIN') {
    return await (prisma as any).form.findMany({
      include: { branch: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  if (employee?.role === 'FORM_VIEWER') {
    return await (prisma as any).form.findMany({
      where: {
        formViewerAccesses: {
          some: {
            employeeId: employee.id,
          },
        },
      },
      include: { branch: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  const userBranchId = employee?.branchId || null;

  const forms = await (prisma as any).form.findMany({
    where: {
      OR: [
        { userId: user.id },
        {
          AND: [
            { branchId: null },
            { allowedBranches: { none: {} } },
          ],
        },
        ...(userBranchId
          ? [
              { branchId: userBranchId },
              { allowedBranches: { some: { branchId: userBranchId } } },
            ]
          : []),
      ],
    },
    include: { branch: true },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return forms;
}

export async function GetFormById(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new UserNotFoundErr();
  }

  const employee = await getCurrentEmployee();

  if (employee?.role === 'FORM_VIEWER') {
    const hasAccess = await (prisma as any).formViewerAccess.findUnique({
      where: {
        formId_employeeId: {
          formId: id,
          employeeId: employee.id,
        },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenError('You are not authorized to view this form.');
    }
  }

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    include: {
      allowedRoles: true,
      allowedDepartments: true,
      allowedBranches: true,
      allowedEmployees: true,
    },
  });

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

  if (employee?.role === 'FORM_VIEWER') {
    const hasAccess = await (prisma as any).formViewerAccess.findUnique({
      where: {
        formId_employeeId: {
          formId: id,
          employeeId: employee.id,
        },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenError('You are not authorized to view submissions for this form.');
    }
  }

  const form = await prisma.form.findFirst({
    where: {
      id,
    },
    include: {
      allowedBranches: true,
      FormSubmissions: {
        include: {
          employee: {
            include: {
              department: true,
              branch: true,
            },
          },
        },
      },
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  // Branch access enforcement for submissions
  if (employee && employee.role !== 'SUPER_ADMIN' && form.userId !== user.id) {
    const isRestrictedBranch = (form as any).branchId !== null || (form.allowedBranches && form.allowedBranches.length > 0);
    if (isRestrictedBranch) {
      const isAllowedBranch =
        (form as any).branchId === employee.branchId ||
        form.allowedBranches.some((b) => b.branchId === employee.branchId);

      if (!isAllowedBranch) {
        throw new ForbiddenError('You are not authorized to view responses for this branch-restricted form.');
      }
    }
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
