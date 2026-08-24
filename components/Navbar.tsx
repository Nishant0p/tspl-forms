import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from './ui/button';
import Logo from './Logo';
import Link from 'next/link';
import { getCurrentUser, isSuperAdmin as checkSuperAdmin } from '@/lib/auth';
import NavbarNavLinks from './NavbarNavLinks';
import UserMenu from './UserMenu';

export default async function Navbar() {
  const user = await getCurrentUser();
  const isSuperAdmin = await checkSuperAdmin();
  const isFormViewer = user?.role === 'FORM_VIEWER';

  return (
    <nav className="flex h-[64px] items-center justify-between border-b border-border px-4 shadow-md">
      <Logo />
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <NavbarNavLinks isFormViewer={isFormViewer} isSuperAdmin={isSuperAdmin} />
        )}
        <ThemeSwitcher />

        {user ? (
          <UserMenu user={user} isSuperAdmin={isSuperAdmin} />
        ) : (
          <Button asChild variant="secondary" className="flex items-center gap-2 font-bold">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
