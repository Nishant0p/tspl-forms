import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useDesginerStore } from '@/store/store';
import { EyeIcon } from 'lucide-react';
import React from 'react';
import { FormElements } from './FormElements';

export default function PreviewDialogBtn() {
  const { elements } = useDesginerStore();

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
          <div className="flex h-full w-full max-w-[640px] grow flex-col gap-4">
            
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
            {elements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return (
                <div
                  key={element.id}
                  className="w-full bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm"
                >
                  <FormComponent
                    elementInstance={element}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
