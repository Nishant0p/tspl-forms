import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/80 p-8 text-center shadow-xl backdrop-blur-xl space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Access Denied</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
            Permission Restricted
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You do not currently have access to this page or form. Access may be restricted to specific employee roles, departments, or branches.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline" className="w-full sm:w-auto text-xs">
            <Link href="/sign-in" className="gap-2">
              <LogIn className="h-3.5 w-3.5" /> Sign In Again
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto text-xs">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}