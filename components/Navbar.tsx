import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from './ui/button';
import Logo from './Logo';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogOut, User } from 'lucide-react';
import { logoutUser } from '@/app/actions/employee';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getSession() {
  try {
    const raw = cookies().get('session_user')?.value;
    if (!raw) return null;
    return JSON.parse(raw) as {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      imageUrl?: string;
    };
  } catch {
    return null;
  }
}

export default function Navbar() {
  const session = getSession();

  return (
    <nav className="flex h-[64px] items-center justify-between border-b border-border px-4 shadow-md">
      <Logo />
      <div className="flex items-center gap-4">
        <Button asChild variant={'link'}>
          <Link href={'/platform'} className="text-lg">Platform</Link>
        </Button>
        {session && (
          <>
            <Button asChild variant={'link'}>
              <Link href={'/dashboard'} className="text-lg">Dashboard</Link>
            </Button>
            <Button asChild variant={'link'}>
              <Link href={'/employees'} className="text-lg">Employees</Link>
            </Button>
            <Button asChild variant={'link'}>
              <Link href={'/form-requests'} className="text-lg">Requests</Link>
            </Button>
          </>
        )}
        <ThemeSwitcher />

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition-opacity">
                {session.firstName?.[0]}{session.lastName?.[0]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{session.firstName} {session.lastName}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">{session.email}</p>
                <p className="text-xs text-muted-foreground font-normal">{session.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
