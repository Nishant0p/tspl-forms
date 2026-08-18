import Logo from '@/components/Logo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import React, { PropsWithChildren } from 'react';

export default function LayoutSubmit({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen min-w-full flex-col bg-[#f0ebf8] dark:bg-[#121016] google-form-container">
      {children}
    </div >
  );
}
