import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from './ui/button';
import Logo from './Logo';
import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import { logoutUser } from '@/app/actions/employee';
import { getCurrentUser, isSuperAdmin as checkSuperAdmin } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import NavbarNavLinks from './NavbarNavLinks';

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition-opacity">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">
                  {user.primaryEmailAddress.emailAddress}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                  {user.role}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isSuperAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin" className="flex w-full items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Super Admin Portal
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <form action={logoutUser}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="flex w-full items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="secondary" className="flex items-center gap-2 font-bold">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
