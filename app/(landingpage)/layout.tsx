import Navbar from '@/components/Navbar';
import React, { PropsWithChildren } from 'react';

export default function layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

