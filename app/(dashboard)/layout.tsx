import Navbar from '@/components/Navbar';
import React, { PropsWithChildren } from 'react';
import { requireEmployee } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  await requireEmployee();

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-full flex-col overflow-x-hidden relative z-[1]">
        <main className="flex w-full grow">{children}</main>
      </div>
    </>
  );
}
