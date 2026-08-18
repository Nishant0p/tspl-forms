import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Access denied</p>
        <h1 className="mt-4 text-3xl font-bold">You are not allowed to view this form.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The form is restricted to specific employees, departments, branches, or roles.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}