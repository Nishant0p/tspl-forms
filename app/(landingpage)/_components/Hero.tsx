'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  LayoutDashboard,
  Users,
  Database,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const navBoxes = [
  {
    icon: Globe,
    title: 'Platform',
    description: 'Submit or track form build requests, workflows, and operations.',
    href: '/form-requests',
    color: 'from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/10',
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    badge: 'Requests',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Access your forms, submissions, stats, and manage workflows.',
    href: '/dashboard',
    color: 'from-violet-500/15 via-violet-500/5 to-transparent border-violet-500/30 hover:border-violet-500/60 hover:shadow-violet-500/10',
    iconBg: 'bg-violet-500/10 text-violet-500 border border-violet-500/20',
    badge: 'Main',
  },
  {
    icon: Users,
    title: 'Employees',
    description: 'View and manage employee accounts, roles, and status.',
    href: '/employees',
    color: 'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    badge: 'Management',
  },
  {
    icon: Database,
    title: 'Data',
    description: 'Reports, exports, audit trails, and response management.',
    href: '/dashboard',
    color: 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10',
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    badge: 'Analytics',
  },
];

export default function Hero() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    fetch('/api/session-check', { method: 'HEAD' })
      .then((r) => setIsSignedIn(r.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-background py-8 lg:py-12">
      {/* Dynamic Background Effects & Orbital Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-10 -right-32 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px]" />
        
        {/* Ambient Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
      </div>

      <div className="container relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">

        {/* Security & System Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-md transition-all hover:bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
          <span>TSPL Forms & Workflow Platform</span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-muted-foreground font-semibold">Internal Use Only</span>
        </div>

        {/* Hero Logo & Orbital Frame */}
        <div className="relative flex items-center justify-center py-2">
          {/* Subtle Outer Orbital Rings */}
          <div className="absolute h-44 w-44 rounded-full border border-primary/15 animate-spin [animation-duration:25s] border-dashed" />
          <div className="absolute h-52 w-52 rounded-full border border-purple-500/10 animate-spin [animation-duration:35s] [animation-direction:reverse]" />

          <div className="relative z-10 flex items-center justify-center rounded-2xl bg-background/60 p-4 shadow-xl backdrop-blur-xl border border-border/50 transition-transform duration-300 hover:scale-105">
            <Image
              src="/TSPL Logo preloader.png"
              alt="TSPL Group"
              width={340}
              height={140}
              className="h-28 w-auto object-contain drop-shadow-md sm:h-32"
              priority
            />
          </div>
        </div>

        {/* Main Headline & Copy */}
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Enterprise Forms &{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-indigo-300">
              Smart Workflows
            </span>
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed max-w-xl mx-auto">
            Build dynamic internal forms, automate approval pipelines, manage employee roles, and analyze response data seamlessly.
          </p>
        </div>

        {/* Action Callouts */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          {isSignedIn ? (
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2">
              <Link href="/sign-in">
                Sign In to Platform <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base font-medium border-border/80 bg-background/50 backdrop-blur-sm hover:bg-accent">
            <Link href="/form-requests">
              Submit Form Request
            </Link>
          </Button>
        </div>

        {/* 4 Navigation Cards */}
        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {navBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <Link
                key={box.title}
                href={box.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${box.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${box.iconBg} shadow-sm transition-transform group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/40">
                      {box.badge}
                    </span>
                  </div>

                  <h2 className="font-bold text-base text-foreground mb-1 flex items-center justify-between">
                    {box.title}
                    <ChevronRight className="h-4 w-4 opacity-40 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {box.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secure Note Footer */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            <strong className="text-foreground font-semibold">Secure Sign-In:</strong> Protected with SSL encryption & internal RBAC permissions.
          </span>
        </div>

      </div>
    </section>
  );
}

