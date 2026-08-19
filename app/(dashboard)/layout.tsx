import Navbar from '@/components/Navbar';
import React, { PropsWithChildren } from 'react';
import { requireEmployee } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  await requireEmployee();

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen min-w-full flex-col bg-background">
        <main className="flex w-full grow">{children}</main>
      </div>
    </>
  );
}
