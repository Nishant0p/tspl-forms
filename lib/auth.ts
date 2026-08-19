import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export type EmployeeRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'HR' | 'MANAGER' | 'EMPLOYEE';

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

// ── Hardcoded permanent super admin ─────────────────────────────────────────
const HARDCODED_ADMIN_SESSION = {
  clerkUserId: 'hardcoded_tech_admin',
  id:          1000000,
  employeeId:  'EMP000',
  firstName:   'Tech',
  lastName:    'Admin',
  email:       'tech@tsplgroup.in',
  role:        'SUPER_ADMIN' as EmployeeRole,
  status:      'ACTIVE',
  department:  null,
  branch:      null,
  manager:     null,
  imageUrl:    'https://api.dicebear.com/7.x/initials/svg?seed=TA',
};

/** Read and parse the session cookie. Returns null if not set. */
export function getSessionData(): Record<string, any> | null {
  try {
    const raw = cookies().get('session_user')?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Legacy Clerk-compat helper – returns a minimal user object. */
export async function getCurrentUser() {
  const session = getSessionData();
  if (!session) return null;
  return {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    fullName: `${session.firstName} ${session.lastName}`,
    emailAddresses: [{ emailAddress: session.email }],
    primaryEmailAddress: { emailAddress: session.email },
    imageUrl: session.imageUrl,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function getCurrentEmployee() {
  const session = getSessionData();
  if (!session) return null;

  // Hardcoded tech admin – return synthetic employee record
  if (session.id === 'hardcoded_tech_admin') {
    return HARDCODED_ADMIN_SESSION as any;
  }

  return await prisma.employee.findUnique({
    where: { clerkUserId: session.id },
    include: { department: true, branch: true, manager: true },
  });
}

export async function requireEmployee() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    redirect('/sign-in');
  }
  return employee!;
}

export async function requireRole(allowedRoles: EmployeeRole[]) {
  const employee = await requireEmployee();

  if (
    employee.status !== 'ACTIVE' ||
    !allowedRoles.includes(employee.role as EmployeeRole)
  ) {
    throw new ForbiddenError();
  }

  return employee;
}