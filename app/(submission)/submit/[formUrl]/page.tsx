import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';
import { GetFormContentByUrl } from '@/app/actions/form';
import FormSubmitComponent from '../../_components/FormSubmitComponent';
import { AuthRequiredError, ForbiddenError } from '@/lib/auth';
import { FormAccessBlockedError } from '@/lib/form-access';
import { redirect } from 'next/navigation';

export default async function SubmitPage({
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
      redirect(`/sign-in?redirect_url=${encodeURIComponent(`/submit/${formUrl}`)}`);
    }

    if (error instanceof FormAccessBlockedError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Form unavailable</p>
            <h1 className="mt-4 text-3xl font-bold">{error.message}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {formUrl ? 'Please check the form link or contact the form owner for access.' : 'Please try again later.'}
            </p>
            <div className="mt-6 flex justify-center">
              <a href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Back to dashboard
              </a>
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
      content={formContent}
    />
  );
}
