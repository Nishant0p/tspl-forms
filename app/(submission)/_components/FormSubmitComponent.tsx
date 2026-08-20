'use client';

import {
  FormElementInstance,
  FormElements,
} from '@/app/(dashboard)/_components/FormElements';
import { SubmitForm } from '@/app/actions/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Loader, AlertCircle, CheckCircle2, PartyPopper, ExternalLink } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

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

  // Filter out layout elements during validation
  const questionsContent = content.filter((el) => el.type !== 'ThankYouField');

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
  };

  const submitForm = async () => {
    formErrors.current = {};

    const validForm = validateForm();

    if (!validForm) {
      setRenderKey(new Date().getTime());

      toast({
        title: "Form is invalid",
        description: "Please fill all required fields",
        variant: 'destructive'
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      await SubmitForm(formUrl, jsonContent);
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong, please try again later",
        variant: 'destructive'
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
      <div className="flex min-h-screen w-full items-start justify-center p-4 sm:p-8 google-form-container bg-[#f0ebf8] dark:bg-[#121016]">
        <div
          key={renderKey}
          className="flex w-full max-w-[640px] flex-col gap-6 google-form-header-card bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border mt-10 overflow-hidden">
          
          {/* Custom Banner / Image if configured */}
          {customImageUrl && (
            <div className="w-full overflow-hidden rounded-md border border-border/50 bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customImageUrl}
                alt="Thank You Illustration"
                className="w-full max-h-64 object-cover rounded-md"
              />
            </div>
          )}

          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              {customThankYou ? <PartyPopper className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                {customTitle}
              </h1>
            </div>
          </div>

          <p className="text-base text-foreground/85 whitespace-pre-wrap leading-relaxed">
            {customMessage}
          </p>

          {showBtn && (
            <div className="mt-4 pt-2">
              {customBtnUrl ? (
                <a
                  href={customBtnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#673ab7] hover:bg-[#5e35b1] text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <span>{customBtnText}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSubmitted(false);
                    formValues.current = {};
                    formErrors.current = {};
                    setRenderKey(new Date().getTime());
                  }}
                  className="text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 underline"
                >
                  {customBtnText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-start justify-center p-4 sm:p-8 google-form-container bg-[#f0ebf8] dark:bg-[#121016]">
      <div
        key={renderKey}
        className="flex w-full max-w-[640px] flex-col gap-4 py-4">
        
        {/* Google Form Header Card */}
        <div className="w-full bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden google-form-header-card p-6 flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground">
            {formName}
          </h1>
          {formDescription && (
            <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed mt-1">
              {formDescription}
            </p>
          )}
          <hr className="border-border my-1" />
          <p className="text-xs text-red-500">* Required</p>
        </div>

        {/* Form Question Cards */}
        {questionsContent.map((element) => {
          const FormElement = FormElements[element.type].formComponent;
          const isInvalid = formErrors.current[element.id];
          const isLayout = ['TitleField', 'SubTitleField', 'ParagraphField', 'SeperatorField', 'SpacerField', 'SectionHeaderField', 'BannerField'].includes(element.type);

          return (
            <div
              key={element.id}
              className={cn(
                "w-full bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm transition-all duration-200",
                isInvalid && "border-red-500 border-l-[6px] border-l-red-500",
                element.type === 'BannerField' && "p-0 border-none shadow-none bg-transparent"
              )}
            >
              <FormElement
                elementInstance={element}
                submitFunction={submitValues}
                isInvalid={isInvalid}
                defaultValues={formValues.current[element.id]}
              />
              {isInvalid && !isLayout && (
                <p className="text-xs text-red-500 mt-3 flex items-center gap-1.5 font-medium">
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
            className="bg-[#673ab7] hover:bg-[#5e35b1] text-white px-8 py-2 rounded-md font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            onClick={() => {
              startTransition(submitForm);
            }}
            disabled={pending}
          >
            {pending && <Loader className="h-4 w-4 animate-spin" />}
            Submit
          </Button>
          
          <button
            onClick={() => {
              formValues.current = {};
              formErrors.current = {};
              setRenderKey(new Date().getTime());
              toast({
                description: "Form cleared successfully."
              });
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
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
