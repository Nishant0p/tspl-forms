'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, idGenerator } from '@/lib/utils';
import { useDesginerStore } from '@/store/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Copy,
  Trash2,
  GripHorizontal,
  Plus,
  X,
  MoreVertical,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  UploadCloud,
  SlidersHorizontal,
  Star,
  Calendar,
  Clock,
  Phone,
  Hash,
  Mail,
  PenTool,
  Image as ImageIcon,
  SplitSquareVertical,
  HardDrive,
  Check,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormElementInstance, FormElements, ElementsType } from './FormElements';
import { deleteElementInstance } from '@/app/actions/form';
import { toast } from '@/components/ui/use-toast';
import FloatingRightCapsuleToolbar from './FloatingRightCapsuleToolbar';

const QUESTION_TYPE_OPTIONS: Array<{
  type: ElementsType;
  label: string;
  icon: React.ReactNode;
}> = [
  { type: 'TextField', label: 'Short answer', icon: <Type className="h-4 w-4" /> },
  { type: 'TextAreaField', label: 'Paragraph', icon: <AlignLeft className="h-4 w-4" /> },
  { type: 'RadioField', label: 'Multiple choice', icon: <CircleDot className="h-4 w-4" /> },
  { type: 'CheckboxField', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'SelectField', label: 'Dropdown', icon: <ChevronDown className="h-4 w-4" /> },
  { type: 'FileUploadField', label: 'File upload', icon: <UploadCloud className="h-4 w-4" /> },
  { type: 'LinearScaleField', label: 'Linear scale', icon: <SlidersHorizontal className="h-4 w-4" /> },
  { type: 'RatingField', label: 'Rating', icon: <Star className="h-4 w-4" /> },
  { type: 'DateField', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
  { type: 'TimeField', label: 'Time', icon: <Clock className="h-4 w-4" /> },
  { type: 'PhoneField', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
  { type: 'NumberField', label: 'Number', icon: <Hash className="h-4 w-4" /> },
  { type: 'EmailField', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { type: 'SignatureField', label: 'Signature', icon: <PenTool className="h-4 w-4" /> },
  { type: 'BannerField', label: 'Image / Banner', icon: <ImageIcon className="h-4 w-4" /> },
  { type: 'TitleField', label: 'Title & Description', icon: <Type className="h-4 w-4" /> },
  { type: 'SectionHeaderField', label: 'Section Header', icon: <SplitSquareVertical className="h-4 w-4" /> },
];

export default function DesginerElementWrapper({
  element,
  formId,
}: {
  element: FormElementInstance;
  formId: number;
}) {
  const DesignerElement = FormElements[element.type]?.designerComponent;
  const PropertiesElement = FormElements[element.type]?.propertiesComponent;

  const {
    removeElement,
    setSelectedElement,
    selectedElement,
    elements,
    addElement,
    updateElement,
  } = useDesginerStore();

  const isSelected = selectedElement?.id === element.id;
  const [showDescription, setShowDescription] = useState(
    Boolean(element.extraAttributes?.helperText)
  );

  const topHalf = useDroppable({
    id: element.id + '-top',
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + '-bottom',
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + '-drag-handle',
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  const handleTypeChange = (newType: ElementsType) => {
    if (newType === element.type) return;

    const baseNew = FormElements[newType]?.construct(element.id);
    if (!baseNew) return;

    const currentLabel =
      element.extraAttributes?.label ||
      element.extraAttributes?.title ||
      'Untitled Question';

    const currentHelper = element.extraAttributes?.helperText || '';
    const currentRequired = Boolean(element.extraAttributes?.required);
    const currentOptions = element.extraAttributes?.options || ['Option 1', 'Option 2'];

    const updated: FormElementInstance = {
      id: element.id,
      type: newType,
      extraAttributes: {
        ...baseNew.extraAttributes,
        label: currentLabel,
        title: currentLabel,
        helperText: currentHelper,
        required: currentRequired,
        ...(baseNew.extraAttributes?.options ? { options: currentOptions } : {}),
      },
    };

    updateElement(element.id, updated);
    setSelectedElement(updated);
    toast({
      title: 'Question Type Changed',
      description: `Switched question to ${newType}`,
    });
  };

  const handleLabelChange = (newLabel: string) => {
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: newLabel,
        title: newLabel,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const handleHelperChange = (newHelper: string) => {
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        helperText: newHelper,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const handleOptionChange = (index: number, val: string) => {
    const options = [...(element.extraAttributes?.options || [])];
    options[index] = val;
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        options,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const handleAddOption = () => {
    const options = [...(element.extraAttributes?.options || [])];
    options.push(`Option ${options.length + 1}`);
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        options,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const handleAddOtherOption = () => {
    const options = [...(element.extraAttributes?.options || [])];
    if (!options.includes('Other...')) {
      options.push('Other...');
      const updated = {
        ...element,
        extraAttributes: {
          ...element.extraAttributes,
          options,
        },
      };
      updateElement(element.id, updated);
      setSelectedElement(updated);
    }
  };

  const handleRemoveOption = (index: number) => {
    const options = [...(element.extraAttributes?.options || [])];
    if (options.length <= 1) return;
    options.splice(index, 1);
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        options,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const handleRatingChange = (key: string, value: any) => {
    const updated = {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        [key]: value,
      },
    };
    updateElement(element.id, updated);
    setSelectedElement(updated);
  };

  const duplicateElement = () => {
    const currentIndex = elements.findIndex((el) => el.id === element.id);
    if (currentIndex === -1) return;

    const duplicatedElement = JSON.parse(JSON.stringify(element)) as FormElementInstance;
    duplicatedElement.id = idGenerator();

    addElement(currentIndex + 1, duplicatedElement);
    setSelectedElement(duplicatedElement);
    toast({
      title: 'Question Duplicated',
      description: 'Duplicated question added below.',
    });
  };

  const deleteElement = async () => {
    removeElement(element.id);
    try {
      await deleteElementInstance(formId, element.id);
    } catch {
      // Autosave handles sync
    }
  };

  const isOptionBased = ['RadioField', 'SelectField', 'CheckboxField'].includes(element.type);
  const currentTitle = element.extraAttributes?.label || element.extraAttributes?.title || '';
  const optionsList = element.extraAttributes?.options || [];
  const hasOtherOption = optionsList.some((opt: string) => opt === 'Other...' || opt === 'Other');

  const maxRating = Number(element.extraAttributes?.maxRating || 5);
  const ratingSymbol = element.extraAttributes?.symbol || 'star';

  return (
    <div
      ref={draggable.setNodeRef}
      className={cn(
        'group relative flex w-full flex-col rounded-xl text-foreground transition-all duration-150 bg-card shadow-sm border border-border/80',
        !isSelected && 'hover:shadow-md cursor-pointer hover:border-border',
        isSelected &&
          'border-l-[6px] border-l-blue-600 dark:border-l-blue-500 shadow-lg ring-1 ring-black/5 dark:ring-white/10'
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) {
          setSelectedElement(element);
        }
      }}
    >
      {/* Floating Right Capsule Toolbar (Google Forms style - attached right beside the active card) */}
      {isSelected && (
        <div className="hidden sm:flex absolute left-[calc(100%+12px)] top-1 z-30 pointer-events-auto">
          <FloatingRightCapsuleToolbar targetElementId={element.id} />
        </div>
      )}
      <div
        ref={topHalf.setNodeRef}
        className="absolute top-0 h-1/2 w-full rounded-t-md z-0 pointer-events-none"
      />
      <div
        ref={bottomHalf.setNodeRef}
        className="absolute bottom-0 h-1/2 w-full rounded-b-md z-0 pointer-events-none"
      />

      {/* Drag Over Indicators */}
      {topHalf.isOver && (
        <div className="absolute top-0 h-[4px] w-full rounded-t-md bg-blue-600 z-30" />
      )}
      {bottomHalf.isOver && (
        <div className="absolute bottom-0 h-[4px] w-full rounded-b-md bg-blue-600 z-30" />
      )}

      {/* Top 6-Dot Drag Handle (Centered) */}
      <div className="flex w-full justify-center pt-1.5 pb-0.5">
        <div
          {...draggable.attributes}
          {...draggable.listeners}
          className="cursor-grab p-1 text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing transition-colors rounded"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripHorizontal className="h-5 w-5" />
        </div>
      </div>

      {isSelected ? (
        /* ACTIVE QUESTION CARD (Exact Google Forms Layout) */
        <div className="w-full px-5 pb-4 pt-1 space-y-4 relative z-10 cursor-default">
          {/* Top Row: Question Title Input + Image Button + Type Switcher Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full space-y-1">
              <Input
                value={currentTitle}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Question"
                className="h-12 text-base font-normal bg-[#f8f9fa] dark:bg-muted/30 border-b-2 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-3 transition-colors placeholder:text-muted-foreground/60 shadow-none"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hidden sm:flex shrink-0 rounded-full"
              title="Insert image"
              onClick={() => handleTypeChange('BannerField')}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <div className="w-full sm:w-[220px] shrink-0">
              <Select
                value={element.type}
                onValueChange={(val) => handleTypeChange(val as ElementsType)}
              >
                <SelectTrigger className="h-12 text-xs font-semibold bg-background border-border/80 shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.type} value={opt.type} className="text-xs">
                      <div className="flex items-center gap-2.5">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description / Helper Text Row (if enabled) */}
          {showDescription && (
            <div className="pt-0">
              <Input
                value={element.extraAttributes?.helperText || ''}
                onChange={(e) => handleHelperChange(e.target.value)}
                placeholder="Description"
                className="h-8 text-xs text-muted-foreground bg-transparent border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-3"
              />
            </div>
          )}

          {/* Card Body / Options Area (Exact Google Forms Layout Per Type) */}
          <div className="py-2">
            {/* 1. Multiple Choice / Checkbox / Dropdown */}
            {isOptionBased && (
              <div className="space-y-3">
                {optionsList.map((opt: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    {element.type === 'RadioField' && (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                    )}
                    {element.type === 'CheckboxField' && (
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground/40 shrink-0" />
                    )}
                    {element.type === 'SelectField' && (
                      <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">
                        {idx + 1}.
                      </span>
                    )}

                    <Input
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="h-9 text-sm flex-1 bg-transparent border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-1 placeholder:text-muted-foreground/60"
                      placeholder={`Option ${idx + 1}`}
                    />

                    {optionsList.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Option / Add 'Other' Button Row */}
                <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
                  {element.type === 'RadioField' && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  {element.type === 'CheckboxField' && (
                    <div className="h-5 w-5 rounded border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  {element.type === 'SelectField' && (
                    <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">
                      {optionsList.length + 1}.
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-muted-foreground hover:text-foreground font-normal hover:underline cursor-pointer"
                    >
                      Add option
                    </button>
                    {!hasOtherOption && element.type !== 'SelectField' && (
                      <>
                        <span className="text-muted-foreground/60">or</span>
                        <button
                          type="button"
                          onClick={handleAddOtherOption}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                        >
                          add &quot;Other&quot;
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Short answer */}
            {element.type === 'TextField' && (
              <div className="py-2">
                <p className="text-sm text-muted-foreground/70 border-b border-dotted border-border pb-1.5 w-3/5">
                  Short answer text
                </p>
              </div>
            )}

            {/* 3. Paragraph */}
            {element.type === 'TextAreaField' && (
              <div className="py-2">
                <p className="text-sm text-muted-foreground/70 border-b border-dotted border-border pb-2 w-4/5">
                  Long answer text
                </p>
              </div>
            )}

            {/* 4. Rating Card */}
            {element.type === 'RatingField' && (
              <div className="space-y-4 py-2">
                {/* Rating Dropdowns */}
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Select
                      value={String(maxRating)}
                      onValueChange={(val) => handleRatingChange('maxRating', Number(val))}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={String(num)} className="text-xs">
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Select
                      value={ratingSymbol}
                      onValueChange={(val) => handleRatingChange('symbol', val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="star" className="text-xs">
                          ⭐ Star
                        </SelectItem>
                        <SelectItem value="heart" className="text-xs">
                          ❤️ Heart
                        </SelectItem>
                        <SelectItem value="thumb" className="text-xs">
                          👍 Thumb
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rating Stars Visual Preview */}
                <div className="flex items-center justify-start gap-8 pt-2 overflow-x-auto pb-1">
                  {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => (
                    <div key={num} className="flex flex-col items-center gap-1.5 shrink-0">
                      <span className="text-xs text-muted-foreground font-medium">{num}</span>
                      <Star className="h-6 w-6 text-muted-foreground/50 hover:text-amber-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. File Upload Card */}
            {element.type === 'FileUploadField' && (
              <div className="space-y-4 py-2 text-xs">
                <div className="flex items-center justify-between gap-4 max-w-sm">
                  <span className="font-medium text-foreground">Allow only specific file types</span>
                  <Switch className="scale-90" />
                </div>

                <div className="flex items-center justify-between gap-4 max-w-sm">
                  <span className="font-medium text-foreground">Maximum number of files</span>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-4 max-w-sm">
                  <span className="font-medium text-foreground">Maximum file size</span>
                  <Select defaultValue="10">
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 MB</SelectItem>
                      <SelectItem value="100">100 MB</SelectItem>
                      <SelectItem value="1000">1 GB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  This form can accept up to 1 GB of files.
                </p>
              </div>
            )}

            {/* 6. Linear Scale */}
            {element.type === 'LinearScaleField' && (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-4 text-xs">
                  <Select defaultValue="1">
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">to</span>
                  <Select defaultValue="5">
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 7. Date Field */}
            {element.type === 'DateField' && (
              <div className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground/70 border-b border-dotted border-border pb-1.5 w-48">
                <Calendar className="h-4 w-4" />
                <span>Month, day, year</span>
              </div>
            )}

            {/* 8. Time Field */}
            {element.type === 'TimeField' && (
              <div className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground/70 border-b border-dotted border-border pb-1.5 w-36">
                <Clock className="h-4 w-4" />
                <span>Time (hh:mm)</span>
              </div>
            )}

            {/* 9. Fallback / Other complex properties */}
            {!isOptionBased &&
              ![
                'TextField',
                'TextAreaField',
                'RatingField',
                'FileUploadField',
                'LinearScaleField',
                'DateField',
                'TimeField',
              ].includes(element.type) && (
                <div className="pt-1">
                  <PropertiesElement elementInstance={element} />
                </div>
              )}
          </div>

          {/* Bottom Card Action Bar (Exact Google Forms Footer) */}
          <div className="flex items-center justify-end border-t pt-3 mt-4 text-xs gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement();
              }}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteElement();
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="h-5 w-[1px] bg-border mx-1.5" />

            <div className="inline-flex items-center gap-2.5">
              <Label
                htmlFor={`req-${element.id}`}
                className="cursor-pointer text-xs font-medium text-foreground select-none leading-none inline-flex items-center m-0 p-0"
              >
                Required
              </Label>
              <Switch
                id={`req-${element.id}`}
                checked={Boolean(element.extraAttributes?.required)}
                className="data-[state=checked]:bg-blue-600 scale-90 my-auto"
                onCheckedChange={(checked) => {
                  const updated = {
                    ...element,
                    extraAttributes: {
                      ...element.extraAttributes,
                      required: checked,
                    },
                  };
                  updateElement(element.id, updated);
                  setSelectedElement(updated);
                }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground ml-1"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-xs"
                >
                  {showDescription ? 'Hide description' : 'Show description'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        /* INACTIVE / PREVIEW CARD */
        <div className="w-full px-5 py-3.5">
          <DesignerElement elementInstance={element} />
        </div>
      )}
    </div>
  );
}
