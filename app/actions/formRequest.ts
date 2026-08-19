'use server';

import prisma from '@/lib/prisma';
import { requireEmployee } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { FormRequestStatus } from '@prisma/client';

const REQUESTER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'];
const EDITOR_ROLES    = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

export async function createFormRequest(data: {
  title: string;
  description: string;
  formType: string;
  priority: string;
}) {
  const caller = await requireEmployee();

  if (!REQUESTER_ROLES.includes(caller.role)) {
    throw new Error('Only Admin, HR, or Manager can submit form requests.');
  }

  await prisma.formRequest.create({
    data: {
      title:         data.title.trim(),
      description:   data.description.trim(),
      formType:      data.formType,
      priority:      data.priority,
      requestedById: Number(caller.id),
      status:        FormRequestStatus.PENDING,
    },
  });

  revalidatePath('/form-requests');
  return { success: true };
}

export async function getFormRequests() {
  const caller = await requireEmployee();

  const where = EDITOR_ROLES.includes(caller.role)
    ? {}
    : { requestedById: Number(caller.id) };

  const requests = await prisma.formRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          department: { select: { name: true } },
        },
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return requests;
}

export async function assignFormRequest(requestId: number) {
  const caller = await requireEmployee();
  if (!EDITOR_ROLES.includes(caller.role)) {
    throw new Error('Only Editors or Admins can pick up requests.');
  }

  await prisma.formRequest.update({
    where: { id: requestId },
    data: {
      status:       FormRequestStatus.IN_PROGRESS,
      assignedToId: Number(caller.id),
    },
  });

  revalidatePath('/form-requests');
  return { success: true };
}

export async function updateFormRequestStatus(
  requestId: number,
  status: FormRequestStatus,
  notes?: string
) {
  const caller = await requireEmployee();
  if (!EDITOR_ROLES.includes(caller.role)) {
    throw new Error('Only Editors or Admins can update request status.');
  }

  await prisma.formRequest.update({
    where: { id: requestId },
    data: {
      status,
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  revalidatePath('/form-requests');
  return { success: true };
}
