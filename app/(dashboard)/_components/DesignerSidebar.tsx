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
    <aside
      className={cn(
        'relative flex h-auto md:h-full flex-col shrink-0 border-t-2 md:border-t-0 md:border-l border-border bg-background transition-all duration-300 ease-in-out z-20',
        open
          ? 'w-full md:w-[380px] lg:w-[420px] max-w-full p-3 sm:p-4 opacity-100'
          : 'w-0 max-w-0 p-0 border-0 overflow-hidden opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b">
        <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>Drag & Drop Elements</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
          onClick={onClose}
          title="Close Drag & Drop Menu"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-40px)] w-full pr-1">
        <FormElementsSidebar />
      </ScrollArea>
    </aside>
  );
}
