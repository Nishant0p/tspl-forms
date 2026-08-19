'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, LayoutDashboard, Users, Database, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const navBoxes = [
  {
    icon: Globe,
    title: 'Platform',
    description: 'Submit or track form build requests, workflows, and operations.',
    href: '/form-requests',
    color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
    iconColor: 'text-blue-500',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Access your forms, submissions, stats, and manage workflows.',
    href: '/dashboard',
    color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40',
    iconColor: 'text-violet-500',
  },
  {
    icon: Users,
    title: 'Employees',
    description: 'View and manage employee accounts, roles, and status.',
    href: '/employees',
    color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Database,
    title: 'Data',
    description: 'Reports, exports, audit trails, and response management.',
    href: '/dashboard',
    color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-500',
  },
];

export default function Hero() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    fetch('/api/session-check', { method: 'HEAD' })
      .then(r => setIsSignedIn(r.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <section className="h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex h-full flex-col items-center justify-center gap-8 px-4 animate-in fade-in slide-in-from-top-4 duration-700">

        {/* Logo */}
        <Image
          src="/TSPL Logo preloader.png"
          alt="TSPL Group"
          width={400}
          height={160}
          className="h-36 w-auto object-contain drop-shadow-md"
          priority
        />

        {/* CTA button */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Button asChild size="lg" className="font-semibold px-8">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="font-semibold px-8">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>

        {/* 4 Navigation Boxes */}
        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {navBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <Link
                key={box.title}
                href={box.href}
                className={`group flex flex-col gap-3 rounded-xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${box.color}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background/60 ${box.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base mb-1 flex items-center gap-1">
                    {box.title}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{box.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
