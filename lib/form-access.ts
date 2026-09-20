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

  // If Branch Admin (role === 'ADMIN') and has a branchId
  if (employee?.role === 'ADMIN' && employee?.branchId) {
    orConditions.push({ branchId: employee.branchId });
    orConditions.push({ allowedBranches: { some: { branchId: employee.branchId } } });

    // Include forms created by any active employee belonging to this branch
    try {
      const branchEmployees = await prisma.employee.findMany({
        where: { branchId: employee.branchId, status: 'ACTIVE' },
        select: { id: true, clerkUserId: true, employeeId: true, email: true },
      });

      const branchMemberIds = branchEmployees.flatMap((e) => [
        e.clerkUserId,
        e.employeeId,
        e.email ? e.email.toLowerCase() : null,
        String(e.id),
      ]).filter(Boolean) as string[];

      if (branchMemberIds.length > 0) {
        orConditions.push({ userId: { in: branchMemberIds } });
      }
    } catch (err) {
      console.warn('Failed to resolve branch employees for form access query:', err);
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

  let isBranchAdmin = false;
  if (employee?.role === 'ADMIN' && employee?.branchId) {
    if (form.branchId === employee.branchId) {
      isBranchAdmin = true;
    } else if (
      Array.isArray(form.allowedBranches) &&
      form.allowedBranches.some((ab: any) => ab.branchId === employee.branchId)
    ) {
      isBranchAdmin = true;
    } else if (isCreator) {
      isBranchAdmin = true;
    } else {
      // Check if creator belongs to this branch
      try {
        const creatorEmp = await prisma.employee.findFirst({
          where: {
            OR: [
              { clerkUserId: form.userId },
              { employeeId: form.userId },
              { email: form.userId?.toLowerCase() },
              ...(Number(form.userId) ? [{ id: Number(form.userId) }] : []),
            ],
          },
          select: { branchId: true },
        });
        if (creatorEmp?.branchId === employee.branchId) {
          isBranchAdmin = true;
        }
      } catch (err) {
        console.warn('Failed to verify creator branch for form permission:', err);
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