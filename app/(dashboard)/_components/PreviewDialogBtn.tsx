import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useDesginerStore } from '@/store/store';
import { EyeIcon, PartyPopper, ExternalLink } from 'lucide-react';
import React from 'react';
import { FormElements } from './FormElements';
import { cn } from '@/lib/utils';

export default function PreviewDialogBtn() {
  const { elements } = useDesginerStore();

  const thankYouElement = elements.find((el) => el.type === 'ThankYouField');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'outline'}
          className="gap-2">
          <EyeIcon className="h-5 w-5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-screen max-h-screen w-screen max-w-full grow flex-col gap-0 p-0 border-none">
        <div className="border-b px-6 py-4 bg-background">
          <p className="text-xl font-bold">Form Preview</p>
          <p className="text-sm text-muted-foreground">
            This is what your form will look like to your users.
          </p>
        </div>
        <div className="flex grow flex-col items-center overflow-y-auto bg-[#f0ebf8] dark:bg-[#121016] google-form-container p-4 sm:p-8">
          <div className="flex h-full w-full max-w-[640px] grow flex-col gap-4 pb-12">
            
            {/* Header Card Preview */}
            <div className="w-full bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden google-form-header-card p-6 flex flex-col gap-3">
              <h1 className="text-3xl font-normal text-foreground">
                Form Title Preview
              </h1>
              <p className="text-sm text-foreground/85">
                This is the form description. You can configure this in your settings panel.
              </p>
              <hr className="border-border my-1" />
              <p className="text-xs text-red-500">* Required</p>
            </div>

            {/* Questions Preview */}
            {elements.filter((el) => el.type !== 'ThankYouField').map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return (
                <div
                  key={element.id}
                  className={cn(
                    "w-full bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm",
                    element.type === 'BannerField' && "p-0 border-none shadow-none bg-transparent"
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
                  <PartyPopper className="h-4 w-4 text-emerald-500" /> Post-Submission Screen Preview
                </p>
                <div className="flex w-full flex-col gap-4 bg-card text-card-foreground p-6 rounded-lg border border-emerald-500/40 shadow-sm">
                  {thankYouElement.extraAttributes?.imageUrl && (
                    <div className="w-full overflow-hidden rounded-md border border-border/50 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thankYouElement.extraAttributes.imageUrl}
                        alt="Thank You Illustration"
                        className="w-full max-h-56 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 border-b pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <PartyPopper className="h-5 w-5" />
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
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#673ab7] text-white px-4 py-2 text-xs font-medium">
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
