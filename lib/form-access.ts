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

  const employee = await getCurrentEmployee();

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

  const roleAllowed = !hasRoleRestriction || (form.allowedRoles ?? []).some((item) => item.role === employee.role);
  const departmentAllowed = !hasDepartmentRestriction || (form.allowedDepartments ?? []).some((item) => item.departmentId === employee.departmentId);
  const branchAllowed = !hasBranchRestriction || (form.allowedBranches ?? []).some((item) => item.branchId === employee.branchId);
  const employeeAllowed = !hasEmployeeRestriction || (form.allowedEmployees ?? []).some((item) => item.employeeId === employee.id);

  if (!roleAllowed || !departmentAllowed || !branchAllowed || !employeeAllowed) {
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