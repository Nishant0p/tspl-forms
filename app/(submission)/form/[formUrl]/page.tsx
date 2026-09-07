import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';
import { GetFormContentByUrl } from '@/app/actions/form';
import FormSubmitComponent from '../../_components/FormSubmitComponent';
import { AuthRequiredError, ForbiddenError } from '@/lib/auth';
import { FormAccessBlockedError } from '@/lib/form-access';
import { redirect } from 'next/navigation';

export default async function FormPage({
  params,
}: {
  params: { formUrl: string };
}) {
  const { formUrl } = params;

  let form;

  try {
    form = await GetFormContentByUrl(formUrl);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/sign-in?redirect_url=${encodeURIComponent(`/form/${formUrl}`)}`);
    }

    if (error instanceof FormAccessBlockedError) {
      return (
        <main className="flex min-h-screen items-center justify-center google-form-container bg-slate-100 dark:bg-slate-950 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground text-center shadow-xl overflow-hidden google-form-header-card">
            {/* Branded 50% Blue, 40% Orange, 10% White Accent Strip */}
            <div className="h-3.5 w-full flex overflow-hidden">
              <div className="w-1/2 bg-blue-600 dark:bg-blue-500" />
              <div className="w-[40%] bg-orange-500 dark:bg-orange-600" />
              <div className="w-[10%] bg-white dark:bg-slate-100 border-l border-orange-400/40" />
            </div>
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">Form unavailable</p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground">{error.message}</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {formUrl ? 'Please check the form link or contact the form administrator for access.' : 'Please try again later.'}
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="/dashboard"
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/25 transition-all"
                >
                  Back to dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      );
    }

    if (error instanceof ForbiddenError) {
      redirect('/access-denied');
    }

    throw error;
  }

  if (!form) {
    throw new Error('Form not found');
  }

  const formContent = JSON.parse(form.content) as FormElementInstance[];

  return (
    <FormSubmitComponent
      formUrl={formUrl}
      formName={form.name}
      formDescription={form.description || ''}
      content={formContent}
    />
  );
}
