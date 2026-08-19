'use server';

import { requireSuperAdmin, EmployeeRole, EmployeeStatus } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CreateAdminInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  employeeId: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  departmentId?: number | null;
  branchId?: number | null;
};

export async function getAdminsList() {
  await requireSuperAdmin();

  const admins = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      department: true,
      branch: true,
    },
  });

  return admins;
}

export async function createAdminUser(data: CreateAdminInput) {
  await requireSuperAdmin();

  if (!data.firstName || !data.lastName || !data.email || !data.employeeId) {
    throw new Error('First Name, Last Name, Email, and Employee ID are required');
  }

  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new Error('An admin or employee with this email already exists');
  }

  const existingEmpId = await prisma.employee.findUnique({
    where: { employeeId: data.employeeId.trim() },
  });
  if (existingEmpId) {
    throw new Error('An admin or employee with this Employee ID already exists');
  }

  const generatedClerkId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const created = await prisma.employee.create({
    data: {
      clerkUserId: generatedClerkId,
      employeeId: data.employeeId.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
      phone: data.phone?.trim() || null,
      role: data.role,
      status: data.status,
      departmentId: data.departmentId || null,
      branchId: data.branchId || null,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  return created;
}

export async function updateAdminRoleAndStatus(
  id: number,
  role: EmployeeRole,
  status: EmployeeStatus
) {
  await requireSuperAdmin();

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      role,
      status,
    },
  });

  // Revalidate layout and all paths immediately so permission changes take effect in real-time
  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  revalidatePath('/form-requests');
  return updated;
}

export async function updateAdminPassword(id: number, newPassword: string) {
  await requireSuperAdmin();

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      password: newPassword.trim(),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  return updated;
}

export async function deleteAdminUser(id: number) {
  await requireSuperAdmin();

  const deleted = await prisma.employee.delete({
    where: { id },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  return deleted;
}
