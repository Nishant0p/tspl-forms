'use client';

import {
  FormElementInstance,
  FormElements,
} from '@/app/(dashboard)/_components/FormElements';
import { SubmitForm } from '@/app/actions/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Loader, AlertCircle, CheckCircle2, PartyPopper, ExternalLink, Sparkles, ShieldAlert } from 'lucide-react';
import { useRef, useState, useTransition, useEffect } from 'react';

interface Props {
  formUrl: string;
  formName: string;
  formDescription: string;
  content: FormElementInstance[];
}

export default function FormSubmitComponent({ formUrl, formName, formDescription, content }: Props) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());

  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Extract BannerField to display at the very top above the form header card
  const bannerElement = content.find((el) => el.type === 'BannerField');
  // Filter out layout/special elements during validation and question rendering
  const questionsContent = content.filter(
    (el) => el.type !== 'ThankYouField' && el.type !== 'BannerField'
  );

  // Input questions only (exclude layout text / dividers)
  const inputQuestions = questionsContent.filter(
    (el) =>
      ![
        'TitleField',
        'SubTitleField',
        'ParagraphField',
        'SeperatorField',
        'SpacerField',
        'SectionHeaderField',
        'BannerField',
      ].includes(el.type)
  );

  const totalQuestions = inputQuestions.length;
  const progressPercentage =
    totalQuestions > 0 ? Math.min(Math.round((answeredCount / totalQuestions) * 100), 100) : 100;

  // Restore draft from LocalStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('tspl_draft_' + formUrl);
      if (draft) {
        const parsed = JSON.parse(draft);
        formValues.current = parsed;
        let count = 0;
        for (const q of inputQuestions) {
          const val = parsed[q.id];
          if (val && String(val).trim() !== '' && val !== '[]') {
            count++;
          }
        }
        setAnsweredCount(count);
        setRenderKey(Date.now());
      }
    } catch {
      // LocalStorage unavailable
    }
  }, [formUrl]);

  const validateForm: () => boolean = () => {
    for (const field of questionsContent) {
      const actualValue = formValues.current[field.id] || '';
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  };

  const submitValues = (key: string, value: string) => {
    formValues.current[key] = value;

    // Recalculate answered fields
    let count = 0;
    for (const q of inputQuestions) {
      const val = formValues.current[q.id];
      if (val && String(val).trim() !== '' && val !== '[]') {
        count++;
      }
    }
    setAnsweredCount(count);

    // Auto-save progress
    try {
      localStorage.setItem('tspl_draft_' + formUrl, JSON.stringify(formValues.current));
    } catch {
      // LocalStorage unavailable
    }
  };

  const submitForm = async () => {
    formErrors.current = {};

    const validForm = validateForm();

    if (!validForm) {
      setRenderKey(new Date().getTime());

      toast({
        title: 'Form is invalid',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      await SubmitForm(formUrl, jsonContent);
      try {
        localStorage.removeItem('tspl_draft_' + formUrl);
      } catch {}
      setSubmitted(true);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong, please try again later',
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    // Check if form layout has a custom Thank You element
    const customThankYou = content.find((el) => el.type === 'ThankYouField');
    const extra = customThankYou?.extraAttributes || {};

    const customTitle = extra.title || formName;
    const customMessage = extra.message || 'Your response has been recorded.';
    const customImageUrl = extra.imageUrl || '';
    const customBtnText = extra.buttonText || 'Submit another response';
    const customBtnUrl = extra.buttonUrl || '';
    const showBtn = extra.showRedirectButton ?? true;

    return (
      <div className="flex min-h-screen w-full items-start justify-center p-4 sm:p-8 google-form-container bg-slate-100 dark:bg-slate-950">
        <div
          key={renderKey}
          className="flex w-full max-w-[640px] flex-col gap-6 google-form-header-card bg-card text-card-foreground p-0 rounded-2xl shadow-xl border border-border mt-6 sm:mt-10 overflow-hidden"
        >
          {/* Branded 50% Blue, 40% Orange, 10% White Accent Strip */}
          <div className="h-3.5 w-full flex overflow-hidden">
            <div className="w-1/2 bg-blue-600 dark:bg-blue-500" title="50% Blue" />
            <div className="w-[40%] bg-orange-500 dark:bg-orange-600" title="40% Orange" />
            <div className="w-[10%] bg-white dark:bg-slate-100 border-l border-orange-400/40" title="10% White" />
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Custom Banner / Image if configured */}
            {customImageUrl && (
              <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customImageUrl}
                  alt="Thank You Illustration"
                  className="w-full max-h-64 object-cover rounded-md"
                />
              </div>
            )}

            <div className="flex items-center gap-4 border-b border-border/80 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-orange-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                {customThankYou ? <PartyPopper className="h-7 w-7 text-orange-500" /> : <CheckCircle2 className="h-7 w-7 text-blue-600" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Response Recorded</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
                  {customTitle}
                </h1>
              </div>
            </div>

            <p className="text-base text-foreground/85 whitespace-pre-wrap leading-relaxed">
              {customMessage}
            </p>

            {showBtn && (
              <div className="mt-2 pt-2">
                {customBtnUrl ? (
                  <a
                    href={customBtnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-7 py-3 text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
                  >
                    <span>{customBtnText}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      formValues.current = {};
                      formErrors.current = {};
                      setSubmitted(false);
                      setAnsweredCount(0);
                      setRenderKey(new Date().getTime());
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-600 dark:text-blue-400 dark:hover:text-orange-400 underline underline-offset-4 transition-colors"
                  >
                    {customBtnText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 sm:p-8 google-form-container bg-slate-100 dark:bg-slate-950">
      <div key={renderKey} className="flex w-full max-w-[640px] flex-col gap-4 py-2 sm:py-4">
        {/* Top Banner Card (Above Form Header) - 100% width on all phones */}
        {bannerElement && (
          <div className="w-full overflow-hidden rounded-xl shadow-md border border-border/60">
            {(() => {
              const BannerComponent = FormElements.BannerField.formComponent;
              return <BannerComponent elementInstance={bannerElement} />;
            })()}
          </div>
        )}

        {/* Google Form Header Card */}
        <div className="w-full bg-card text-card-foreground rounded-2xl border border-border shadow-md overflow-hidden google-form-header-card relative">
          {/* Branded 50% Blue, 40% Orange, 10% White Theme Accent Strip */}
          <div className="h-3.5 w-full flex overflow-hidden">
            <div className="w-1/2 bg-blue-600 dark:bg-blue-500" title="50% Blue" />
            <div className="w-[40%] bg-orange-500 dark:bg-orange-600" title="40% Orange" />
            <div className="w-[10%] bg-white dark:bg-slate-100 border-l border-orange-400/40" title="10% White" />
          </div>

          <div className="p-5 sm:p-7 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pb-1 min-w-0 w-full">
              {/* Logo badge */}
              <div className="p-1.5 bg-white rounded-lg border border-border/40 shadow-xs shrink-0 self-start sm:self-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/image.png"
                  alt="TSPL Logo"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words w-full leading-tight">
                {formName}
              </h1>
            </div>
            {formDescription && (
              <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed mt-1">
                {formDescription}
              </p>
            )}
            <hr className="border-border my-1" />
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">* Required</p>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                TSPL Form
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Blue-to-Orange Progress Bar */}
        {totalQuestions > 0 && (
          <div className="w-full bg-card p-3.5 sm:p-4 rounded-xl border border-border shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Progress
              </span>
              <span className="text-muted-foreground font-medium">
                {answeredCount} of {totalQuestions} answered ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 transition-all duration-300 rounded-full shadow-xs"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Question Cards */}
        {questionsContent.map((element) => {
          const FormElement = FormElements[element.type].formComponent;
          const isInvalid = formErrors.current[element.id];
          const isLayout = [
            'TitleField',
            'SubTitleField',
            'ParagraphField',
            'SeperatorField',
            'SpacerField',
            'SectionHeaderField',
            'BannerField',
          ].includes(element.type);

          return (
            <div
              key={element.id}
              className={cn(
                'w-full bg-card text-card-foreground p-5 sm:p-6 rounded-xl border border-border shadow-sm transition-all duration-200 border-l-[5px] border-l-blue-600 focus-within:border-l-[6px] focus-within:border-l-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20',
                isInvalid && 'border-red-500 border-l-[6px] border-l-red-500 focus-within:border-l-red-500 focus-within:ring-red-500/20',
                element.type === 'BannerField' &&
                  'p-0 border-none shadow-none bg-transparent w-full overflow-hidden rounded-xl'
              )}
            >
              <FormElement
                elementInstance={element}
                submitFunction={submitValues}
                isInvalid={isInvalid}
                defaultValues={formValues.current[element.id]}
              />
              {isInvalid && !isLayout && (
                <p className="text-xs text-orange-600 font-semibold mt-3 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  This is a required question
                </p>
              )}
            </div>
          );
        })}

        {/* Submit Actions */}
        <div className="flex items-center justify-between mt-4 px-1">
          <Button
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 text-white font-bold text-sm px-8 py-2.5 h-11 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all flex items-center gap-2 border border-orange-400/30"
            onClick={() => {
              startTransition(submitForm);
            }}
            disabled={pending}
          >
            {pending && <Loader className="h-4 w-4 animate-spin" />}
            <span>Submit</span>
          </Button>

          <button
            type="button"
            onClick={() => {
              formValues.current = {};
              formErrors.current = {};
              setAnsweredCount(0);
              try {
                localStorage.removeItem('tspl_draft_' + formUrl);
              } catch {}
              setRenderKey(new Date().getTime());
              toast({
                description: 'Form cleared successfully.',
              });
            }}
            className="text-sm font-semibold text-muted-foreground hover:text-orange-600 hover:underline transition-colors px-2 py-1"
          >
            Clear form
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground mt-8 mb-4">
          This form was created inside TSPL Group.
        </footer>
      </div>
    </div>
  );
}
