'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, ShieldCheck, LayoutDashboard, Users, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDashboardActive =
    pathname === '/dashboard' ||
    pathname.startsWith('/forms/') ||
    pathname.startsWith('/builder/') ||
    pathname.startsWith('/dashboard/');

  const isEmployeesActive = pathname.startsWith('/employees');
  const isRequestsActive = pathname.startsWith('/form-requests');
  const isAdminActive = pathname === '/admin' || pathname.startsWith('/admin');
  const isSuperAdminActive = pathname.startsWith('/super-admin');

  const mobileLinkClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors',
      isActive
        ? 'bg-white/20 font-semibold text-white'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    );

  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      <div className="hidden items-center gap-1 sm:flex sm:gap-2">
      {/* Dashboard / My Form */}
      <Link
        href="/dashboard"
        className={cn(
          'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
          isDashboardActive
            ? 'text-white font-semibold bg-white/20'
            : 'text-white/80 hover:text-white hover:bg-white/10'
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

      {isAdmin && (
        <Link
          href="/employees"
          className={cn(
            'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
            isEmployeesActive
              ? 'text-white font-semibold bg-white/20'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Users</span>
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

      {/* Requests */}
      <Link
        href="/form-requests"
        className={cn(
          'group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base font-medium transition-all duration-200 rounded-md',
          isRequestsActive
            ? 'text-white font-semibold bg-white/20'
            : 'text-white/80 hover:text-white hover:bg-white/10'
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
              ? 'text-sky-300 bg-sky-400/20'
              : 'text-sky-300/80 hover:text-sky-300 hover:bg-sky-400/10'
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
              ? 'text-purple-300 bg-purple-400/20'
              : 'text-purple-300/80 hover:text-purple-300 hover:bg-purple-400/10'
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

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="sm:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isMobileMenuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-xl border border-border bg-background/95 backdrop-blur-md p-2 shadow-xl sm:hidden">
          <Link
            href="/dashboard"
            className={mobileLinkClass(isDashboardActive)}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {isFormViewer ? 'My Form' : 'Dashboard'}
          </Link>

          {isAdmin && (
            <Link
              href="/employees"
              className={mobileLinkClass(isEmployeesActive)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4 shrink-0" />
              Users
            </Link>
          )}

          <Link
            href="/form-requests"
            className={mobileLinkClass(isRequestsActive)}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className="h-4 w-4 shrink-0" />
            Requests
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={mobileLinkClass(isAdminActive)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Admin Portal
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              href="/super-admin"
              className={mobileLinkClass(isSuperAdminActive)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Super Admin
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
