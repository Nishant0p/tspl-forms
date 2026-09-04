import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export type EmployeeRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'FORM_VIEWER';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

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

/** Get Super Admin IDP settings from process.env or hardcoded defaults */
export function getSuperAdminIdpConfig() {
  return {
    idp: (process.env.SUPER_ADMIN_IDP || 'TSPL000').trim(),
    email: (process.env.SUPER_ADMIN_EMAIL || 'nishant@brandboosters.marketing').trim().toLowerCase(),
    password: process.env.SUPER_ADMIN_PASSWORD || 'Nishant@Atharva',
    route: (process.env.SUPER_ADMIN_ROUTE || '/super-admin').trim(),
  };
}

/** Super admin session generated from hardcoded / env variables */
export function getHardcodedAdminSession() {
  const config = getSuperAdminIdpConfig();
  return {
    clerkUserId: config.idp,
    id: 1000000,
    employeeId: config.idp,
    firstName: 'Nishant',
    lastName: 'Admin',
    email: config.email,
    role: 'SUPER_ADMIN' as EmployeeRole,
    status: 'ACTIVE' as EmployeeStatus,
    department: null,
    branch: null,
    manager: null,
    imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(config.idp)}`,
  };
}

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

export async function getCurrentEmployee() {
  const session = getSessionData();
  if (!session) return null;

  const idpConfig = getSuperAdminIdpConfig();

  // Check if current session matches process.env Super Admin IDP
  if (
    idpConfig.idp &&
    idpConfig.email &&
    (session.id === idpConfig.idp ||
      session.employeeId === idpConfig.idp ||
      session.email?.toLowerCase() === idpConfig.email)
  ) {
    const dbAdmin = await prisma.employee.findFirst({
      where: {
        OR: [
          { clerkUserId: idpConfig.idp },
          { employeeId: idpConfig.idp },
          { email: idpConfig.email },
        ],
      },
      include: { department: true, branch: true, manager: true },
    });
    if (dbAdmin) return dbAdmin;

    const adminSession = getHardcodedAdminSession();
    if (adminSession) {
      return {
        ...adminSession,
        firstName: session.firstName || adminSession.firstName,
        lastName: session.lastName || adminSession.lastName,
        imageUrl: session.imageUrl || adminSession.imageUrl,
      } as any;
    }
  }

  // Real-time lookup in DB by clerkUserId, employeeId, or email
  return await prisma.employee.findFirst({
    where: {
      OR: [
        { clerkUserId: session.id },
        { employeeId: session.employeeId || session.id },
        { email: session.email?.toLowerCase() },
      ].filter(Boolean) as any,
    },
    include: { department: true, branch: true, manager: true },
  });
}

/** Authenticated user helper returning real-time role & status */
export async function getCurrentUser() {
  const session = getSessionData();
  if (!session) return null;

  const idpConfig = getSuperAdminIdpConfig();
  if (
    idpConfig.idp &&
    idpConfig.email &&
    (session.id === idpConfig.idp ||
      session.employeeId === idpConfig.idp ||
      session.email?.toLowerCase() === idpConfig.email)
  ) {
    const dbAdmin: any = await prisma.employee.findFirst({
      where: {
        OR: [
          { clerkUserId: idpConfig.idp },
          { employeeId: idpConfig.idp },
          { email: idpConfig.email },
        ],
      },
    });

    const admin = getHardcodedAdminSession();
    if (admin) {
      const firstName = dbAdmin?.firstName || session.firstName || admin.firstName;
      const lastName = dbAdmin?.lastName || session.lastName || admin.lastName;
      const imageUrl = dbAdmin?.imageUrl || session.imageUrl || admin.imageUrl;

      return {
        id: admin.clerkUserId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        emailAddresses: [{ emailAddress: admin.email }],
        primaryEmailAddress: { emailAddress: admin.email },
        role: admin.role as EmployeeRole,
        status: admin.status as EmployeeStatus,
        imageUrl,
        departmentId: dbAdmin?.departmentId || session.departmentId || null,
        branchId: dbAdmin?.branchId || session.branchId || null,
      };
    }
  }

  const employee: any = await getCurrentEmployee();
  if (employee) {
    return {
      id: employee.clerkUserId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      emailAddresses: [{ emailAddress: employee.email }],
      primaryEmailAddress: { emailAddress: employee.email },
      role: employee.role as EmployeeRole,
      status: employee.status as EmployeeStatus,
      imageUrl: employee.imageUrl || session.imageUrl,
      departmentId: employee.departmentId,
      branchId: employee.branchId,
    };
  }

  return {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    fullName: `${session.firstName} ${session.lastName}`,
    emailAddresses: [{ emailAddress: session.email }],
    primaryEmailAddress: { emailAddress: session.email },
    role: (session.role || 'EMPLOYEE') as EmployeeRole,
    status: (session.status || 'ACTIVE') as EmployeeStatus,
    imageUrl: session.imageUrl,
    departmentId: session.departmentId || null,
    branchId: session.branchId || null,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function requireEmployee() {
  const employee = await getCurrentEmployee();
  if (!employee || employee.status !== 'ACTIVE') {
    redirect('/access-denied');
  }
  return employee;
}

export async function requireRole(allowedRoles: EmployeeRole[]) {
  const employee = await requireEmployee();

  if (
    employee.status !== 'ACTIVE' ||
    !allowedRoles.includes(employee.role as EmployeeRole)
  ) {
    redirect('/access-denied');
  }

  return employee;
}

export async function isSuperAdmin() {
  const employee = await getCurrentEmployee();
  if (!employee) return false;

  if (employee.role === 'SUPER_ADMIN') {
    return true;
  }

  const idpConfig = getSuperAdminIdpConfig();
  if (
    (idpConfig.email && employee.email?.toLowerCase() === idpConfig.email) ||
    (idpConfig.idp && employee.employeeId === idpConfig.idp) ||
    (idpConfig.idp && employee.clerkUserId === idpConfig.idp)
  ) {
    return true;
  }

  return false;
}

export async function requireSuperAdmin() {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    redirect('/access-denied');
  }
  const employee = await getCurrentEmployee();
  return employee!;
}