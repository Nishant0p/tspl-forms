import dynamic from 'next/dynamic';
import { GetFormById } from '@/app/actions/form';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import React from 'react';

const FormBuilder = dynamic(
  () => import('@/app/(dashboard)/_components/FormBuilder'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-60px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading Form Builder...</p>
        </div>
      </div>
    ),
  }
);

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
