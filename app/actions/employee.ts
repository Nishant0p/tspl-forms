'use server';

import prisma from '@/lib/prisma';
import { requireEmployee, ForbiddenError } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Hardcoded permanent super admin ──────────────────────────────────────────
const HARDCODED_ADMIN = {
  clerkUserId: 'hardcoded_tech_admin',
  id:          'hardcoded_tech_admin',
  employeeId:  'EMP000',
  firstName:   'Tech',
  lastName:    'Admin',
  fullName:    'Tech Admin',
  email:       'tech@tsplgroup.in',
  password:    'Techpassamour25',
  role:        'SUPER_ADMIN',
  status:      'ACTIVE',
  imageUrl:    'https://api.dicebear.com/7.x/initials/svg?seed=TA',
  emailAddresses: [{ emailAddress: 'tech@tsplgroup.in' }],
  primaryEmailAddress: { emailAddress: 'tech@tsplgroup.in' },
};

export async function loginUser(email: string, password: string) {
  // 1. Check hardcoded admin first
  if (
    email.trim().toLowerCase() === HARDCODED_ADMIN.email &&
    password === HARDCODED_ADMIN.password
  ) {
    const sessionData = JSON.stringify({
      id:        HARDCODED_ADMIN.clerkUserId,
      employeeId: HARDCODED_ADMIN.employeeId,
      firstName: HARDCODED_ADMIN.firstName,
      lastName:  HARDCODED_ADMIN.lastName,
      email:     HARDCODED_ADMIN.email,
      role:      HARDCODED_ADMIN.role,
      status:    HARDCODED_ADMIN.status,
      imageUrl:  HARDCODED_ADMIN.imageUrl,
    });
    cookies().set('session_user', sessionData, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }

  // 2. Lookup in database
  const db = prisma as any;
  const employee = await db.employee.findFirst({
    where: { email: email.trim().toLowerCase() },
  });

  if (!employee) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (employee.status !== 'ACTIVE') {
    return { success: false, error: 'Your account is inactive. Please contact your administrator.' };
  }

  if (!employee.password || employee.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  const sessionData = JSON.stringify({
    id:         employee.clerkUserId,
    employeeId: employee.employeeId,
    firstName:  employee.firstName,
    lastName:   employee.lastName,
    email:      employee.email,
    role:       employee.role,
    status:     employee.status,
    imageUrl:   `https://api.dicebear.com/7.x/initials/svg?seed=${employee.firstName[0]}${employee.lastName[0]}`,
  });

  cookies().set('session_user', sessionData, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function logoutUser() {
  cookies().delete('session_user');
  redirect('/sign-in');
}

export async function updateEmployeeStatus(employeeId: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
  const caller = await requireEmployee();

  // Enforce caller role limits: must be SUPER_ADMIN or ADMIN (or HR)
  if (!['SUPER_ADMIN', 'ADMIN', 'HR'].includes(caller.role)) {
    throw new ForbiddenError('You do not have permission to manage employees');
  }

  // Fetch the target employee
  const target = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!target) {
    throw new Error('Employee not found');
  }

  // Enforce hierarchy:
  // 1. Nobody can modify a SUPER_ADMIN except other Super Admins
  if (target.role === 'SUPER_ADMIN' && caller.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Only Super Admins can manage Super Admin accounts');
  }

  // 2. ADMINs can only be managed/terminated by SUPER_ADMINs
  if (target.role === 'ADMIN' && caller.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Only Super Admins can terminate or suspend Admin accounts');
  }

  // 3. Prevent self-status updates that disable one's own account (e.g. self-terminating)
  if (target.id === caller.id && status !== 'ACTIVE') {
    throw new Error('You cannot deactivate your own account');
  }

  // Perform update
  await prisma.employee.update({
    where: { id: employeeId },
    data: { status },
  });

  revalidatePath('/employees');
  revalidatePath(`/employees/${employeeId}`);
}

export async function createEmployee(data: {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'HR' | 'MANAGER' | 'EMPLOYEE';
}) {
  const caller = await requireEmployee();

  // Enforce role limits: only SUPER_ADMIN can create employees
  if (caller.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Only Super Admins can create employees');
  }

  if (!data.employeeId || !data.firstName || !data.lastName || !data.email) {
    throw new Error('Missing required fields');
  }

  const db = prisma as any;

  // Check unique constraints
  const existingId = await db.employee.findUnique({
    where: { employeeId: data.employeeId },
  });
  if (existingId) {
    throw new Error('Employee ID already exists');
  }

  const existingEmail = await db.employee.findFirst({
    where: { email: data.email },
  });
  if (existingEmail) {
    throw new Error('Email already exists');
  }

  // Generate a mock Clerk user ID for local mock authentication
  const clerkUserId = `mock_clerk_${data.employeeId.toLowerCase()}_${Math.random().toString(36).substring(2, 9)}`;

  // Create the employee record
  const newEmployee = await db.employee.create({
    data: {
      clerkUserId,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password || null,
      role: data.role,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/employees');
  return newEmployee;
}
