'use server';

import prisma from '@/lib/prisma';
import { requireEmployee, getCurrentEmployee, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function formatTsplEmployeeId(id: string): string {
  let clean = (id || '').trim().toUpperCase();
  if (!clean.startsWith('TSPL')) {
    clean = `TSPL${clean}`;
  }
  return clean;
}

export type FormCollaboratorUser = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department?: { name: string } | null;
  branch?: { name: string } | null;
};

export async function getFormCollaborators(formId: number) {
  const current = await requireEmployee();

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      name: true,
      userId: true,
      shareUrl: true,
    },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  // Get editors
  const editorAccesses = await (prisma as any).formAllowedEmployee.findMany({
    where: { formId },
    include: {
      employee: {
        include: {
          department: true,
          branch: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get viewers
  const viewerAccesses = await (prisma as any).formViewerAccess.findMany({
    where: { formId },
    include: {
      employee: {
        include: {
          department: true,
          branch: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Defensive lookup of current user in DB to ensure exact integer id, createdById, branchId, and role
  const currentDb: any = await (prisma.employee as any).findFirst({
    where: {
      OR: [
        { id: typeof current.id === 'number' && current.id < 1000000 ? current.id : -1 },
        { clerkUserId: String(current.id || '') },
        { employeeId: String(current.employeeId || current.id || '') },
        { email: current.email ? String(current.email).toLowerCase() : '' },
      ].filter(Boolean) as any,
    },
    select: {
      id: true,
      role: true,
      createdById: true,
      branchId: true,
    },
  });

  const activeRole = currentDb?.role || current.role;
  const activeId = currentDb?.id ?? (typeof current.id === 'number' && current.id < 1000000 ? current.id : null);
  const activeCreatedById = currentDb?.createdById ?? (current as any).createdById ?? null;
  const activeBranchId = currentDb?.branchId ?? current.branchId ?? null;

  // Resolve target admin who created this team ("own team member who created by same admin")
  let targetAdminId: number | null = null;
  let targetBranchId: number | null = activeBranchId;

  if (activeRole === 'ADMIN' && activeId) {
    targetAdminId = activeId;
  } else if (activeCreatedById) {
    targetAdminId = activeCreatedById;
  } else {
    // If caller has no createdById (e.g. SUPER_ADMIN or root admin), check the form owner
    const formOwner: any = await (prisma.employee as any).findFirst({
      where: {
        OR: [
          { clerkUserId: form.userId },
          { employeeId: form.userId },
        ],
      },
      select: {
        id: true,
        role: true,
        createdById: true,
        branchId: true,
      },
    });

    if (formOwner) {
      if (formOwner.role === 'ADMIN') {
        targetAdminId = formOwner.id;
        targetBranchId = formOwner.branchId || targetBranchId;
      } else if (formOwner.createdById) {
        targetAdminId = formOwner.createdById;
        targetBranchId = formOwner.branchId || targetBranchId;
      }
    }
  }

  let employeeWhere: any = {
    status: 'ACTIVE',
    ...(activeId ? { id: { not: activeId } } : {}),
  };

  if (targetAdminId) {
    const orConditions: any[] = [
      { createdById: targetAdminId },
    ];

    // If caller is an editor/employee (not the admin), also include the admin themselves
    if (activeId !== targetAdminId) {
      orConditions.push({ id: targetAdminId });
    }

    // If target admin has a branch, also allow branch members with createdById null (legacy)
    if (targetBranchId) {
      orConditions.push({
        branchId: targetBranchId,
        createdById: null,
        role: { notIn: ['SUPER_ADMIN'] },
      });
    }

    employeeWhere = {
      ...employeeWhere,
      OR: orConditions,
    };
  } else if (activeRole !== 'SUPER_ADMIN') {
    employeeWhere = {
      ...employeeWhere,
      OR: [
        ...(activeId ? [{ createdById: activeId }] : []),
        ...(targetBranchId ? [{ branchId: targetBranchId }] : []),
      ],
    };
  }

  // Get own team members who were created by the same admin
  const allEmployees = await (prisma.employee as any).findMany({
    where: employeeWhere,
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      department: { select: { name: true } },
      branch: { select: { name: true } },
    },
    orderBy: { firstName: 'asc' },
  });

  return {
    form,
    editors: editorAccesses.map((a: any) => a.employee).filter(Boolean),
    viewers: viewerAccesses.map((a: any) => a.employee).filter(Boolean),
    allEmployees,
  };
}

export async function assignFormCollaborator(
  formId: number,
  employeeId: number,
  accessType: 'EDITOR' | 'VIEWER'
) {
  await requireEmployee();

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  await prisma.$transaction(async (tx: any) => {
    if (accessType === 'EDITOR') {
      // Remove from viewers if exists
      await tx.formViewerAccess.deleteMany({
        where: { formId, employeeId },
      });
      // Add to editors (FormAllowedEmployee)
      await tx.formAllowedEmployee.upsert({
        where: {
          formId_employeeId: { formId, employeeId },
        },
        create: { formId, employeeId },
        update: {},
      });
    } else {
      // Remove from editors if exists
      await tx.formAllowedEmployee.deleteMany({
        where: { formId, employeeId },
      });
      // Add to viewers (FormViewerAccess)
      await tx.formViewerAccess.upsert({
        where: {
          formId_employeeId: { formId, employeeId },
        },
        create: { formId, employeeId },
        update: {},
      });
    }
  });

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');
  revalidatePath(`/forms/${formId}`);
  revalidatePath(`/builder/${formId}`);
  return { success: true };
}

export async function removeFormCollaborator(formId: number, employeeId: number) {
  await requireEmployee();

  await prisma.$transaction(async (tx: any) => {
    await tx.formAllowedEmployee.deleteMany({
      where: { formId, employeeId },
    });
    await tx.formViewerAccess.deleteMany({
      where: { formId, employeeId },
    });
  });

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');
  revalidatePath(`/forms/${formId}`);
  revalidatePath(`/builder/${formId}`);
  return { success: true };
}

export async function createAndAssignNewCollaborator(data: {
  formId: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  password?: string;
  accessType: 'EDITOR' | 'VIEWER';
}) {
  const current = await requireEmployee();

  const { formId, firstName, lastName, email, employeeId, password, accessType } = data;

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanEmpId = formatTsplEmployeeId(employeeId);

  // Find or create employee
  let employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeId: cleanEmpId },
        { email: cleanEmail },
      ],
    },
  });

  if (!employee) {
    // Defensive lookup of current user in DB to ensure exact integer id, createdById, branchId, and role
    const currentDb: any = await (prisma.employee as any).findFirst({
      where: {
        OR: [
          { id: typeof current.id === 'number' && current.id < 1000000 ? current.id : -1 },
          { clerkUserId: String(current.id || '') },
          { employeeId: String(current.employeeId || current.id || '') },
          { email: current.email ? String(current.email).toLowerCase() : '' },
        ].filter(Boolean) as any,
      },
      select: { id: true, role: true, createdById: true, branchId: true },
    });

    const activeRole = currentDb?.role || current.role;
    const activeId = currentDb?.id ?? (typeof current.id === 'number' && current.id < 1000000 ? current.id : null);
    const activeCreatedById = currentDb?.createdById ?? (current as any).createdById ?? null;
    const activeBranchId = currentDb?.branchId ?? current.branchId ?? null;

    // Resolve target admin and branch so newly created team member is linked to the same admin
    let targetAdminId: number | null = null;
    let targetBranchId: number | null = activeBranchId;

    if (activeRole === 'ADMIN' && activeId) {
      targetAdminId = activeId;
    } else if (activeCreatedById) {
      targetAdminId = activeCreatedById;
    } else {
      const formOwner: any = await (prisma.employee as any).findFirst({
        where: {
          OR: [
            { clerkUserId: form.userId },
            { employeeId: form.userId },
          ],
        },
        select: { id: true, role: true, createdById: true, branchId: true },
      });

      if (formOwner) {
        targetAdminId = formOwner.role === 'ADMIN' ? formOwner.id : (formOwner.createdById || null);
        targetBranchId = formOwner.branchId || targetBranchId;
      }
    }

    const generatedClerkId = `user_${cleanEmpId}_${Date.now()}`;
    employee = await (prisma.employee as any).create({
      data: {
        clerkUserId: generatedClerkId,
        employeeId: cleanEmpId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: password?.trim() || 'Tspl123456',
        role: accessType === 'EDITOR' ? 'EDITOR' : 'FORM_VIEWER',
        status: 'ACTIVE',
        createdById: targetAdminId,
        branchId: targetBranchId,
      } as any,
    });
  }

  if (!employee) {
    throw new Error('Failed to find or create employee');
  }

  await assignFormCollaborator(formId, employee.id, accessType);

  return { success: true, employee };
}

// Backwards compatibility aliases
export const createFormViewerUser = createAndAssignNewCollaborator;
export const getFormViewers = async (formId: number) => {
  const res = await getFormCollaborators(formId);
  return res.viewers;
};
export const removeFormViewerAccess = removeFormCollaborator;

