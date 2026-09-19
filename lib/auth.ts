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
    idp: (process.env.SUPER_ADMIN_IDP || 'EMP000').trim(),
    email: (process.env.SUPER_ADMIN_EMAIL || 'tech@tsplgroup.in').trim().toLowerCase(),
    password: process.env.SUPER_ADMIN_PASSWORD || 'Techpassamour25',
    route: (process.env.SUPER_ADMIN_ROUTE || '/super-admin').trim(),
  };
}

/** Super admin session generated from hardcoded / env variables */
export function getHardcodedAdminSession() {
  const config = getSuperAdminIdpConfig();
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';
  return {
    clerkUserId: config.idp,
    id: 1000000,
    employeeId: config.idp,
    firstName,
    lastName,
    email: config.email,
    role: 'SUPER_ADMIN' as EmployeeRole,
    status: 'ACTIVE' as EmployeeStatus,
    department: null,
    branch: null,
    manager: null,
    imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(config.idp)}`,
  };
}

/** Read and parse the session cookie. Returns null if not set. Supports both sync and async cookies(). */
export async function getSessionData(): Promise<Record<string, any> | null> {
  try {
    const cookieStore: any = await Promise.resolve(cookies());
    let raw: string | undefined;

    if (typeof cookieStore?.get === 'function') {
      raw = cookieStore.get('session_user')?.value;
    } else if (cookieStore && typeof cookieStore === 'object') {
      raw = cookieStore['session_user']?.value || cookieStore['session_user'];
    }

    if (!raw) return null;
    let str = raw;
    if (typeof str === 'string' && str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    try {
      const val = JSON.parse(str);
      if (typeof val === 'object' && val !== null) return val;
      str = val;
    } catch {}
    try {
      const decoded = decodeURIComponent(str);
      const val = JSON.parse(decoded);
      if (typeof val === 'object' && val !== null) return val;
    } catch {}
    try {
      const decoded = decodeURIComponent(decodeURIComponent(str));
      const val = JSON.parse(decoded);
      if (typeof val === 'object' && val !== null) return val;
    } catch {}
    return null;
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes?.('Dynamic server usage')) {
      throw err;
    }
    console.warn('[getSessionData] Error reading cookie:', err);
    return null;
  }
}

import crypto from 'crypto';

export type AuthResult = {
  success: boolean;
  error?: string;
  status?: number;
  sessionData?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    imageUrl?: string | null;
    departmentId?: number | null;
    branchId?: number | null;
  };
  employee?: any;
};

export async function getCurrentEmployee() {
  const session = await getSessionData();
  if (!session) return null;

  // 1. Real-time lookup in DB for the currently logged-in user by clerkUserId, employeeId, or email
  const searchConditions: any[] = [];
  if (session.id) {
    searchConditions.push({ clerkUserId: { equals: String(session.id), mode: 'insensitive' } });
    searchConditions.push({ employeeId: { equals: String(session.id), mode: 'insensitive' } });
    const num = Number(session.id);
    if (!isNaN(num)) {
      searchConditions.push({ id: num });
    }
  }
  if (session.employeeId && session.employeeId !== session.id) {
    searchConditions.push({ employeeId: { equals: String(session.employeeId), mode: 'insensitive' } });
  }
  if (session.email) {
    searchConditions.push({ email: { equals: String(session.email).trim(), mode: 'insensitive' } });
  }

  if (searchConditions.length > 0) {
    try {
      const dbEmployee = await prisma.employee.findFirst({
        where: {
          OR: searchConditions,
        },
        include: { department: true, branch: true, manager: true },
      });

      if (dbEmployee) return dbEmployee;
    } catch (e) {
      console.warn('[getCurrentEmployee] DB employee lookup error, falling back to session:', e);
    }
  }

  // 2. Only if employee is NOT found in DB, check if this session specifically matches the .env bootstrap Super Admin
  const idpConfig = getSuperAdminIdpConfig();
  const isEnvSuperAdminSession =
    (Boolean(idpConfig.idp) && (session.id === idpConfig.idp || session.employeeId === idpConfig.idp)) ||
    (Boolean(idpConfig.email) && session.email?.toLowerCase() === idpConfig.email.toLowerCase());

  if (isEnvSuperAdminSession) {
    const adminSession = getHardcodedAdminSession();
    return {
      ...adminSession,
      firstName: session.firstName || adminSession.firstName,
      lastName: session.lastName || adminSession.lastName,
      email: session.email || adminSession.email,
      imageUrl: session.imageUrl || adminSession.imageUrl,
    } as any;
  }

  // 3. Fallback to session data if DB query returns null but user has valid authenticated session
  if (session && (session.role || session.email || session.id)) {
    return {
      id: typeof session.id === 'number' ? session.id : 0,
      clerkUserId: String(session.id || session.employeeId || 'user'),
      employeeId: String(session.employeeId || session.id || 'user'),
      firstName: session.firstName || 'User',
      lastName: session.lastName || '',
      email: session.email || '',
      role: (session.role || 'EMPLOYEE') as EmployeeRole,
      status: (session.status || 'ACTIVE') as EmployeeStatus,
      departmentId: session.departmentId || null,
      branchId: session.branchId || null,
      department: null,
      branch: null,
      manager: null,
    } as any;
  }

  return null;
}

/** Authenticated user helper returning real-time role & status */
export async function getCurrentUser() {
  const session = await getSessionData();
  if (!session) return null;

  const employee: any = await getCurrentEmployee();
  if (employee) {
    const firstName = employee.firstName || session.firstName || 'User';
    const lastName = employee.lastName || session.lastName || '';
    const email = employee.email || session.email || '';
    const fullName = `${firstName} ${lastName}`.trim() || firstName;

    return {
      id: String(employee.clerkUserId || employee.employeeId || employee.id),
      employeeId: employee.employeeId || String(employee.id),
      firstName,
      lastName,
      fullName,
      emailAddresses: [{ emailAddress: email }],
      primaryEmailAddress: { emailAddress: email },
      role: (employee.role || session.role || 'EMPLOYEE') as EmployeeRole,
      status: (employee.status || session.status || 'ACTIVE') as EmployeeStatus,
      imageUrl: employee.imageUrl || session.imageUrl,
      departmentId: employee.departmentId || null,
      branchId: employee.branchId || null,
    };
  }

  const firstName = session.firstName || 'User';
  const lastName = session.lastName || '';
  const email = session.email || '';
  const fullName = `${firstName} ${lastName}`.trim() || firstName;

  return {
    id: String(session.id || session.employeeId || 'user'),
    employeeId: String(session.employeeId || session.id || 'user'),
    firstName,
    lastName,
    fullName,
    emailAddresses: [{ emailAddress: email }],
    primaryEmailAddress: { emailAddress: email },
    role: (session.role || 'EMPLOYEE') as EmployeeRole,
    status: (session.status || 'ACTIVE') as EmployeeStatus,
    imageUrl: session.imageUrl || null,
    departmentId: session.departmentId || null,
    branchId: session.branchId || null,
  };
}

/**
 * Universal authentication logic:
 * 1. Checks PostgreSQL database first (case-insensitive search by email, employeeId, clerkUserId, phone).
 * 2. Compares password against plain text, trimmed string, MD5 hash, SHA-256 hash.
 * 3. Never overwrites or clobbers changed database passwords.
 * 4. Fallback for Super Admin bootstrap or emergency login.
 */
export async function authenticateCredentials(
  emailOrEmpId: string,
  rawPassword: string
): Promise<AuthResult> {
  const inputClean = String(emailOrEmpId || '').trim();
  const inputLower = inputClean.toLowerCase();
  const inputUpper = inputClean.toUpperCase();
  const password = String(rawPassword || '');
  const passTrim = password.trim();

  if (!inputClean || !password) {
    return {
      success: false,
      error: 'Please enter your email or Employee ID and password.',
      status: 400,
    };
  }

  const idpConfig = getSuperAdminIdpConfig();

  // Generate candidate search identifiers
  const idCandidates = new Set<string>([
    inputClean,
    inputLower,
    inputUpper,
  ]);

  const digitsOnly = inputClean.replace(/^[a-zA-Z]+/, '');
  if (digitsOnly) {
    idCandidates.add(`TSPL${digitsOnly}`);
    idCandidates.add(`EMP${digitsOnly}`);
  }
  if (!inputUpper.startsWith('TSPL')) {
    idCandidates.add(`TSPL${inputUpper}`);
  }
  if (!inputUpper.startsWith('EMP')) {
    idCandidates.add(`EMP${inputUpper}`);
  }

  const candidateArray = Array.from(idCandidates).filter(Boolean);

  // 1. LOOKUP EMPLOYEE IN DATABASE
  const db = prisma as any;
  let employee: any = null;

  try {
    const dbQuery = db.employee.findFirst({
      where: {
        OR: [
          { email: { equals: inputClean, mode: 'insensitive' } },
          { email: { equals: inputLower, mode: 'insensitive' } },
          ...candidateArray.map((cand) => ({
            employeeId: { equals: cand, mode: 'insensitive' },
          })),
          ...candidateArray.map((cand) => ({
            clerkUserId: { equals: cand, mode: 'insensitive' },
          })),
          { phone: { equals: inputClean, mode: 'insensitive' } },
        ],
      },
      include: {
        department: true,
        branch: true,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 6000)
    );

    employee = await Promise.race([dbQuery, timeoutPromise]);
  } catch (err: any) {
    console.error('[authenticateCredentials] DB lookup error:', err);
    if (err?.message === 'DATABASE_TIMEOUT') {
      return {
        success: false,
        error: 'Database response timed out. Please check PostgreSQL server.',
        status: 504,
      };
    }
    return {
      success: false,
      error: 'Database service is temporarily unavailable. Please try again.',
      status: 503,
    };
  }

  // 2. IF EMPLOYEE FOUND IN DATABASE: VALIDATE PASSWORD
  if (employee) {
    if (employee.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your account is inactive or suspended',
        status: 403,
      };
    }

    const dbPass = employee.password != null ? String(employee.password) : null;
    const dbPassTrim = dbPass != null ? dbPass.trim() : null;

    let isPasswordCorrect = false;

    // Direct plain text check
    if (dbPass !== null) {
      if (
        dbPass === password ||
        dbPassTrim === passTrim ||
        dbPass === passTrim ||
        dbPassTrim === password
      ) {
        isPasswordCorrect = true;
      }
    }

    // Hashes check (MD5 or SHA-256 in case password was hashed in DB)
    if (!isPasswordCorrect && dbPassTrim) {
      try {
        const md5Hex = crypto.createHash('md5').update(password).digest('hex');
        const sha256Hex = crypto.createHash('sha256').update(password).digest('hex');
        if (
          dbPassTrim.toLowerCase() === md5Hex ||
          dbPassTrim.toLowerCase() === sha256Hex
        ) {
          isPasswordCorrect = true;
        }
      } catch (e) {
        console.warn('[authenticateCredentials] Hash comparison error:', e);
      }
    }

    // Super Admin fallback check
    if (!isPasswordCorrect) {
      const isSuperAdminUser =
        employee.role === 'SUPER_ADMIN' ||
        inputLower === idpConfig.email ||
        inputLower === idpConfig.idp.toLowerCase() ||
        candidateArray.includes(idpConfig.idp) ||
        candidateArray.includes('TSPL000') ||
        candidateArray.includes('EMP000');

      if (isSuperAdminUser) {
        if (
          password === idpConfig.password ||
          passTrim === idpConfig.password.trim()
        ) {
          isPasswordCorrect = true;
        }
      }
    }

    // If password in DB was empty and this is super admin bootstrap
    if (!isPasswordCorrect && (!dbPassTrim || dbPassTrim === '')) {
      if (
        password === idpConfig.password ||
        passTrim === idpConfig.password.trim()
      ) {
        isPasswordCorrect = true;
      }
    }

    if (!isPasswordCorrect) {
      return {
        success: false,
        error: 'Invalid email/Employee ID or password',
        status: 401,
      };
    }

    const sessionData = {
      id: String(employee.clerkUserId || employee.employeeId || employee.id),
      employeeId: employee.employeeId || String(employee.id),
      firstName: employee.firstName || 'User',
      lastName: employee.lastName || '',
      email: employee.email || inputClean,
      role: employee.role,
      status: employee.status,
      imageUrl: employee.imageUrl || null,
      departmentId: employee.departmentId || null,
      branchId: employee.branchId || null,
    };

    return {
      success: true,
      employee,
      sessionData,
    };
  }

  // 3. IF EMPLOYEE NOT IN DATABASE: CHECK SUPER ADMIN BOOTSTRAP CREDENTIALS
  const isSuperAdminEnvMatch =
    (inputLower === idpConfig.email ||
      inputLower === idpConfig.idp.toLowerCase() ||
      candidateArray.includes(idpConfig.idp) ||
      candidateArray.includes('TSPL000') ||
      candidateArray.includes('EMP000')) &&
    (password === idpConfig.password ||
      passTrim === idpConfig.password.trim());

  if (isSuperAdminEnvMatch) {
    const adminSession = getHardcodedAdminSession();
    // Non-blocking bootstrap without overwriting existing password
    (async () => {
      try {
        await db.employee.upsert({
          where: { employeeId: adminSession.employeeId },
          create: {
            clerkUserId: adminSession.clerkUserId,
            employeeId: adminSession.employeeId,
            firstName: adminSession.firstName,
            lastName: adminSession.lastName,
            email: adminSession.email,
            password: password,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
          update: {
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            email: adminSession.email,
          },
        });
      } catch (e) {
        console.warn('[authenticateCredentials] Bootstrap upsert warning:', e);
      }
    })();

    const sessionData = {
      id: adminSession.employeeId,
      employeeId: adminSession.employeeId,
      firstName: adminSession.firstName,
      lastName: adminSession.lastName,
      email: adminSession.email,
      role: adminSession.role,
      status: adminSession.status,
      imageUrl: adminSession.imageUrl,
      departmentId: null,
      branchId: null,
    };

    return {
      success: true,
      employee: adminSession,
      sessionData,
    };
  }

  return {
    success: false,
    error: 'Invalid email/Employee ID or password',
    status: 401,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (user) {
    return user;
  }

  const session = await getSessionData();
  if (session && (session.status === 'ACTIVE' || !session.status)) {
    return {
      id: String(session.id || session.employeeId || 'user'),
      firstName: session.firstName || 'User',
      lastName: session.lastName || '',
      fullName: `${session.firstName || 'User'} ${session.lastName || ''}`.trim(),
      emailAddresses: [{ emailAddress: session.email || '' }],
      primaryEmailAddress: { emailAddress: session.email || '' },
      role: (session.role || 'EMPLOYEE') as EmployeeRole,
      status: (session.status || 'ACTIVE') as EmployeeStatus,
      imageUrl: session.imageUrl || null,
      departmentId: session.departmentId || null,
      branchId: session.branchId || null,
    };
  }

  redirect('/sign-in');
}

export async function requireEmployee() {
  const session = await getSessionData();
  if (!session) {
    redirect('/sign-in');
  }

  const employee = await getCurrentEmployee();
  if (!employee) {
    if (session && (session.status === 'ACTIVE' || !session.status)) {
      return {
        id: typeof session.id === 'number' ? session.id : 0,
        clerkUserId: String(session.id || session.employeeId || 'user'),
        employeeId: String(session.employeeId || session.id || 'user'),
        firstName: session.firstName || 'User',
        lastName: session.lastName || '',
        email: session.email || '',
        role: (session.role || 'EMPLOYEE') as EmployeeRole,
        status: (session.status || 'ACTIVE') as EmployeeStatus,
        departmentId: session.departmentId || null,
        branchId: session.branchId || null,
        department: null,
        branch: null,
        manager: null,
      } as any;
    }
    redirect('/sign-in');
  }

  if (employee.status !== 'ACTIVE') {
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
  if (employee && employee.role === 'SUPER_ADMIN') {
    return true;
  }

  const session = await getSessionData();
  if (session && session.role === 'SUPER_ADMIN') {
    return true;
  }

  if (!employee) return false;

  const idpConfig = getSuperAdminIdpConfig();
  if (
    (idpConfig.email && employee.email?.toLowerCase() === idpConfig.email) ||
    (idpConfig.idp && employee.employeeId === idpConfig.idp) ||
    (idpConfig.idp && employee.clerkUserId === idpConfig.idp) ||
    employee.employeeId === 'TSPL000' ||
    employee.employeeId === 'EMP000'
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
  const employee = await requireEmployee();
  return employee;
}