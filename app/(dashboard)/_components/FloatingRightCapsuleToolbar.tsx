'use client';

import React, { useState } from 'react';
import { useDesginerStore } from '@/store/store';
import { FormElements, ElementsType, FormElementInstance } from './FormElements';
import { idGenerator, cn } from '@/lib/utils';
import {
  Plus,
  Type,
  Image as ImageIcon,
  Video,
  SplitSquareVertical,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export default function FloatingRightCapsuleToolbar({
  targetElementId,
  className,
}: {
  targetElementId?: string;
  className?: string;
}) {
  const { elements, addElement, selectedElement, setSelectedElement } = useDesginerStore();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getInsertIndex = () => {
    const activeId = targetElementId || selectedElement?.id;
    if (!activeId) return elements.length;
    const idx = elements.findIndex((el) => el.id === activeId);
    return idx === -1 ? elements.length : idx + 1;
  };

  const handleInsert = (type: ElementsType) => {
    const newElement = FormElements[type].construct(idGenerator());
    const index = getInsertIndex();
    addElement(index, newElement);
    setSelectedElement(newElement);
    setPopoverOpen(false);
  };

  return (
    <div
      className={cn(
        'z-30 flex flex-col items-center gap-0.5 rounded-full border border-border/80 bg-background/95 dark:bg-card/95 p-1 shadow-lg backdrop-blur-md transition-all select-none',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipProvider delayDuration={150}>
        {/* 1. Add Question (+) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
              onClick={() => handleInsert('TextField')}
            >
              <Plus className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold text-xs">Add Question</p>
          </TooltipContent>
        </Tooltip>

        {/* 2. Add Title & Description (Tt) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
              onClick={() => handleInsert('TitleField')}
            >
              <Type className="h-4 w-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold text-xs">Add Title & Description</p>
          </TooltipContent>
        </Tooltip>

        {/* 3. Add Image / Banner */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
              onClick={() => handleInsert('BannerField')}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold text-xs">Add Image / Top Banner</p>
          </TooltipContent>
        </Tooltip>

        {/* 4. Add Video */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
              onClick={() => handleInsert('VideoField')}
            >
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold text-xs">Add Video Embed</p>
          </TooltipContent>
        </Tooltip>

        {/* 5. Add Section Header (==) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
              onClick={() => handleInsert('SectionHeaderField')}
            >
              <SplitSquareVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold text-xs">Add Section</p>
          </TooltipContent>
        </Tooltip>

        {/* 6. All Elements Palette Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-foreground hover:bg-muted hover:text-primary transition-all"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-semibold text-xs">All Question Types</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent side="right" align="center" className="w-80 p-3 max-h-96 overflow-y-auto z-50">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Choose Question Type</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { type: 'TextField', label: 'Short Answer' },
                    { type: 'TextAreaField', label: 'Paragraph' },
                    { type: 'RadioField', label: 'Multiple Choice' },
                    { type: 'CheckboxField', label: 'Checkboxes' },
                    { type: 'SelectField', label: 'Dropdown' },
                    { type: 'FileUploadField', label: 'File Upload' },
                    { type: 'LinearScaleField', label: 'Linear Scale' },
                    { type: 'RatingField', label: 'Rating' },
                    { type: 'DateField', label: 'Date' },
                    { type: 'TimeField', label: 'Time' },
                    { type: 'PhoneField', label: 'Phone Number' },
                    { type: 'NumberField', label: 'Number' },
                    { type: 'EmailField', label: 'Email' },
                    { type: 'SignatureField', label: 'Signature' },
                    { type: 'BannerField', label: 'Banner' },
                    { type: 'TitleField', label: 'Title & Text' },
                  ] as Array<{ type: ElementsType; label: string }>
                ).map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    className="h-8 justify-start text-xs font-medium truncate"
                    onClick={() => handleInsert(item.type)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
}
