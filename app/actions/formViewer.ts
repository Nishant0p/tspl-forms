'use server';

import prisma from '@/lib/prisma';
import { getCurrentEmployee, requireEmployee } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createFormViewerUser(data: {
  formId: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}) {
  const current = await requireEmployee();

  // Only Admin, Super Admin, HR, or Editor can assign form viewers
  if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'HR'].includes(current.role)) {
    throw new Error('Unauthorized to manage form viewers');
  }

  const { formId, employeeId, firstName, lastName, email, password } = data;

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form) {
    throw new Error('Form not found');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanEmpId = employeeId.trim();

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
    employee = await prisma.employee.create({
      data: {
        clerkUserId: `viewer_${cleanEmpId}_${Date.now()}`,
        employeeId: cleanEmpId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: password || 'Viewer123!',
        role: 'FORM_VIEWER',
        status: 'ACTIVE',
      },
    });
  } else if (employee.role === 'EMPLOYEE') {
    // Elevate or update role to FORM_VIEWER if needed
    employee = await prisma.employee.update({
      where: { id: employee.id },
      data: { role: 'FORM_VIEWER' },
    });
  }

  // Assign access to formViewerAccess
  await prisma.formViewerAccess.upsert({
    where: {
      formId_employeeId: {
        formId,
        employeeId: employee.id,
      },
    },
    create: {
      formId,
      employeeId: employee.id,
    },
    update: {},
  });

  revalidatePath(`/forms/${formId}`);
  return { success: true, employee };
}

export async function getFormViewers(formId: number) {
  const current = await requireEmployee();

  if (!current) {
    throw new Error('Unauthorized');
  }

  const viewers = await prisma.formViewerAccess.findMany({
    where: { formId },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return viewers.map((v: { employee: any }) => v.employee);
}

export async function removeFormViewerAccess(formId: number, employeeId: number) {
  const current = await requireEmployee();

  if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'HR'].includes(current.role)) {
    throw new Error('Unauthorized');
  }

  await prisma.formViewerAccess.deleteMany({
    where: {
      formId,
      employeeId,
    },
  });

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}
