'use server';

import prisma from '@/lib/prisma';
import { requireEmployee, ForbiddenError, getSuperAdminIdpConfig, getHardcodedAdminSession, EmployeeStatus, authenticateCredentials } from '@/lib/auth';
import { verifyCsrfToken } from '@/lib/csrf';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function loginUser(
  emailOrEmpId: string,
  password: string
): Promise<LoginResult> {
  try {
    const authResult = await authenticateCredentials(emailOrEmpId, password);

    if (!authResult.success || !authResult.sessionData) {
      return {
        success: false,
        error: authResult.error || 'Invalid email/Employee ID or password',
      };
    }

    const sessionData = JSON.stringify(authResult.sessionData);

    cookies().set('session_user', sessionData, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[loginUser] Unexpected error in sign-in action:', err);
    return { success: false, error: err?.message || 'Authentication error occurred' };
  }
}

export async function logoutUser() {
  cookies().delete('session_user');
  redirect('/sign-in');
}

export async function createEmployee(data: {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  departmentId?: number;
  branchId?: number;
}) {
  const caller = await requireEmployee();

  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN' && caller.role !== 'HR') {
    throw new ForbiddenError('Only HR, Admin, or Super Admin can create employees');
  }

  let formattedEmpId = (data.employeeId || '').trim().toUpperCase();
  if (!formattedEmpId.startsWith('TSPL')) {
    formattedEmpId = `TSPL${formattedEmpId}`;
  }

  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new Error('An employee with this email already exists');
  }

  const existingEmpId = await prisma.employee.findUnique({
    where: { employeeId: formattedEmpId },
  });
  if (existingEmpId) {
    throw new Error(`An employee with Employee ID "${formattedEmpId}" already exists`);
  }

  const generatedId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const creatorDb = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: typeof caller.id === 'number' && caller.id < 1000000 ? caller.id : -1 },
        { employeeId: caller.employeeId },
        { email: caller.email?.toLowerCase() },
      ],
    },
  });

  const assignedBranchId = data.branchId || creatorDb?.branchId || caller.branchId || null;
  const createdById = creatorDb?.id || null;

  const created = await (prisma.employee as any).create({
    data: {
      clerkUserId: generatedId,
      employeeId: formattedEmpId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password?.trim() || null,
      phone: data.phone?.trim() || null,
      role: (data.role || 'EMPLOYEE') as any,
      status: 'ACTIVE',
      departmentId: data.departmentId || null,
      branchId: assignedBranchId,
      createdById: createdById,
    } as any,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/employees');
  revalidatePath('/admin');
  return created;
}

export async function updateEmployeeStatus(id: number, status: EmployeeStatus) {
  const caller = await requireEmployee();
  if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN' && caller.role !== 'HR') {
    throw new ForbiddenError('Access denied');
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/employees');
  revalidatePath(`/employees/${id}`);
  return updated;
}

export async function getEmployeesList() {
  await requireEmployee();

  const employees = await prisma.employee.findMany({
    orderBy: { employeeId: 'asc' },
    include: {
      department: true,
      branch: true,
    },
  });

  employees.sort((a: any, b: any) =>
    (a.employeeId || '').localeCompare(b.employeeId || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );

  return employees;
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  departmentId?: number | null;
  branchId?: number | null;
}) {
  const employee = await requireEmployee();

  const updateData: any = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
  if (data.branchId !== undefined) updateData.branchId = data.branchId;

  // Search for existing employee in DB by ID, clerkUserId, employeeId, or email
  const searchConditions: any[] = [];
  if (typeof employee.id === 'number' && employee.id < 1000000) {
    searchConditions.push({ id: employee.id });
  }
  if ((employee as any).clerkUserId) {
    searchConditions.push({ clerkUserId: (employee as any).clerkUserId });
  }
  if (employee.employeeId) {
    searchConditions.push({ employeeId: employee.employeeId });
  }
  if (employee.email) {
    searchConditions.push({ email: employee.email.toLowerCase() });
  }

  let dbEmployee = null;
  if (searchConditions.length > 0) {
    dbEmployee = await prisma.employee.findFirst({
      where: {
        OR: searchConditions,
      },
    });
  }

  let updated: any;

  if (dbEmployee) {
    updated = await prisma.employee.update({
      where: { id: dbEmployee.id },
      data: updateData,
      include: { department: true, branch: true },
    });
  } else {
    // If no DB record exists yet (e.g. for hardcoded Super Admin session), create one
    const clerkId = (employee as any).clerkUserId || employee.employeeId || `admin_${Date.now()}`;
    const empId = employee.employeeId || (employee as any).clerkUserId || `ADMIN001`;

    updated = await (prisma.employee as any).create({
      data: {
        clerkUserId: clerkId,
        employeeId: empId,
        firstName: data.firstName?.trim() || employee.firstName || 'Super',
        lastName: data.lastName?.trim() || employee.lastName || 'Admin',
        email: employee.email?.toLowerCase() || 'admin@tspl.in',
        role: (employee.role || 'SUPER_ADMIN') as any,
        status: 'ACTIVE',
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : employee.imageUrl,
        departmentId: data.departmentId || null,
        branchId: data.branchId || null,
      } as any,
      include: { department: true, branch: true },
    });
  }

  // Refresh session cookie
  const sessionData = JSON.stringify({
    id: updated.clerkUserId || updated.employeeId,
    employeeId: updated.employeeId,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    role: updated.role,
    status: updated.status,
    imageUrl: updated.imageUrl || null,
    departmentId: updated.departmentId || null,
    branchId: updated.branchId || null,
  });

  cookies().set('session_user', sessionData, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath('/', 'layout');
  return updated;
}

export async function getDepartmentsAndBranches() {
  const departments = await prisma.department.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
  const branches = await prisma.branch.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return { departments, branches };
}
