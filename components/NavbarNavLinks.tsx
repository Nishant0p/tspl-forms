'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarNavLinksProps {
  isFormViewer?: boolean;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
}

export default function NavbarNavLinks({
  isFormViewer = false,
  isSuperAdmin = false,
  isAdmin = false,
}: NavbarNavLinksProps) {
  const pathname = usePathname();

  const isDashboardActive =
    pathname === '/dashboard' ||
    pathname.startsWith('/forms/') ||
    pathname.startsWith('/builder/') ||
    pathname.startsWith('/dashboard/');

  const isEmployeesActive = pathname.startsWith('/employees');
  const isRequestsActive = pathname.startsWith('/form-requests');
  const isAdminActive = pathname === '/admin' || pathname.startsWith('/admin');
  const isSuperAdminActive = pathname.startsWith('/super-admin');

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Dashboard / My Form */}
      <Link
        href="/dashboard"
        className={cn(
          'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
          isDashboardActive
            ? 'text-primary font-semibold bg-primary/10 dark:bg-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{isFormViewer ? 'My Form' : 'Dashboard'}</span>
        <span
          className={cn(
            'absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300',
            isDashboardActive
              ? 'bg-primary scale-x-100'
              : 'bg-primary/50 scale-x-0 group-hover:scale-x-100'
          )}
        />
      </Link>

      {!isFormViewer && (
        <Link
          href="/employees"
          className={cn(
            'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
            isEmployeesActive
              ? 'text-primary font-semibold bg-primary/10 dark:bg-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Employees</span>
          <span
            className={cn(
              'absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300',
              isEmployeesActive
                ? 'bg-primary scale-x-100'
                : 'bg-primary/50 scale-x-0 group-hover:scale-x-100'
            )}
          />
        </Link>
      )}

      {/* Requests (Available to everyone) */}
      <Link
        href="/form-requests"
        className={cn(
          'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
          isRequestsActive
            ? 'text-primary font-semibold bg-primary/10 dark:bg-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Requests</span>
        <span
          className={cn(
            'absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300',
            isRequestsActive
              ? 'bg-primary scale-x-100'
              : 'bg-primary/50 scale-x-0 group-hover:scale-x-100'
          )}
        />
      </Link>

      {/* Admin Portal Link */}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-bold transition-all duration-200 rounded-md',
            isAdminActive
              ? 'text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-500/25'
              : 'text-blue-600/80 dark:text-blue-400/80 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'
          )}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Admin Portal</span>
          <span
            className={cn(
              'absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300',
              isAdminActive
                ? 'bg-blue-600 dark:bg-blue-400 scale-x-100'
                : 'bg-blue-600/50 dark:bg-blue-400/50 scale-x-0 group-hover:scale-x-100'
            )}
          />
        </Link>
      )}

      {/* Super Admin */}
      {isSuperAdmin && (
        <Link
          href="/super-admin"
          className={cn(
            'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-bold transition-all duration-200 rounded-md',
            isSuperAdminActive
              ? 'text-purple-600 dark:text-purple-400 bg-purple-500/15 dark:bg-purple-500/25'
              : 'text-purple-600/80 dark:text-purple-400/80 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10'
          )}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Super Admin</span>
          <span
            className={cn(
              'absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300',
              isSuperAdminActive
                ? 'bg-purple-600 dark:bg-purple-400 scale-x-100'
                : 'bg-purple-600/50 dark:bg-purple-400/50 scale-x-0 group-hover:scale-x-100'
            )}
          />
        </Link>
      )}
    </div>
  );
}
