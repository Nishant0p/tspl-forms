'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SignInFormProps {
  csrfToken: string;
}

export default function SignInForm({ csrfToken }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const result = await loginUser(email, password, csrfToken);
        if (result?.success) {
          router.push('/dashboard');
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || 'Invalid email/Employee ID or password');
      }
    });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient Radial Blur Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-10 -right-32 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px]" />

        {/* Ambient Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="w-full max-w-md space-y-6 text-center">
        {/* Top Tag & Logo */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-md transition-all hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            <span>TSPL Internal Portal</span>
          </Link>

          {/* Logo Frame */}
          <div className="relative flex items-center justify-center py-2">
            <div
              className="absolute h-32 w-32 rounded-full border border-primary/20 animate-spin border-dashed"
              style={{ animationDuration: '25s' }}
            />
            <div className="relative z-10 flex items-center justify-center rounded-2xl bg-background/80 p-3 shadow-xl backdrop-blur-xl border border-border/80 transition-transform duration-300 hover:scale-105">
              <Image
                src="/image.png"
                alt="TSPL Group"
                width={260}
                height={100}
                className="h-16 w-auto object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Sign in to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-indigo-300">
                TSPL Forms
              </span>
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-1">
              Enter your credentials to access your employee workspace
            </p>
          </div>
        </div>

        {/* Sign In Card */}
        <div className="rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-left space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hidden CSRF Token Field */}
            <input type="hidden" name="csrfToken" value={csrfToken} />

            {/* Username / Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Email or Employee ID
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  placeholder="e.g. admin@tspl.group or EMP001"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                  autoComplete="username"
                  className="h-12 rounded-xl bg-background/60 border-border/80 px-4 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                  autoComplete="current-password"
                  className="h-12 rounded-xl bg-background/60 border-border/80 pl-4 pr-11 text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground p-1"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-ping shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In to Workspace <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Secure Note Box */}
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <strong className="flex items-center gap-1 text-foreground font-semibold">
                <Shield className="h-3.5 w-3.5 text-blue-500 inline" /> CSRF Protected Sign-In
              </strong>
              <span>Anti-CSRF token verified. Internal Employee Access Only.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-1 pt-2">
          <p className="text-xs text-muted-foreground font-medium">
            TSPL Forms &amp; Workflow Platform
          </p>
          <p className="text-[11px] text-muted-foreground/60 font-semibold tracking-wider uppercase">
            Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
}
