import Logo from '@/components/Logo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import React, { PropsWithChildren } from 'react';

export default function LayoutSubmit({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen min-w-full flex-col bg-slate-100 dark:bg-slate-950 google-form-container">
      {children}
    </div>
  );
}
