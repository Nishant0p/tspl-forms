import prisma from '@/lib/prisma';
import { getCurrentEmployee, getCurrentUser } from '@/lib/auth';

export type FormAccessMode = 'PUBLIC' | 'AUTHENTICATED' | 'RESTRICTED';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type FormAccessDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | 'not-found'
        | 'login-required'
        | 'forbidden'
        | 'draft'
        | 'closed'
        | 'archived'
        | 'not-started'
        | 'ended'
        | 'limit-reached'
        | 'duplicate-response';
    };

type AllowedRoleRow = { role: string };
type AllowedDepartmentRow = { departmentId: number };
type AllowedBranchRow = { branchId: number };
type AllowedEmployeeRow = { employeeId: number };

export type FormAccessRecord = {
  id: number;
  userId: string;
  status?: FormStatus | null;
  published: boolean;
  accessMode?: FormAccessMode | null;
  loginRequired?: boolean | null;
  oneResponsePerUser?: boolean | null;
  startDate?: Date | null;
  endDate?: Date | null;
  responseLimit?: number | null;
  submissions: number;
  allowedRoles?: AllowedRoleRow[];
  allowedDepartments?: AllowedDepartmentRow[];
  allowedBranches?: AllowedBranchRow[];
  allowedEmployees?: AllowedEmployeeRow[];
};

export class FormAccessBlockedError extends Error {
  reason: string;

  constructor(reason: string, message?: string) {
    super(message ?? getFormAccessErrorMessage(reason));
    this.name = 'FormAccessBlockedError';
    this.reason = reason;
  }
}

export function getFormAccessErrorMessage(reason: string) {
  switch (reason) {
    case 'draft':
      return 'This form is not published yet.';
    case 'closed':
      return 'This form is closed.';
    case 'archived':
      return 'This form has been archived.';
    case 'not-started':
      return 'Form is not available yet.';
    case 'ended':
      return 'This form is closed.';
    case 'limit-reached':
      return 'This form has reached its response limit.';
    case 'duplicate-response':
      return 'You have already submitted a response for this form.';
    case 'forbidden':
      return 'You are not allowed to access this form.';
    case 'login-required':
      return 'Authentication is required to access this form.';
    case 'not-found':
      return 'Form not found.';
    default:
      return 'You are not allowed to access this form.';
  }
}

function getFormStatus(form: FormAccessRecord): FormStatus {
  if (form.status) return form.status;
  return form.published ? 'PUBLISHED' : 'DRAFT';
}

export async function canAccessForm(form: FormAccessRecord, user?: { id: string } | null): Promise<FormAccessDecision> {
  const currentUser = user ?? (await getCurrentUser());

  if (!form) {
    return { allowed: false, reason: 'not-found' };
  }

  if (currentUser && currentUser.id === form.userId) {
    return { allowed: true };
  }

  const employee = await getCurrentEmployee();

  // Super Admin and Admin have universal access
  if (
    (employee && (employee.role === 'SUPER_ADMIN' || employee.role === 'ADMIN')) ||
    ((currentUser as any)?.role === 'SUPER_ADMIN' || (currentUser as any)?.role === 'ADMIN')
  ) {
    return { allowed: true };
  }

  const status = getFormStatus(form);

  if (status === 'DRAFT') {
    return { allowed: false, reason: 'draft' };
  }

  if (status === 'CLOSED') {
    return { allowed: false, reason: 'closed' };
  }

  if (status === 'ARCHIVED') {
    return { allowed: false, reason: 'archived' };
  }

  if (form.startDate && form.startDate.getTime() > Date.now()) {
    return { allowed: false, reason: 'not-started' };
  }

  if (form.endDate && form.endDate.getTime() < Date.now()) {
    return { allowed: false, reason: 'ended' };
  }

  if (typeof form.responseLimit === 'number' && form.responseLimit >= 0 && form.submissions >= form.responseLimit) {
    return { allowed: false, reason: 'limit-reached' };
  }

  // Published forms accessed via public link are 100% publicly accessible for guests to view and submit
  if (form.published || status === 'PUBLISHED') {
    // If oneResponsePerUser is configured and an authenticated employee is logged in, verify single submission
    if (employee && form.oneResponsePerUser) {
      return await canSubmitOnce(form, employee.id);
    }
    return { allowed: true };
  }

  const accessMode = form.accessMode ?? 'PUBLIC';

  if (accessMode === 'PUBLIC') {
    return { allowed: true };
  }

  if (!currentUser) {
    return { allowed: false, reason: 'login-required' };
  }

  if (!employee || employee.status !== 'ACTIVE') {
    return { allowed: false, reason: 'forbidden' };
  }

  if (accessMode === 'AUTHENTICATED') {
    return await canSubmitOnce(form, employee.id);
  }

  const hasRoleRestriction = (form.allowedRoles ?? []).length > 0;
  const hasDepartmentRestriction = (form.allowedDepartments ?? []).length > 0;
  const hasBranchRestriction = (form.allowedBranches ?? []).length > 0;
  const hasEmployeeRestriction = (form.allowedEmployees ?? []).length > 0;

  const employeeAllowed = hasEmployeeRestriction && (form.allowedEmployees ?? []).some((item) => item.employeeId === employee.id);
  const roleAllowed = !hasRoleRestriction || (form.allowedRoles ?? []).some((item) => item.role === employee.role);
  const departmentAllowed = !hasDepartmentRestriction || (form.allowedDepartments ?? []).some((item) => item.departmentId === employee.departmentId);
  const branchAllowed = !hasBranchRestriction || (form.allowedBranches ?? []).some((item) => item.branchId === employee.branchId);

  // If explicitly added as an allowed employee, grant access; otherwise verify role, department, and branch
  if (!employeeAllowed && (!roleAllowed || !departmentAllowed || !branchAllowed)) {
    return { allowed: false, reason: 'forbidden' };
  }

  return await canSubmitOnce(form, employee.id);
}

async function canSubmitOnce(form: FormAccessRecord, employeeId: number): Promise<FormAccessDecision> {
  if (!form.oneResponsePerUser) {
    return { allowed: true };
  }

  const existingSubmission = await prisma.formSubmissions.findFirst({
    where: {
      formId: form.id,
      employeeId,
    },
    select: {
      id: true,
    },
  });

  if (existingSubmission) {
    return { allowed: false, reason: 'duplicate-response' };
  }

  return { allowed: true };
}

export type FormUserPermissions = {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
  isCreator: boolean;
  isBranchAdmin: boolean;
  isAssignedEditor: boolean;
  isAssignedViewer: boolean;
  isSuperAdmin: boolean;
};

/**
 * Returns an array of normalized identifier strings for matching `form.userId`.
 */
export function getUserIdentificationStrings(user: any, employee: any): string[] {
  const ids: string[] = [];
  if (user?.id) ids.push(String(user.id));
  if (employee?.clerkUserId) ids.push(String(employee.clerkUserId));
  if (employee?.employeeId) ids.push(String(employee.employeeId));
  if (employee?.email) ids.push(String(employee.email).toLowerCase());
  if (typeof employee?.id === 'number' && employee.id < 1000000) ids.push(String(employee.id));
  return Array.from(new Set(ids.filter(Boolean)));
}

/**
 * Builds Prisma where condition to find forms visible to the given user:
 * - Super Admin: all forms
 * - Branch Admin (ADMIN): forms created by them, assigned to them, belonging to their branch,
 *   or created by active members of their branch
 * - All other roles (EMPLOYEE, EDITOR, HR, MANAGER, FORM_VIEWER): strictly forms created by them or assigned to them
 *   (published forms are NOT visible on dashboard unless created/assigned)
 */
export async function getAccessibleFormsWhere(user: any, employee: any, isSuper: boolean): Promise<any> {
  if (isSuper) {
    return {};
  }

  const userIds = getUserIdentificationStrings(user, employee);
  const empDbId = typeof employee?.id === 'number' && employee.id < 1000000 ? employee.id : null;

  // Base conditions: user is creator or assigned collaborator (editor or viewer)
  const orConditions: any[] = [
    { userId: { in: userIds } },
    ...(empDbId
      ? [
          { allowedEmployees: { some: { employeeId: empDbId } } },
          { formViewerAccesses: { some: { employeeId: empDbId } } },
        ]
      : []),
  ];

  const isAdmin = Boolean(employee?.role === 'ADMIN' || user?.role === 'ADMIN');

  if (isAdmin) {
    let resolvedAdminDbId = empDbId;
    let resolvedBranchId = employee?.branchId ?? user?.branchId ?? null;

    if (!resolvedAdminDbId || !resolvedBranchId) {
      try {
        const adminEmp = await prisma.employee.findFirst({
          where: {
            OR: [
              ...(user?.id
                ? [
                    { clerkUserId: { equals: String(user.id), mode: 'insensitive' as const } },
                    { employeeId: { equals: String(user.id), mode: 'insensitive' as const } },
                  ]
                : []),
              ...(user?.email ? [{ email: { equals: String(user.email).toLowerCase(), mode: 'insensitive' as const } }] : []),
              ...(employee?.employeeId ? [{ employeeId: { equals: String(employee.employeeId), mode: 'insensitive' as const } }] : []),
              ...(typeof employee?.id === 'number' && employee.id < 1000000 ? [{ id: employee.id }] : []),
            ],
          },
          select: { id: true, branchId: true },
        });
        if (adminEmp) {
          if (!resolvedAdminDbId) resolvedAdminDbId = adminEmp.id;
          if (!resolvedBranchId) resolvedBranchId = adminEmp.branchId;
        }
      } catch (e) {
        console.warn('Failed to resolve admin employee for forms where:', e);
      }
    }

    if (resolvedBranchId) {
      orConditions.push({ branchId: resolvedBranchId });
      orConditions.push({ allowedBranches: { some: { branchId: resolvedBranchId } } });
    }

    // Include forms created by all team members of this Admin:
    // 1. Employees in the same branch
    // 2. Employees created by this Admin (createdById === resolvedAdminDbId)
    // 3. Employees managed by this Admin (managerId === resolvedAdminDbId)
    try {
      const teamMemberConditions: any[] = [];
      if (resolvedBranchId) {
        teamMemberConditions.push({ branchId: resolvedBranchId });
      }
      if (resolvedAdminDbId) {
        teamMemberConditions.push({ createdById: resolvedAdminDbId });
        teamMemberConditions.push({ managerId: resolvedAdminDbId });
      }

      if (teamMemberConditions.length > 0) {
        const teamMembers = await prisma.employee.findMany({
          where: {
            OR: teamMemberConditions,
            role: { notIn: ['SUPER_ADMIN'] },
          },
          select: { id: true, clerkUserId: true, employeeId: true, email: true },
        });

        const teamMemberIds = new Set<string>();
        for (const m of teamMembers) {
          if (m.clerkUserId) teamMemberIds.add(m.clerkUserId);
          if (m.employeeId) {
            teamMemberIds.add(m.employeeId);
            teamMemberIds.add(m.employeeId.toLowerCase());
            teamMemberIds.add(m.employeeId.toUpperCase());
          }
          if (m.email) {
            teamMemberIds.add(m.email);
            teamMemberIds.add(m.email.toLowerCase());
          }
          if (m.id) {
            teamMemberIds.add(String(m.id));
          }
        }

        if (teamMemberIds.size > 0) {
          orConditions.push({ userId: { in: Array.from(teamMemberIds) } });
        }
      }
    } catch (err) {
      console.warn('Failed to resolve branch/team employees for form access query:', err);
    }
  }

  return { OR: orConditions };
}

/**
 * Computes exact granular permissions for a given form and user.
 */
export async function getFormUserPermissions(
  form: any,
  user: any,
  employee: any,
  isSuper: boolean
): Promise<FormUserPermissions> {
  if (isSuper) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canManageCollaborators: true,
      isCreator: true,
      isBranchAdmin: true,
      isAssignedEditor: true,
      isAssignedViewer: false,
      isSuperAdmin: true,
    };
  }

  const userIds = getUserIdentificationStrings(user, employee);
  const empDbId = typeof employee?.id === 'number' && employee.id < 1000000 ? employee.id : null;

  const isCreator = userIds.includes(form.userId);
  const isAssignedEditor = empDbId
    ? Boolean((form as any).allowedEmployees?.some((ae: any) => ae.employeeId === empDbId))
    : false;
  const isAssignedViewer = empDbId
    ? Boolean((form as any).formViewerAccesses?.some((va: any) => va.employeeId === empDbId))
    : false;

  const isAdmin = Boolean(employee?.role === 'ADMIN' || user?.role === 'ADMIN');
  let isBranchAdmin = false;

  if (isAdmin) {
    let resolvedAdminDbId = empDbId;
    let resolvedBranchId = employee?.branchId ?? user?.branchId ?? null;

    if (!resolvedAdminDbId || !resolvedBranchId) {
      try {
        const adminEmp = await prisma.employee.findFirst({
          where: {
            OR: [
              ...(user?.id
                ? [
                    { clerkUserId: { equals: String(user.id), mode: 'insensitive' as const } },
                    { employeeId: { equals: String(user.id), mode: 'insensitive' as const } },
                  ]
                : []),
              ...(user?.email ? [{ email: { equals: String(user.email).toLowerCase(), mode: 'insensitive' as const } }] : []),
              ...(employee?.employeeId ? [{ employeeId: { equals: String(employee.employeeId), mode: 'insensitive' as const } }] : []),
              ...(typeof employee?.id === 'number' && employee.id < 1000000 ? [{ id: employee.id }] : []),
            ],
          },
          select: { id: true, branchId: true },
        });
        if (adminEmp) {
          if (!resolvedAdminDbId) resolvedAdminDbId = adminEmp.id;
          if (!resolvedBranchId) resolvedBranchId = adminEmp.branchId;
        }
      } catch (e) {
        console.warn('Failed to lookup admin employee for permissions:', e);
      }
    }

    if (isCreator) {
      isBranchAdmin = true;
    } else if (resolvedBranchId && form.branchId === resolvedBranchId) {
      isBranchAdmin = true;
    } else if (
      resolvedBranchId &&
      Array.isArray(form.allowedBranches) &&
      form.allowedBranches.some((ab: any) => ab.branchId === resolvedBranchId)
    ) {
      isBranchAdmin = true;
    } else {
      // Check if creator belongs to this admin's branch or team (created by or managed by this admin)
      try {
        const formUserIdStr = String(form.userId || '').trim();
        const formUserIdNum = Number(formUserIdStr);
        const creatorEmp = await prisma.employee.findFirst({
          where: {
            OR: [
              { clerkUserId: { equals: formUserIdStr, mode: 'insensitive' as const } },
              { employeeId: { equals: formUserIdStr, mode: 'insensitive' as const } },
              { email: { equals: formUserIdStr.toLowerCase(), mode: 'insensitive' as const } },
              ...(!isNaN(formUserIdNum) && formUserIdNum > 0 && formUserIdNum < 1000000 ? [{ id: formUserIdNum }] : []),
            ],
          },
          select: {
            id: true,
            branchId: true,
            createdById: true,
            managerId: true,
            role: true,
          },
        });

        if (creatorEmp && creatorEmp.role !== 'SUPER_ADMIN') {
          if (resolvedBranchId && creatorEmp.branchId === resolvedBranchId) {
            isBranchAdmin = true;
          } else if (resolvedAdminDbId && creatorEmp.createdById === resolvedAdminDbId) {
            isBranchAdmin = true;
          } else if (resolvedAdminDbId && creatorEmp.managerId === resolvedAdminDbId) {
            isBranchAdmin = true;
          } else if (!resolvedBranchId && !creatorEmp.branchId) {
            isBranchAdmin = true;
          }
        }
      } catch (err) {
        console.warn('Failed to verify creator branch/team for form permission:', err);
      }
    }
  }

  const canView = isCreator || isBranchAdmin || isAssignedEditor || isAssignedViewer;
  const canEdit = isCreator || isBranchAdmin || isAssignedEditor;
  const canDelete = isCreator || isBranchAdmin;
  const canManageCollaborators = isCreator || isBranchAdmin;

  return {
    canView,
    canEdit,
    canDelete,
    canManageCollaborators,
    isCreator,
    isBranchAdmin,
    isAssignedEditor,
    isAssignedViewer,
    isSuperAdmin: false,
  };
}