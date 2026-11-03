'use client';

import React, { useState, useTransition } from 'react';
import { DuplicateForm } from '@/app/actions/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Copy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CopyFormBtn({
  formId,
  formName,
  trigger,
  iconOnly,
}: {
  formId: number;
  formName?: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(formName ? `Copy of ${formName}` : 'Copy of Form');
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  const handleOpen = (newOpen: boolean) => {
    if (newOpen && formName) {
      setName(`Copy of ${formName}`);
    }
    setOpen(newOpen);
  };

  const handleCopy = () => {
    startTransition(async () => {
      try {
        const result = await DuplicateForm(formId, name);
        toast({
          title: 'Form Copied',
          description: `Successfully created "${result.name}".`,
        });
        setOpen(false);
        router.push(`/builder/${result.id}`);
        router.refresh();
      } catch (err: any) {
        toast({
          title: 'Copy Failed',
          description: err?.message || 'Could not copy form.',
          variant: 'destructive',
        });
      }
    });
  };

  const defaultTrigger = iconOnly ? (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900/50 dark:hover:bg-amber-950/50"
      title="Make a Copy"
    >
      <Copy className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="outline"
      className="w-full min-h-[36px] gap-1.5 text-xs font-semibold border-amber-500/30 text-amber-700 hover:border-amber-500 hover:bg-amber-500/10 dark:text-amber-400"
    >
      <Copy className="h-3.5 w-3.5" />
      <span>Copy</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-6 rounded-xl mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <Copy className="h-5 w-5 text-amber-600" />
            Make a Copy
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            This will create a new draft form containing all elements and questions. Previous submissions and visits will not be copied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="copy-name" className="text-xs sm:text-sm font-medium">
            Form Name
          </Label>
          <Input
            id="copy-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Copy of ${formName || 'Form'}`}
            disabled={loading}
            className="text-sm"
          />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto min-h-[38px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={loading || !name.trim()}
            className="w-full sm:w-auto min-h-[38px] bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Make Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

