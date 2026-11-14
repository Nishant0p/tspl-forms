'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CompressFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileType?: 'image' | 'pdf' | 'file';
  actualSizeMB?: string | number;
  fileName?: string;
}

export default function CompressFileModal({
  open,
  onOpenChange,
  actualSizeMB,
  fileName,
}: CompressFileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md p-5 sm:p-6 rounded-2xl mx-auto shadow-2xl border-border">
        <DialogHeader className="text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                File Exceeds 2 MB Limit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Maximum allowed size is strictly 2 MB
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {actualSizeMB && (
            <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
              <span className="font-medium truncate mr-2">
                {fileName ? fileName : 'Selected file'}:
              </span>
              <span className="font-bold shrink-0">
                {actualSizeMB} MB (Too large)
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-[38px] font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
