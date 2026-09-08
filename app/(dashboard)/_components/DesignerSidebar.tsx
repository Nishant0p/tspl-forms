'use client';

import React from 'react';
import FormElementsSidebar from './FormElementsSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DesignerSidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Mobile Backdrop when open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'transition-all duration-300 ease-in-out bg-background border-border flex flex-col shrink-0',
          // Mobile Phone: Bottom sheet drawer when open, hidden when closed
          'fixed inset-x-0 bottom-0 z-50 md:relative md:inset-auto md:z-20',
          open
            ? 'h-[80vh] md:h-full w-full md:w-[380px] lg:w-[420px] max-w-full p-4 border-t-2 md:border-t-0 md:border-l rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none opacity-100 pointer-events-auto'
            : 'hidden md:flex md:w-0 md:max-w-0 md:p-0 md:border-0 overflow-hidden opacity-0 pointer-events-none'
        )}
      >
        {/* Mobile drag pill */}
        <div className="md:hidden w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-2 shrink-0" />

        <div className="flex items-center justify-between pb-3 mb-2 border-b shrink-0">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
            <Layers className="h-4 w-4 text-foreground" />
            <span>Form Elements</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
              Menu ON
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1"
            onClick={onClose}
            title="Turn Elements Menu OFF"
          >
            <X className="h-4 w-4" />
            <span>Close (Turn OFF)</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 w-full pr-1">
          <FormElementsSidebar />
        </ScrollArea>

        {/* Mobile bottom close button */}
        <div className="pt-2 border-t mt-2 md:hidden shrink-0">
          <Button
            variant="outline"
            className="w-full text-xs font-semibold h-9 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Done (Turn Menu OFF)
          </Button>
        </div>
      </aside>
    </>
  );
}
