'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    fetch('/api/session-check', { method: 'HEAD' })
      .then((r) => setIsSignedIn(r.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <section className="relative h-full w-full flex-1 flex items-center justify-center overflow-hidden bg-background py-6">
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

      <div className="container relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-8 px-4 text-center">

        {/* Security & System Pill Header */}
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/25 bg-background/80 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-foreground shadow-md backdrop-blur-xl transition-all hover:border-primary/40">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>TSPL Forms &amp; Workflow</span>
          <span className="h-1 w-1 rounded-full bg-border hidden sm:inline-block" />
          <span className="text-muted-foreground font-medium hidden sm:inline-block">Internal Enterprise Edition</span>
        </div>

        {/* Logo & Orbital Rings */}
        <div className="relative flex items-center justify-center py-2 sm:py-3">
          {/* Decorative Animated Outer Orbital Rings */}
          <div 
            className="absolute h-36 w-36 sm:h-48 sm:w-48 rounded-full border border-primary/20 animate-spin border-dashed" 
            style={{ animationDuration: '30s' }}
          />
          <div 
            className="absolute h-44 w-44 sm:h-56 sm:w-56 rounded-full border border-violet-500/20 animate-spin" 
            style={{ animationDuration: '40s', animationDirection: 'reverse' }}
          />

          <div className="relative z-10 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-card/90 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl border border-border/80 transition-all duration-300 hover:scale-105 hover:shadow-primary/10">
            <Image
              src="/image.png"
              alt="TSPL Group"
              width={360}
              height={140}
              className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center justify-center gap-3 sm:gap-4 pt-2">
          {isSignedIn ? (
            <Button asChild size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-8 text-base font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 gap-2">
              <Link href="/dashboard">
                Launch Workspace <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-8 text-base font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 gap-2">
              <Link href="/sign-in">
                Sign In to Platform <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-7 text-base font-semibold rounded-xl sm:rounded-2xl border-border/80 bg-card/60 backdrop-blur-md hover:bg-accent hover:border-primary/40 transition-all">
            <Link href="/form-requests">
              Submit Form Request
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
