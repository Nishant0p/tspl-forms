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
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;
  const isFormViewer = user?.role === 'FORM_VIEWER';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-xs">
      <nav className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-3">
          {user && (
            <NavbarNavLinks isFormViewer={isFormViewer} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
          )}
          <ThemeSwitcher />

          {user ? (
            <UserMenu user={user} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
          ) : (
            <Button asChild variant="secondary" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold h-9 px-3">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
