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
  Zap,
  Lock,
  Workflow,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const navBoxes = [
  {
    icon: Globe,
    title: 'Platform Requests',
    subtitle: 'Build & Submit',
    description: 'Submit new form creation requests, track approval status, and manage operational workflows.',
    href: '/form-requests',
    gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
    border: 'border-blue-500/30 hover:border-blue-500/70 hover:shadow-blue-500/15',
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-blue-500/10',
    badge: 'Requests',
  },
  {
    icon: LayoutDashboard,
    title: 'Forms Dashboard',
    subtitle: 'Manage & Monitor',
    description: 'Access form templates, review response metrics, track submissions, and control live forms.',
    href: '/dashboard',
    gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
    border: 'border-violet-500/30 hover:border-violet-500/70 hover:shadow-violet-500/15',
    iconBg: 'bg-violet-500/10 text-violet-500 border border-violet-500/20 shadow-violet-500/10',
    badge: 'Dashboard',
  },
  {
    icon: Users,
    title: 'Employee Directory',
    subtitle: 'Access & Governance',
    description: 'Manage employee accounts, assign granular role permissions (Admin, Editor, Form Viewer).',
    href: '/employees',
    gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    border: 'border-emerald-500/30 hover:border-emerald-500/70 hover:shadow-emerald-500/15',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/10',
    badge: 'Governance',
  },
  {
    icon: Database,
    title: 'Data & Analytics',
    subtitle: 'Export & Audits',
    description: 'Generate real-time analytics reports, audit submission logs, and export response datasets.',
    href: '/dashboard',
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    border: 'border-amber-500/30 hover:border-amber-500/70 hover:shadow-amber-500/15',
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/10',
    badge: 'Analytics',
  },
];

const platformHighlights = [
  { icon: Zap, label: 'Instant Drag & Drop Form Builder' },
  { icon: Lock, label: 'Role-Based Access Control (RBAC)' },
  { icon: Workflow, label: 'Automated Approval Workflows' },
  { icon: Layers, label: 'Real-time Response Analytics' },
];

export default function Hero() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    fetch('/api/session-check', { method: 'HEAD' })
      .then((r) => setIsSignedIn(r.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-background py-10 lg:py-16">
      {/* Premium Multi-Layered Glowing Mesh Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-600/25 via-violet-600/20 to-indigo-500/15 blur-[140px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute bottom-10 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px]" />
        
        {/* Subtle Radial Mesh Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)`,
            backgroundSize: '36px 36px'
          }} 
        />
      </div>

      <div className="container relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-10 px-4 text-center">

        {/* Security & System Pill Header */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-background/80 px-4 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-xl transition-all hover:border-primary/40 hover:scale-105">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>TSPL Forms &amp; Workflow System</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="text-muted-foreground font-medium">Internal Enterprise Edition</span>
        </div>

        {/* Logo & Orbital Rings */}
        <div className="relative flex items-center justify-center py-3">
          {/* Decorative Animated Outer Orbital Rings */}
          <div 
            className="absolute h-48 w-48 rounded-full border border-primary/20 animate-spin border-dashed" 
            style={{ animationDuration: '30s' }}
          />
          <div 
            className="absolute h-56 w-56 rounded-full border border-violet-500/20 animate-spin" 
            style={{ animationDuration: '40s', animationDirection: 'reverse' }}
          />

          <div className="relative z-10 flex items-center justify-center rounded-3xl bg-card/90 p-5 shadow-2xl backdrop-blur-2xl border border-border/80 transition-all duration-300 hover:scale-105 hover:shadow-primary/10">
            <Image
              src="/TSPL Logo preloader.png"
              alt="TSPL Group"
              width={360}
              height={140}
              className="h-28 w-auto object-contain drop-shadow-lg sm:h-32"
              priority
            />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
            Next-Gen Forms &{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-indigo-300">
              Automated Workflows
            </span>
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Design dynamic internal forms, streamline multi-level approvals, enforce granular employee access control, and capture actionable data insights.
          </p>

          {/* Quick Platform Highlight Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {platformHighlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isSignedIn ? (
            <Button asChild size="lg" className="h-13 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 gap-2">
              <Link href="/dashboard">
                Launch Workspace <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-13 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 gap-2">
              <Link href="/sign-in">
                Sign In to Platform <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="lg" className="h-13 px-7 text-base font-semibold rounded-2xl border-border/80 bg-card/60 backdrop-blur-md hover:bg-accent hover:border-primary/40 transition-all">
            <Link href="/form-requests">
              Submit Form Request
            </Link>
          </Button>
        </div>

        {/* 4 Interactive Feature Cards */}
        <div className="grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-4 text-left">
          {navBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <Link
                key={box.title}
                href={box.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b ${box.gradient} p-6 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${box.border}`}
              >
                {/* Glowing Top Right Accent Line */}
                <div className="absolute top-0 right-0 h-1 w-16 bg-gradient-to-l from-primary/50 to-transparent transition-all group-hover:w-full" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${box.iconBg} transition-all duration-300 group-hover:scale-110 shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-background/80 text-foreground border border-border/60 shadow-xs">
                      {box.badge}
                    </span>
                  </div>

                  <h2 className="font-bold text-base text-foreground mb-1 flex items-center justify-between">
                    {box.title}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {box.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary opacity-80 group-hover:opacity-100">
                  <span>Explore Feature</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Security & Access Protection Notice */}
        <div className="inline-flex items-center gap-3 rounded-2xl border border-border/80 bg-card/70 px-5 py-3 text-xs text-muted-foreground backdrop-blur-xl shadow-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-left">
            <strong className="block text-foreground font-semibold">Protected Enterprise Environment</strong>
            <span>Secured via SSL encryption, JWT cookies &amp; role-based access governance.</span>
          </div>
        </div>

      </div>
    </section>
  );
}


