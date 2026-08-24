'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { logoutUser } from '@/app/actions/employee';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileModal from './UserProfileModal';

type UserMenuProps = {
  user: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    emailAddresses?: { emailAddress: string }[];
    primaryEmailAddress?: { emailAddress: string };
    role?: string;
    imageUrl?: string | null;
    departmentId?: number | null;
    branchId?: number | null;
  };
  isSuperAdmin: boolean;
};

export default function UserMenu({ user, isSuperAdmin }: UserMenuProps) {
  const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition-opacity overflow-hidden"
          title="Account Menu"
        >
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || 'User DP'} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold overflow-hidden border">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName || 'User DP'} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">{email}</p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              {user.role}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Self-Edit Profile option */}
        <UserProfileModal
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: email,
            role: user.role,
            imageUrl: user.imageUrl,
            departmentId: user.departmentId,
            branchId: user.branchId,
          }}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Edit My Profile</span>
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        {isSuperAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/super-admin"
                className="flex w-full items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400 font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                Super Admin Portal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <form action={logoutUser}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="flex w-full items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
