import FormBuilderClientWrapper from '@/app/(dashboard)/_components/FormBuilderClientWrapper';
import { GetFormById } from '@/app/actions/form';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const id = resolvedParams?.id;
  const numId = Number(id);

  if (!id || isNaN(numId) || numId <= 0) {
    notFound();
  }

  let form: any = null;
  try {
    form = await GetFormById(numId);
  } catch {
    notFound();
  }

  if (!form) {
    notFound();
  }

  // If user only has read-only viewer access, redirect to form overview/responses
  if (form.canEdit === false) {
    redirect(`/forms/${numId}`);
  }

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

  const rawTab = typeof resolvedSearchParams?.tab === 'string' ? resolvedSearchParams.tab.toLowerCase() : '';
  const initialTab: 'questions' | 'responses' | 'settings' =
    rawTab === 'responses' || rawTab === 'response' || rawTab === 'submissions'
      ? 'responses'
      : rawTab === 'settings'
      ? 'settings'
      : 'questions';

  return (
    <FormBuilderClientWrapper
      form={form}
      departments={departments}
      branches={branches}
      employees={employees}
      initialTab={initialTab}
    />
  );
}
