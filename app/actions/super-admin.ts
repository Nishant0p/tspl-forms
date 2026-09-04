'use server';

import { requireSuperAdmin, EmployeeRole, EmployeeStatus } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CreateAdminInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  employeeId: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  departmentId?: number | null;
  branchId?: number | null;
};

function formatTsplEmployeeId(id: string): string {
  let clean = (id || '').trim().toUpperCase();
  if (!clean.startsWith('TSPL')) {
    clean = `TSPL${clean}`;
  }
  return clean;
}

export async function getAdminsList() {
  await requireSuperAdmin();

  const admins = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      department: true,
      branch: true,
      createdBy: true,
      createdEmployees: {
        include: {
          department: true,
          branch: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    } as any,
  });

  return admins;
}

export async function getAdminReportCard(adminId: number) {
  await requireSuperAdmin();

  const db = prisma as any;
  const admin = await db.employee.findUnique({
    where: { id: adminId },
    include: {
      branch: true,
      department: true,
    },
  });

  if (!admin) {
    throw new Error('Admin user not found.');
  }

  const userIds = Array.from(
    new Set([
      admin.clerkUserId,
      admin.employeeId,
      admin.email,
      String(admin.id),
    ])
  ).filter(Boolean);

  const forms = await db.form.findMany({
    where: {
      userId: { in: userIds },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      published: true,
      status: true,
      visits: true,
      submissions: true,
      createdAt: true,
    },
  });

  const formsCreatedCount = forms.length;
  const totalSubmissionsCount = forms.reduce((acc: number, f: any) => acc + (f.submissions || 0), 0);

  const teamMembers = await db.employee.findMany({
    where: {
      role: { notIn: ['SUPER_ADMIN', 'ADMIN'] },
      OR: [
        { createdById: admin.id },
        ...(admin.branchId ? [{ branchId: admin.branchId }] : []),
      ],
    },
    include: {
      department: true,
      branch: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    admin: {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      employeeId: admin.employeeId,
      role: admin.role,
      status: admin.status,
      branch: admin.branch,
      department: admin.department,
    },
    stats: {
      formsCreatedCount,
      totalSubmissionsCount,
      teamMembersCount: teamMembers.length,
    },
    forms,
    teamMembers: teamMembers.map((m: any) => ({
      id: m.id,
      employeeId: m.employeeId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      role: m.role,
      status: m.status,
      branch: m.branch,
      department: m.department,
    })),
  };
}

export async function createAdminUser(data: CreateAdminInput) {
  await requireSuperAdmin();

  if (!data.firstName || !data.lastName || !data.email || !data.employeeId) {
    throw new Error('First Name, Last Name, Email, and Employee ID are required');
  }

  // Format TSPL employee ID
  const formattedEmpId = formatTsplEmployeeId(data.employeeId);

  // Enforce Super Admin limit of 3
  if (data.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.employee.count({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    });
    if (superAdminCount >= 3) {
      throw new Error('Maximum limit of 3 Super Admins reached. You cannot create more Super Admins.');
    }
  }

  // Enforce 1 Admin per branch (Admin = Branch Head)
  if (data.role === 'ADMIN') {
    if (!data.branchId) {
      throw new Error('Assigning a Branch is required for Branch Admin.');
    }
    const existingBranchAdmin = await prisma.employee.findFirst({
      where: {
        role: 'ADMIN',
        branchId: data.branchId,
        status: 'ACTIVE',
      },
    });
    if (existingBranchAdmin) {
      throw new Error(`This branch already has an assigned Branch Head (${existingBranchAdmin.firstName} ${existingBranchAdmin.lastName}). Only 1 Admin per branch is allowed.`);
    }
  }

  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const existingEmail = await prisma.employee.findFirst({
    where: { email: data.email.trim().toLowerCase() },
  });
  if (existingEmail) {
    throw new Error('An admin or employee with this email already exists');
  }

  const existingEmpId = await prisma.employee.findUnique({
    where: { employeeId: formattedEmpId },
  });
  if (existingEmpId) {
    throw new Error(`An employee with Employee ID "${formattedEmpId}" already exists`);
  }

  const generatedClerkId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const created = await prisma.employee.create({
    data: {
      clerkUserId: generatedClerkId,
      employeeId: formattedEmpId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
      phone: data.phone?.trim() || null,
      role: data.role,
      status: data.status,
      departmentId: data.departmentId || null,
      branchId: data.branchId || null,
    },
    include: {
      department: true,
      branch: true,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  return created;
}

export async function updateAdminRoleAndStatus(
  id: number,
  role: EmployeeRole,
  status: EmployeeStatus
) {
  await requireSuperAdmin();

  // Enforce max 3 super admins if promoting to SUPER_ADMIN
  if (role === 'SUPER_ADMIN' && status === 'ACTIVE') {
    const targetUser = await prisma.employee.findUnique({ where: { id } });
    if (targetUser && targetUser.role !== 'SUPER_ADMIN') {
      const superAdminCount = await prisma.employee.count({
        where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      });
      if (superAdminCount >= 3) {
        throw new Error('Maximum limit of 3 Super Admins reached.');
      }
    }
  }

  // Enforce 1 Admin per branch if promoting to ADMIN
  if (role === 'ADMIN' && status === 'ACTIVE') {
    const targetUser = await prisma.employee.findUnique({ where: { id } });
    if (targetUser?.branchId) {
      const existingBranchAdmin = await prisma.employee.findFirst({
        where: {
          role: 'ADMIN',
          branchId: targetUser.branchId,
          id: { not: id },
          status: 'ACTIVE',
        },
      });
      if (existingBranchAdmin) {
        throw new Error(`This branch already has an assigned Branch Head (${existingBranchAdmin.firstName} ${existingBranchAdmin.lastName}). Only 1 Admin per branch is allowed.`);
      }
    }
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      role,
      status,
    },
  });

  // Revalidate layout and all paths immediately so permission changes take effect in real-time
  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  revalidatePath('/form-requests');
  return updated;
}

export async function updateAdminPassword(id: number, newPassword: string) {
  await requireSuperAdmin();

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      password: newPassword.trim(),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  return updated;
}

export async function deleteAdminUser(id: number) {
  await requireSuperAdmin();

  const deleted = await prisma.employee.delete({
    where: { id },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/dashboard');
  revalidatePath('/employees');
  return deleted;
}

export async function getAllDepartmentsAndBranches() {
  await requireSuperAdmin();

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { employees: true },
      },
    },
  });

  const branches = await prisma.branch.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { employees: true },
      },
    },
  });

  return { departments, branches };
}

export async function createDepartment(data: { name: string; code: string; description?: string }) {
  await requireSuperAdmin();

  const cleanName = data.name.trim();
  const cleanCode = data.code.trim().toUpperCase();

  if (!cleanName || !cleanCode) {
    throw new Error('Department Name and Code are required');
  }

  const existingCode = await prisma.department.findUnique({
    where: { code: cleanCode },
  });
  if (existingCode) {
    throw new Error(`Department code "${cleanCode}" already exists`);
  }

  const created = await prisma.department.create({
    data: {
      name: cleanName,
      code: cleanCode,
      description: data.description?.trim() || '',
      active: true,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/employees');
  return created;
}

export async function deleteDepartment(id: number) {
  await requireSuperAdmin();

  const deleted = await prisma.department.delete({
    where: { id },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/employees');
  return deleted;
}

export async function createBranch(data: { name: string; code: string; location?: string }) {
  await requireSuperAdmin();

  const cleanName = data.name.trim();
  const cleanCode = data.code.trim().toUpperCase();

  if (!cleanName || !cleanCode) {
    throw new Error('Branch Name and Code are required');
  }

  const existingCode = await prisma.branch.findUnique({
    where: { code: cleanCode },
  });
  if (existingCode) {
    throw new Error(`Branch code "${cleanCode}" already exists`);
  }

  const created = await prisma.branch.create({
    data: {
      name: cleanName,
      code: cleanCode,
      location: data.location?.trim() || '',
      active: true,
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/employees');
  return created;
}

export async function deleteBranch(id: number) {
  await requireSuperAdmin();

  const deleted = await prisma.branch.delete({
    where: { id },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/super-admin');
  revalidatePath('/employees');
  return deleted;
}
