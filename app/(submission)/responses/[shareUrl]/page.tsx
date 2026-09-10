import { GetFormSubmissionsByShareUrl } from '@/app/actions/form';
import ResponsesViewerClient from './_components/ResponsesViewerClient';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { shareUrl: string };
}): Promise<Metadata> {
  try {
    const form = await GetFormSubmissionsByShareUrl(params.shareUrl);
    return {
      title: `${form.name} — Responses Viewer | TSPL Forms`,
      description: `View submitted responses and statistics for ${form.name}.`,
    };
  } catch {
    return {
      title: 'Form Responses | TSPL Forms',
    };
  }
}

export default async function ResponsesPage({
  params,
}: {
  params: { shareUrl: string };
}) {
  const { shareUrl } = params;

  let form: any = null;

  try {
    form = await GetFormSubmissionsByShareUrl(shareUrl);
  } catch (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground text-center shadow-xl p-8 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Responses Link Unavailable</h1>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This responses link may be invalid, closed, or has been updated by the form administrator.
            </p>
          </div>
          <Button asChild variant="outline" className="text-xs">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Home
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return <ResponsesViewerClient form={form} />;
}
