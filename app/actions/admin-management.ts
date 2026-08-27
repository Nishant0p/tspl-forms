'use server';

import { getCurrentEmployee, requireEmployee, ForbiddenError, EmployeeRole, EmployeeStatus } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const ALLOWED_ADMIN_CREATED_ROLES: EmployeeRole[] = [
  'HR',
  'MANAGER',
  'EDITOR',
  'EMPLOYEE',
  'FORM_VIEWER',
];

export type CreateManagedUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  employeeId: string;
  role: EmployeeRole;
  departmentId?: number | null;
};

export async function getAdminDashboardData() {
  const caller = await requireEmployee();

  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Only Admins or Super Admins can access the Admin Dashboard.');
  }

  // Get caller's full profile including branch and department
  const adminProfile = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: typeof caller.id === 'number' && caller.id < 1000000 ? caller.id : -1 },
        { employeeId: caller.employeeId },
        { email: caller.email?.toLowerCase() },
      ],
    },
    include: {
      branch: true,
      department: true,
    },
  });

  const branchId = adminProfile?.branchId || caller.branchId || null;

  // Filter users: if ADMIN, strictly show ONLY users created by this admin (excluding other admins)
  let whereCondition: any = {};
  if (caller.role === 'ADMIN') {
    const adminDbId = adminProfile?.id;
    if (adminDbId) {
      whereCondition = {
        createdById: adminDbId,
        role: { notIn: ['SUPER_ADMIN', 'ADMIN'] },
      };
    } else {
      whereCondition = {
        id: -1, // No users if admin profile is not found
      };
    }
  }

  const users = await prisma.employee.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
      department: true,
      branch: true,
      createdBy: true,
    } as any,
  });

  const departments = await prisma.department.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return {
    adminInfo: {
      id: adminProfile?.id || caller.id,
      name: `${caller.firstName} ${caller.lastName}`,
      email: caller.email,
      role: caller.role,
      branch: adminProfile?.branch || (caller as any).branch || null,
      branchId,
    },
    users,
    departments,
  };
}

export async function createAdminManagedUser(data: CreateManagedUserInput) {
  const caller = await requireEmployee();

  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied: Only Admins can create team users.');
  }

  // Validate inputs
  if (!data.firstName || !data.lastName || !data.email || !data.employeeId) {
    throw new Error('First Name, Last Name, Email, and Employee ID are required');
  }

  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Enforce allowed roles for ADMIN creator
  if (caller.role === 'ADMIN' && !ALLOWED_ADMIN_CREATED_ROLES.includes(data.role)) {
    throw new Error(`Admins can only create roles: ${ALLOWED_ADMIN_CREATED_ROLES.join(', ')}`);
  }

  // Check unique email and employeeId
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanEmpId = data.employeeId.trim();

  const existingEmail = await prisma.employee.findFirst({
    where: { email: cleanEmail },
  });
  if (existingEmail) {
    throw new Error('An employee with this email address already exists.');
  }

  const existingEmpId = await prisma.employee.findUnique({
    where: { employeeId: cleanEmpId },
  });
  if (existingEmpId) {
    throw new Error('An employee with this Employee ID already exists.');
  }

  // Get creator DB employee record
  const creatorDb = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: typeof caller.id === 'number' && caller.id < 1000000 ? caller.id : -1 },
        { employeeId: caller.employeeId },
        { email: caller.email?.toLowerCase() },
      ],
    },
  });

  // AUTOMATIC BRANCH ASSIGNMENT: Created user gets the Admin's branch automatically
  const autoBranchId = creatorDb?.branchId || caller.branchId || null;
  const createdById = creatorDb?.id || null;

  const generatedClerkId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const created = await (prisma.employee as any).create({
    data: {
      clerkUserId: generatedClerkId,
      employeeId: cleanEmpId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      password: data.password.trim(),
      phone: data.phone?.trim() || null,
      role: data.role,
      status: 'ACTIVE',
      departmentId: data.departmentId || null,
      branchId: autoBranchId, // Automatic branch lock
      createdById: createdById, // Created under this Admin
    } as any,
    include: {
      department: true,
      branch: true,
      createdBy: true,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  revalidatePath('/employees');
  revalidatePath('/dashboard');

  return created;
}

export async function updateAdminManagedUserRoleAndStatus(
  id: number,
  role: EmployeeRole,
  status: EmployeeStatus
) {
  const caller = await requireEmployee();

  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied.');
  }

  if (caller.role === 'ADMIN' && !ALLOWED_ADMIN_CREATED_ROLES.includes(role)) {
    throw new Error(`Admins can only assign roles: ${ALLOWED_ADMIN_CREATED_ROLES.join(', ')}`);
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      role,
      status,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  revalidatePath('/employees');
  return updated;
}

export async function updateAdminManagedUserPassword(id: number, newPassword: string) {
  const caller = await requireEmployee();

  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied.');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      password: newPassword.trim(),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  return updated;
}

export async function getAvailableFormsForAssignment() {
  const caller = await requireEmployee();
  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied.');
  }

  const forms = await prisma.form.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      published: true,
      status: true,
    },
  });

  return forms;
}

export async function getUserFormAssignments(employeeId: number) {
  const caller = await requireEmployee();
  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied.');
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, role: true },
  });

  if (!employee) return [];

  if (employee.role === 'FORM_VIEWER') {
    const accesses = await (prisma as any).formViewerAccess.findMany({
      where: { employeeId },
      select: { formId: true },
    });
    return accesses.map((a: any) => a.formId);
  } else {
    const accesses = await (prisma as any).formAllowedEmployee.findMany({
      where: { employeeId },
      select: { formId: true },
    });
    return accesses.map((a: any) => a.formId);
  }
}

export async function updateUserFormAssignments(employeeId: number, formIds: number[]) {
  const caller = await requireEmployee();
  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied.');
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, role: true },
  });

  if (!employee) throw new Error('Employee not found.');

  await prisma.$transaction(async (tx: any) => {
    if (employee.role === 'FORM_VIEWER') {
      await tx.formViewerAccess.deleteMany({ where: { employeeId } });
      if (formIds.length > 0) {
        await tx.formViewerAccess.createMany({
          data: formIds.map((formId) => ({ formId, employeeId })),
        });
      }
    } else {
      await tx.formAllowedEmployee.deleteMany({ where: { employeeId } });
      if (formIds.length > 0) {
        await tx.formAllowedEmployee.createMany({
          data: formIds.map((formId) => ({ formId, employeeId })),
        });
      }
    }
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}
