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
import { useRef, useState, useEffect, useMemo } from 'react';
import { getThemeById, getFormBackgroundStyle } from '@/lib/form-themes';
import { evaluateFormConditions } from '@/lib/condition-evaluator';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [formValuesState, setFormValuesState] = useState<{ [key: string]: string }>({});

  // Dynamic conditional logic evaluation (If/Else Decisions & Visible Options)
  const { hiddenFieldIds, fieldOptionOverrides } = useMemo(() => {
    return evaluateFormConditions(content, formValuesState);
  }, [content, formValuesState]);

  // Extract ThemeField if configured
  const themeElement = content.find((el) => el.type === 'ThemeField');
  const themeId = themeElement?.extraAttributes?.themeId || 'orange-waves';
  const customPrimary = themeElement?.extraAttributes?.primaryColor;
  const textureBlur = themeElement?.extraAttributes?.textureBlur ?? 0;
  const themePreset = getThemeById(themeId);
  const bgStyles = getFormBackgroundStyle(themeId, customPrimary, textureBlur);
  const primaryColor = customPrimary || themePreset.primaryColor;

  // Extract BannerField to display at the very top above the form header card
  const bannerElement = content.find((el) => el.type === 'BannerField');
  // Filter out layout/special elements during validation and question rendering
  const questionsContent = content.filter(
    (el) => el.type !== 'ThankYouField' && el.type !== 'BannerField' && el.type !== 'ThemeField'
  );

  // Input questions only (exclude layout text / dividers / auto-capture fields / hidden fields)
  const inputQuestions = questionsContent.filter(
    (el) =>
      !hiddenFieldIds.has(el.id) &&
      ![
        'TitleField',
        'SubTitleField',
        'ParagraphField',
        'SeperatorField',
        'SpacerField',
        'SectionHeaderField',
        'BannerField',
        'TsplCurrentDateTimeField',
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
        setFormValuesState(parsed);
        setRenderKey(Date.now());
      }
    } catch {
      // LocalStorage unavailable
    }
  }, [formUrl]);

  const validateForm: () => boolean = () => {
    for (const field of questionsContent) {
      // Skip fields hidden by conditional logic from validation
      if (hiddenFieldIds.has(field.id)) {
        continue;
      }

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
    setFormValuesState((prev) => ({ ...prev, [key]: value }));

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
      setIsSubmitting(true);

      // Auto-inject submission timestamp for all TsplCurrentDateTimeField elements
      const { format } = await import('date-fns');
      const submissionStamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      for (const el of content) {
        if (el.type === 'TsplCurrentDateTimeField') {
          formValues.current[el.id] = submissionStamp;
        }
      }

      // Exclude hidden field values from the final submission
      const sanitizedValues = { ...formValues.current };
      for (const hiddenId of hiddenFieldIds) {
        delete sanitizedValues[hiddenId];
      }

      const jsonContent = JSON.stringify(sanitizedValues);
      const res = await SubmitForm(formUrl, jsonContent);

      if (!res.success) {
        toast({
          title: 'Submission Failed',
          description: res.error || 'Something went wrong, please try again later.',
          variant: 'destructive',
        });
        return;
      }

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
    } finally {
      setIsSubmitting(false);
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
      <div
        className={cn(
          'flex min-h-screen w-full items-start justify-center p-3 sm:p-8 google-form-container relative transition-colors',
          bgStyles.isDarkTheme ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 dark:bg-slate-950'
        )}
      >
        {/* Background Texture with isolated blur layer */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              ...bgStyles.containerStyle,
              filter: bgStyles.blurPx ? `blur(${bgStyles.blurPx}px)` : undefined,
              transform: bgStyles.blurPx ? 'scale(1.06)' : undefined,
            }}
          />
          {bgStyles.overlayClass && (
            <div className={cn('absolute inset-0', bgStyles.overlayClass)} />
          )}
        </div>

        <div
          key={renderKey}
          className="relative z-10 flex w-full max-w-[640px] flex-col gap-6 google-form-header-card bg-card text-card-foreground p-0 rounded-2xl shadow-xl border border-border mt-6 sm:mt-10 overflow-hidden"
        >
          {/* Top Theme Accent Strip */}
          <div
            style={{ backgroundColor: primaryColor }}
            className={cn('h-2.5 w-full bg-gradient-to-r', themePreset.gradientHeader)}
          />

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
              <div
                style={{ borderColor: `${primaryColor}40` }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border text-foreground shrink-0 shadow-xs"
              >
                {customThankYou ? <PartyPopper className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response Recorded</span>
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
                {customBtnUrl && customBtnUrl.trim() !== '' ? (
                  <a
                    href={
                      customBtnUrl.trim().startsWith('http://') ||
                      customBtnUrl.trim().startsWith('https://') ||
                      customBtnUrl.trim().startsWith('/')
                        ? customBtnUrl.trim()
                        : `https://${customBtnUrl.trim()}`
                    }
                    target={customBtnUrl.trim().startsWith('/') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    style={{ backgroundColor: primaryColor }}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl text-white px-6 py-2.5 text-sm font-semibold shadow-md transition-all hover:opacity-90',
                      themePreset.buttonClass
                    )}
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4 hover:opacity-80 transition-colors"
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
    <div
      className={cn(
        'flex min-h-screen w-full items-start justify-center p-3 sm:p-8 google-form-container relative transition-colors',
        bgStyles.isDarkTheme ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 dark:bg-slate-950'
      )}
    >
      {/* Background Texture with isolated blur layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            ...bgStyles.containerStyle,
            filter: bgStyles.blurPx ? `blur(${bgStyles.blurPx}px)` : undefined,
            transform: bgStyles.blurPx ? 'scale(1.06)' : undefined,
          }}
        />
        {bgStyles.overlayClass && (
          <div className={cn('absolute inset-0', bgStyles.overlayClass)} />
        )}
      </div>

      <div key={renderKey} className="relative z-10 flex w-full max-w-[640px] flex-col gap-4 py-2 sm:py-4">
        {/* Top Banner Card (Above Form Header) - 100% width on all phones */}
        {bannerElement && (
          <div className="w-full overflow-hidden rounded-xl shadow-md border border-border/60">
            {(() => {
              const BannerComponent = FormElements.BannerField.formComponent;
              return <BannerComponent elementInstance={bannerElement} />;
            })()}
          </div>
        )}

        {/* Google Form Header Card (Dedicated Title Tile) */}
        <div className="w-full bg-card text-card-foreground rounded-2xl border border-border shadow-md overflow-hidden google-form-header-card relative">
          {/* Top Theme Accent Bar if no banner */}
          {!bannerElement && (
            <div
              style={{ backgroundColor: primaryColor }}
              className={cn('h-2.5 w-full bg-gradient-to-r', themePreset.gradientHeader)}
            />
          )}

          <div className="p-5 sm:p-7 flex flex-col gap-3.5">
            {/* Top Row: Logo & Official Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-border/60 shadow-xs shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/image.png"
                  alt="TSPL Logo"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
              <span
                style={{ borderColor: `${primaryColor}40` }}
                className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border shadow-2xs"
              >
                TSPL Form
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground break-words w-full leading-tight tracking-tight">
                {formName}
              </h1>
              {formDescription && (
                <p className="text-sm sm:text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {formDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Required Notice (Google Forms style outside title tile) */}
        {questionsContent.some((q) => q.extraAttributes?.required) && (
          <div className="px-1 -mb-1">
            <p className="text-xs font-semibold text-red-500 dark:text-red-400">
              * Indicates required question
            </p>
          </div>
        )}

        {/* Dynamic Progress Bar */}
        {totalQuestions > 0 && (
          <div className="w-full bg-card p-3.5 sm:p-4 rounded-xl border border-border shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-foreground">
                <span
                  style={{ backgroundColor: primaryColor }}
                  className="h-2 w-2 rounded-full"
                />
                Progress
              </span>
              <span className="text-muted-foreground font-medium">
                {answeredCount} of {totalQuestions} answered ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Form Question Cards */}
        {questionsContent.map((element) => {
          // If field is hidden by conditional logic, do not render it
          if (hiddenFieldIds.has(element.id)) {
            return null;
          }

          // TsplCurrentDateTimeField is invisible — it only auto-records the
          // submission timestamp silently via its FormComponent (returns null).
          if (element.type === 'TsplCurrentDateTimeField') {
            const FormElement = FormElements[element.type].formComponent;
            return (
              <FormElement
                key={element.id}
                elementInstance={element}
                submitFunction={submitValues}
              />
            );
          }

          // Apply dynamic option visibility overrides if present
          let effectiveElement = element;
          if (fieldOptionOverrides.has(element.id)) {
            effectiveElement = {
              ...element,
              extraAttributes: {
                ...element.extraAttributes,
                options: fieldOptionOverrides.get(element.id),
              },
            };
          }

          const FormElement = FormElements[effectiveElement.type].formComponent;
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
                'w-full bg-card text-card-foreground p-4 sm:p-6 rounded-xl border border-border shadow-xs transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-1 animate-in fade-in slide-in-from-top-1',
                themePreset.accentBorder,
                isInvalid && 'border-red-500 border-l-[4px] border-l-red-500 focus-within:border-l-red-500',
                element.type === 'BannerField' &&
                  'p-0 border-none shadow-none bg-transparent w-full overflow-hidden rounded-xl'
              )}
            >
              <FormElement
                elementInstance={effectiveElement}
                submitFunction={submitValues}
                isInvalid={isInvalid}
                defaultValues={formValues.current[element.id]}
              />
              {isInvalid && !isLayout && (
                <p className="text-xs text-red-500 font-semibold mt-3 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  This is a required question
                </p>
              )}
            </div>
          );
        })}

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-3 mt-4 px-1">
          <Button
            style={{ backgroundColor: primaryColor }}
            className={cn(
              'text-white font-bold text-sm px-6 sm:px-8 py-2.5 h-11 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center gap-2 hover:opacity-90',
              themePreset.buttonClass
            )}
            onClick={submitForm}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </Button>

          <button
            type="button"
            onClick={() => {
              formValues.current = {};
              formErrors.current = {};
              setAnsweredCount(0);
              setFormValuesState({});
              try {
                localStorage.removeItem('tspl_draft_' + formUrl);
              } catch {}
              setRenderKey(new Date().getTime());
              toast({
                description: 'Form cleared successfully.',
              });
            }}
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors px-2 py-1"
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
