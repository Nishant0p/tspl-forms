import { currentUser } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export type EmployeeRole = 'SUPER_ADMIN' | 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export class AuthRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function getCurrentUser() {
  return await currentUser();
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

export async function getCurrentEmployee() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return await prisma.employee.findUnique({
    where: {
      clerkUserId: user.id,
    },
    include: {
      department: true,
      branch: true,
      manager: true,
    },
  });
}

export async function requireEmployee() {
  const employee = await getCurrentEmployee();

  if (!employee) {
    throw new ForbiddenError('Employee profile not found');
  }

  return employee;
}

export async function requireRole(allowedRoles: EmployeeRole[]) {
  const employee = await requireEmployee();

  if (employee.status !== 'ACTIVE' || !allowedRoles.includes(employee.role as EmployeeRole)) {
    throw new ForbiddenError();
  }

  return employee;
}