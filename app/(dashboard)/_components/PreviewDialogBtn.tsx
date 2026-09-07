import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useDesginerStore } from '@/store/store';
import { EyeIcon, PartyPopper, ExternalLink, ArrowLeft } from 'lucide-react';
import React from 'react';
import { FormElements } from './FormElements';
import { cn } from '@/lib/utils';

interface PreviewDialogBtnProps {
  formName?: string;
  formDescription?: string;
  trigger?: React.ReactNode;
}

export default function PreviewDialogBtn({
  formName,
  formDescription,
  trigger,
}: PreviewDialogBtnProps) {
  const { elements } = useDesginerStore();

  const thankYouElement = elements.find((el) => el.type === 'ThankYouField');
  const bannerElement = elements.find((el) => el.type === 'BannerField');
  const questionsContent = elements.filter(
    (el) => el.type !== 'ThankYouField' && el.type !== 'BannerField'
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={'outline'}
            className="gap-2">
            <EyeIcon className="h-5 w-5" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex h-screen max-h-screen w-screen max-w-full grow flex-col gap-0 p-0 border-none">
        {/* Header Bar with Back Button */}
        <div className="border-b px-4 sm:px-6 py-3 bg-background flex items-center justify-between gap-3 pr-16 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0 h-9 px-3">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Back to Editor</span>
                <span className="sm:hidden font-medium">Back</span>
              </Button>
            </DialogClose>
            <div className="min-w-0 flex-1 border-l pl-3 border-border/60">
              <p className="text-sm sm:text-base font-bold text-foreground break-words line-clamp-1 leading-tight" title={formName}>
                {formName ? `Preview: ${formName}` : 'Form Preview'}
              </p>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                This is what your form will look like to your users.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="w-full grow overflow-y-auto bg-slate-100 dark:bg-slate-950 google-form-container p-4 sm:p-8">
          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 pb-12">
            
            {/* Top Banner Card (Above Form Header) */}
            {bannerElement && (
              <div className="w-full overflow-hidden rounded-xl shadow-md border border-border/60">
                {(() => {
                  const BannerComponent = FormElements.BannerField.formComponent;
                  return <BannerComponent elementInstance={bannerElement} />;
                })()}
              </div>
            )}

            {/* Header Card Preview */}
            <div className="w-full bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden google-form-header-card relative">
              {/* Branded 50% Blue, 40% Orange, 10% White Theme Accent Strip */}
              <div className="h-3 w-full flex overflow-hidden">
                <div className="w-1/2 bg-blue-600 dark:bg-blue-500" title="50% Blue" />
                <div className="w-[40%] bg-orange-500 dark:bg-orange-600" title="40% Orange" />
                <div className="w-[10%] bg-white dark:bg-slate-100 border-l border-orange-400/30" title="10% White" />
              </div>

              <div className="p-5 sm:p-7 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-1 min-w-0 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/image.png"
                    alt="TSPL Logo"
                    className="h-9 sm:h-11 w-auto object-contain shrink-0 self-start sm:self-auto"
                  />
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words w-full leading-tight">
                    {formName || 'Form Title Preview'}
                  </h1>
                </div>
                <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">
                  {formDescription || 'This is the form description. You can configure this in your settings panel.'}
                </p>
                <hr className="border-border my-1" />
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">* Required</p>
              </div>
            </div>

            {/* Questions Preview */}
            {questionsContent.map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return (
                <div
                  key={element.id}
                  className={cn(
                    "w-full bg-card text-card-foreground p-5 sm:p-6 rounded-xl border border-border shadow-sm",
                    element.type === 'BannerField' && "p-0 border-none shadow-none bg-transparent w-full overflow-hidden rounded-xl"
                  )}
                >
                  <FormComponent
                    elementInstance={element}
                  />
                </div>
              );
            })}

            {/* Optional Thank You Screen Preview in Dialog */}
            {thankYouElement && (
              <div className="mt-6 border-t border-border/80 pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PartyPopper className="h-4 w-4 text-orange-500" /> Post-Submission Screen Preview
                </p>
                <div className="flex w-full flex-col gap-4 bg-card text-card-foreground p-6 rounded-xl border border-blue-500/30 shadow-sm overflow-hidden relative">
                  {/* Branded 50% Blue, 40% Orange, 10% White Accent Strip */}
                  <div className="h-2 w-full flex overflow-hidden absolute top-0 left-0 right-0">
                    <div className="w-1/2 bg-blue-600" />
                    <div className="w-[40%] bg-orange-500" />
                    <div className="w-[10%] bg-white border-l border-orange-400/30" />
                  </div>

                  {thankYouElement.extraAttributes?.imageUrl && (
                    <div className="w-full overflow-hidden rounded-md border border-border/50 bg-muted/20 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thankYouElement.extraAttributes.imageUrl}
                        alt="Thank You Illustration"
                        className="w-full max-h-56 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 border-b pb-3 mt-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <PartyPopper className="h-5 w-5 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {thankYouElement.extraAttributes?.title || 'Thank You!'}
                    </h2>
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                    {thankYouElement.extraAttributes?.message || 'Your response has been recorded.'}
                  </p>
                  {thankYouElement.extraAttributes?.showRedirectButton && (
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 text-white px-4 py-2 text-xs font-medium">
                        {thankYouElement.extraAttributes?.buttonText || 'Submit another response'}
                        {thankYouElement.extraAttributes?.buttonUrl && <ExternalLink className="h-3 w-3" />}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
