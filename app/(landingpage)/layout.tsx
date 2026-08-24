import Navbar from '@/components/Navbar';
import React, { PropsWithChildren } from 'react';

export default function layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}

