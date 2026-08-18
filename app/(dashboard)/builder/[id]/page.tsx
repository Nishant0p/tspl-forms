import FormBuilder from '@/app/(dashboard)/_components/FormBuilder';
import { GetFormById } from '@/app/actions/form';
import prisma from '@/lib/prisma';
import React from 'react';

export default async function BuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const form = await GetFormById(Number(id));
  const db = prisma as any;

  const [departments, branches, employees] = await Promise.all([
    db.department.findMany({
      orderBy: { name: 'asc' },
    }),
    db.branch.findMany({
      orderBy: { name: 'asc' },
    }),
    db.employee.findMany({
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        department: true,
        branch: true,
      },
    }),
  ]);

  if (!form) {
    throw new Error('Form not found');
  }

  return (
    <FormBuilder
      form={form}
      departments={departments}
      branches={branches}
      employees={employees}
    />
  );
}
