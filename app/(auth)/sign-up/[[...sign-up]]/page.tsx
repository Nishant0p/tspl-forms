import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Employee Signup Disabled</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Accounts are created internally by administrators. Please sign in with your assigned employee credentials.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
