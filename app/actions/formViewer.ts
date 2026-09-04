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

  // Get all active employees in organization for collaborator assignment
  const allEmployees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
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
    const generatedClerkId = `user_${cleanEmpId}_${Date.now()}`;
    employee = await prisma.employee.create({
      data: {
        clerkUserId: generatedClerkId,
        employeeId: cleanEmpId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: password?.trim() || 'Tspl123456',
        role: accessType === 'EDITOR' ? 'EDITOR' : 'FORM_VIEWER',
        status: 'ACTIVE',
      },
    });
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

