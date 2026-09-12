import FormBuilder from '@/app/(dashboard)/_components/FormBuilder';
import { GetFormById } from '@/app/actions/form';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function BuilderPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const numId = Number(id);

  if (!id || isNaN(numId) || numId <= 0) {
    notFound();
  }

  const form = await GetFormById(numId);
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
    notFound();
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
