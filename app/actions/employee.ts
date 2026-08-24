'use server';

import prisma from '@/lib/prisma';
import { requireEmployee, ForbiddenError, getSuperAdminIdpConfig, getHardcodedAdminSession, EmployeeStatus } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(emailOrEmpId: string, password: string) {
  const idpConfig = getSuperAdminIdpConfig();
  const inputClean = emailOrEmpId.trim().toLowerCase();

  // 1. Check process.env Super Admin IDP credentials (strictly from .env)
  if (
    idpConfig.idp &&
    idpConfig.email &&
    idpConfig.password &&
    (inputClean === idpConfig.email || inputClean === idpConfig.idp.toLowerCase()) &&
    password === idpConfig.password
  ) {
    const adminSession = getHardcodedAdminSession();
    if (adminSession) {
      const sessionData = JSON.stringify({
        id: adminSession.employeeId,
        employeeId: adminSession.employeeId,
        firstName: adminSession.firstName,
        lastName: adminSession.lastName,
        email: adminSession.email,
        role: adminSession.role,
        status: adminSession.status,
        imageUrl: adminSession.imageUrl,
      });

      cookies().set('session_user', sessionData, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return { success: true };
    }
  }

  // 2. Lookup in database by email or employeeId
  const db = prisma as any;
  const employee = await db.employee.findFirst({
    where: {
      OR: [
        { email: inputClean },
        { employeeId: emailOrEmpId.trim() },
      ],
    },
  });

  if (!employee) {
    throw new Error('Invalid credentials');
  }

  if (employee.status !== 'ACTIVE') {
    throw new Error('Your account is inactive or suspended');
  }

  if (employee.password && employee.password !== password) {
    throw new Error('Invalid credentials');
  }

  const sessionData = JSON.stringify({
    id: employee.clerkUserId || employee.employeeId,
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    status: employee.status,
    imageUrl: employee.imageUrl,
  });

  cookies().set('session_user', sessionData, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
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

  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new Error('An employee with this email already exists');
  }

  const existingEmpId = await prisma.employee.findUnique({
    where: { employeeId: data.employeeId.trim() },
  });
  if (existingEmpId) {
    throw new Error('An employee with this Employee ID already exists');
  }

  const generatedId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const created = await prisma.employee.create({
    data: {
      clerkUserId: generatedId,
      employeeId: data.employeeId.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password?.trim() || null,
      phone: data.phone?.trim() || null,
      role: (data.role || 'EMPLOYEE') as any,
      status: 'ACTIVE',
      departmentId: data.departmentId || null,
      branchId: data.branchId || null,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/employees');
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
    orderBy: { createdAt: 'desc' },
    include: {
      department: true,
      branch: true,
    },
  });

  return employees;
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string;
  departmentId?: number | null;
  branchId?: number | null;
}) {
  const employee = await requireEmployee();

  const updateData: any = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.role !== undefined) updateData.role = data.role as any;
  if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
  if (data.branchId !== undefined) updateData.branchId = data.branchId;

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: updateData,
    include: { department: true, branch: true },
  });

  // Refresh session cookie
  const sessionData = JSON.stringify({
    id: updated.clerkUserId || updated.employeeId,
    employeeId: updated.employeeId,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    role: updated.role,
    status: updated.status,
    imageUrl: (updated as any).imageUrl || null,
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
