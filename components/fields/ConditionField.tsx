'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import {
  GitBranch,
  Plus,
  X,
  Filter,
  ArrowRight,
  Sparkles,
  Settings2,
  Check,
  Layers,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

const type: ElementsType = 'ConditionField';

const optionSpecificQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'textarea', 'number', 'select', 'radio', 'date']),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

export type OptionSpecificQuestion = z.infer<typeof optionSpecificQuestionSchema>;

export type ConditionFieldExtraAttributes = {
  label: string;
  helperText: string;
  required: boolean;

  // Source Decision Question
  sourceFieldId: string;
  decisionType: 'buttons' | 'radio' | 'select';
  decisionOptions: string[];

  // Each option has its own target questions shown below
  // Map of optionValue -> array of target element IDs
  optionTargets: Record<string, string[]>;

  // Option-specific new questions editable by developer
  // Map of optionValue -> array of OptionSpecificQuestion
  optionQuestions?: Record<string, OptionSpecificQuestion[]>;

  // Option-level Visibility (dynamically change visible options in a target dropdown/radio)
  targetOptionFieldId?: string;
  thenVisibleOptions?: string[];
  elseVisibleOptions?: string[];

  // Legacy fallback fields kept for backward compatibility
  operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  compareValue?: string;
  thenAction?: 'show' | 'hide' | 'editable';
  thenTargetFields?: string[];
  thenEditableFields?: string[];
  elseAction?: 'hide' | 'show' | 'none';
  elseTargetFields?: string[];
};

const extraAttributes: ConditionFieldExtraAttributes = {
  label: 'Do you need transport facilities?',
  helperText: 'Select an option to see additional relevant questions.',
  required: false,

  sourceFieldId: 'self',
  decisionType: 'buttons',
  decisionOptions: ['Yes', 'No'],

  optionTargets: {
    Yes: [],
    No: [],
  },

  optionQuestions: {
    Yes: [],
    No: [],
  },

  targetOptionFieldId: '',
  thenVisibleOptions: [],
  elseVisibleOptions: [],
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(120),
  helperText: z.string().max(200),
  required: z.boolean().default(false),

  sourceFieldId: z.string().default('self'),
  decisionType: z.enum(['buttons', 'radio', 'select']).default('buttons'),
  decisionOptions: z.array(z.string()).default(['Yes', 'No']),

  optionTargets: z.record(z.array(z.string())).default({}),
  optionQuestions: z.record(z.array(optionSpecificQuestionSchema)).default({}),

  targetOptionFieldId: z.string().default(''),
  thenVisibleOptions: z.array(z.string()).default([]),
  elseVisibleOptions: z.array(z.string()).default([]),
});

export const ConditionFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      ...extraAttributes,
      optionTargets: {
        Yes: [],
        No: [],
      },
      optionQuestions: {
        Yes: [],
        No: [],
      },
      thenVisibleOptions: [],
      elseVisibleOptions: [],
    },
  }),
  designerBtnElement: {
    icon: <GitBranch className="h-8 w-8 text-primary" />,
    label: 'Condition',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const isSelf = (element.extraAttributes?.sourceFieldId || 'self') === 'self';
    if (!isSelf) return true;
    if (element.extraAttributes?.required) {
      return Boolean(currentValue && currentValue.trim().length > 0);
    }
    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: ConditionFieldExtraAttributes;
};

type PropertiesType = z.infer<typeof propertiesSchema>;

function getElementDisplayName(el: FormElementInstance): string {
  if (el.extraAttributes?.label && el.extraAttributes.label.trim()) {
    return el.extraAttributes.label;
  }
  if (el.extraAttributes?.title && el.extraAttributes.title.trim()) {
    return el.extraAttributes.title;
  }
  if (el.type === 'TitleField') return 'Title Field';
  if (el.type === 'TsplRangeDropdownField') return 'Range Dropdown (Years / Numbers)';
  if (el.type === 'TsplCurrentDateTimeField') return 'Submission Date & Time';
  if (el.type === 'TsplGenderField') return 'Gender';
  if (el.type === 'TsplLocationField') return 'Location (Pincode)';
  return el.type;
}

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement, elements } = useDesginerStore();

  // Retrieve other questions in the form for targeting (TitleField, Range Dropdown, DateTime, etc.)
  const otherElements = useMemo(() => {
    return elements.filter(
      (el) => el.id !== element.id && el.type !== 'BannerField' && el.type !== 'ThemeField'
    );
  }, [elements, element.id]);

  // Option-based fields (SelectField, RadioField, CheckboxField) for option visibility control
  const optionBasedElements = useMemo(() => {
    return otherElements.filter((el) =>
      ['SelectField', 'RadioField', 'CheckboxField', 'TsplRangeDropdownField', 'TsplEducationField', 'TsplGenderField'].includes(el.type)
    );
  }, [otherElements]);

  // Build default option targets ensuring each option in decisionOptions has an entry
  const initialOptionTargets: Record<string, string[]> = {
    ...(element.extraAttributes?.optionTargets || {}),
  };
  const initialOptionQuestions: Record<string, OptionSpecificQuestion[]> = {
    ...(element.extraAttributes?.optionQuestions || {}),
  };
  const decisionOptions = element.extraAttributes?.decisionOptions || ['Yes', 'No'];
  decisionOptions.forEach((opt) => {
    if (!initialOptionTargets[opt]) {
      // If legacy target fields exist, seed the first option with them
      if (opt === (element.extraAttributes?.compareValue || 'Yes') && element.extraAttributes?.thenTargetFields) {
        initialOptionTargets[opt] = [
          ...(element.extraAttributes.thenTargetFields || []),
          ...(element.extraAttributes.thenEditableFields || []),
        ];
      } else {
        initialOptionTargets[opt] = [];
      }
    }
    if (!initialOptionQuestions[opt]) {
      initialOptionQuestions[opt] = [];
    }
  });

  const form = useForm<PropertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes?.label || extraAttributes.label,
      helperText: element.extraAttributes?.helperText || '',
      required: element.extraAttributes?.required ?? false,
      sourceFieldId: element.extraAttributes?.sourceFieldId || 'self',
      decisionType: element.extraAttributes?.decisionType || 'buttons',
      decisionOptions,
      optionTargets: initialOptionTargets,
      optionQuestions: initialOptionQuestions,
      targetOptionFieldId: element.extraAttributes?.targetOptionFieldId || '',
      thenVisibleOptions: element.extraAttributes?.thenVisibleOptions || [],
      elseVisibleOptions: element.extraAttributes?.elseVisibleOptions || [],
    },
  });

  const watchSource = form.watch('sourceFieldId');
  const watchDecisionOptions = form.watch('decisionOptions') || [];
  const watchOptionTargets = form.watch('optionTargets') || {};
  const watchOptionQuestions = (form.watch('optionQuestions') || {}) as Record<string, OptionSpecificQuestion[]>;
  const watchTargetOptionId = form.watch('targetOptionFieldId');

  const selectedOptionField = optionBasedElements.find((el) => el.id === watchTargetOptionId);
  const targetFieldOptions: string[] = selectedOptionField?.extraAttributes?.options || [];

  // Options available for branching: either self choices, or options of the watched question
  const activeBranchOptions: string[] = useMemo(() => {
    if (watchSource === 'self') {
      return watchDecisionOptions;
    }
    const watchedEl = otherElements.find((e) => e.id === watchSource);
    if (watchedEl?.extraAttributes?.options && Array.isArray(watchedEl.extraAttributes.options)) {
      return watchedEl.extraAttributes.options;
    }
    return watchDecisionOptions.length > 0 ? watchDecisionOptions : ['Option 1', 'Option 2'];
  }, [watchSource, watchDecisionOptions, otherElements]);

  useEffect(() => {
    const opts = element.extraAttributes?.decisionOptions || ['Yes', 'No'];
    const optTargets: Record<string, string[]> = {
      ...(element.extraAttributes?.optionTargets || {}),
    };
    const optQuestions: Record<string, OptionSpecificQuestion[]> = {
      ...(element.extraAttributes?.optionQuestions || {}),
    };
    opts.forEach((opt) => {
      if (!optTargets[opt]) optTargets[opt] = [];
      if (!optQuestions[opt]) optQuestions[opt] = [];
    });

    form.reset({
      label: element.extraAttributes?.label || extraAttributes.label,
      helperText: element.extraAttributes?.helperText || '',
      required: element.extraAttributes?.required ?? false,
      sourceFieldId: element.extraAttributes?.sourceFieldId || 'self',
      decisionType: element.extraAttributes?.decisionType || 'buttons',
      decisionOptions: opts,
      optionTargets: optTargets,
      optionQuestions: optQuestions,
      targetOptionFieldId: element.extraAttributes?.targetOptionFieldId || '',
      thenVisibleOptions: element.extraAttributes?.thenVisibleOptions || [],
      elseVisibleOptions: element.extraAttributes?.elseVisibleOptions || [],
    });
  }, [element, form]);

  function applyChanges(data: PropertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        ...data,
      },
    });
  }

  // Add a specific new question to an option
  const addQuestionToOption = (optName: string) => {
    const currentMap = { ...(form.getValues('optionQuestions') || {}) };
    const currentList = [...(currentMap[optName] || [])];
    const newId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newQuestion: OptionSpecificQuestion = {
      id: newId,
      label: `Question for "${optName}"`,
      type: 'text',
      placeholder: 'Enter answer...',
      helperText: '',
      required: false,
      options: ['Option 1', 'Option 2'],
    };
    currentMap[optName] = [...currentList, newQuestion];
    form.setValue('optionQuestions', currentMap);
    applyChanges(form.getValues());
  };

  // Update a specific question in an option
  const updateQuestionInOption = (
    optName: string,
    qIdx: number,
    updates: Partial<OptionSpecificQuestion>
  ) => {
    const currentMap = { ...(form.getValues('optionQuestions') || {}) };
    const currentList = [...(currentMap[optName] || [])];
    if (!currentList[qIdx]) return;
    currentList[qIdx] = { ...currentList[qIdx], ...updates };
    currentMap[optName] = currentList;
    form.setValue('optionQuestions', currentMap);
    applyChanges(form.getValues());
  };

  // Remove a specific question from an option
  const removeQuestionFromOption = (optName: string, qIdx: number) => {
    const currentMap = { ...(form.getValues('optionQuestions') || {}) };
    const currentList = [...(currentMap[optName] || [])];
    currentList.splice(qIdx, 1);
    currentMap[optName] = currentList;
    form.setValue('optionQuestions', currentMap);
    applyChanges(form.getValues());
  };

  // Toggle a field for a specific option
  const toggleOptionField = (optName: string, fieldId: string) => {
    const currentTargets = { ...(form.getValues('optionTargets') || {}) };
    const currentList = currentTargets[optName] || [];
    let nextList: string[];
    if (currentList.includes(fieldId)) {
      nextList = currentList.filter((id) => id !== fieldId);
    } else {
      nextList = [...currentList, fieldId];
    }
    currentTargets[optName] = nextList;
    form.setValue('optionTargets', currentTargets);
    applyChanges(form.getValues());
  };

  // Select all fields for an option
  const selectAllForOption = (optName: string) => {
    const currentTargets = { ...(form.getValues('optionTargets') || {}) };
    currentTargets[optName] = otherElements.map((el) => el.id);
    form.setValue('optionTargets', currentTargets);
    applyChanges(form.getValues());
  };

  // Clear all fields for an option
  const clearAllForOption = (optName: string) => {
    const currentTargets = { ...(form.getValues('optionTargets') || {}) };
    currentTargets[optName] = [];
    form.setValue('optionTargets', currentTargets);
    applyChanges(form.getValues());
  };

  const toggleOption = (optionArrayName: 'thenVisibleOptions' | 'elseVisibleOptions', opt: string) => {
    const current = form.getValues(optionArrayName) || [];
    let next: string[];
    if (current.includes(opt)) {
      next = current.filter((o) => o !== opt);
    } else {
      next = [...current, opt];
    }
    form.setValue(optionArrayName, next);
    applyChanges(form.getValues());
  };

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(applyChanges)();
        }}
        className="space-y-5"
      >
        {/* Section 1: Decision Trigger */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              1. Decision Trigger
            </h4>
          </div>

          <FormField
            control={form.control}
            name="sourceFieldId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Who asks the decision?</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    applyChanges({ ...form.getValues(), sourceFieldId: val });
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="self">
                      ⭐ This Condition Element (Ask user directly)
                    </SelectItem>
                    {otherElements.map((el) => (
                      <SelectItem key={el.id} value={el.id}>
                        Watch: {getElementDisplayName(el)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-[11px]">
                  {field.value === 'self'
                    ? 'Renders an interactive decision question directly on the form.'
                    : 'Watches another question in the form in the background.'}
                </FormDescription>
              </FormItem>
            )}
          />

          {watchSource === 'self' && (
            <div className="space-y-3 pt-2 border-t border-primary/15">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Question Label</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-9 text-xs bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decisionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Decision Display Style</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val: any) => {
                        field.onChange(val);
                        applyChanges({ ...form.getValues(), decisionType: val });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buttons">Pill Buttons (Segmented)</SelectItem>
                        <SelectItem value="radio">Radio Group</SelectItem>
                        <SelectItem value="select">Dropdown Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Decision Choices</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 px-2"
                    onClick={() => {
                      const newOptName = `Option ${watchDecisionOptions.length + 1}`;
                      const next = [...watchDecisionOptions, newOptName];
                      const targets = { ...form.getValues('optionTargets'), [newOptName]: [] };
                      form.setValue('decisionOptions', next);
                      form.setValue('optionTargets', targets);
                      applyChanges(form.getValues());
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Choice
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {watchDecisionOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = [...watchDecisionOptions];
                          const oldVal = next[idx];
                          next[idx] = val;

                          // update key in optionTargets
                          const targets = { ...form.getValues('optionTargets') };
                          if (oldVal !== val) {
                            targets[val] = targets[oldVal] || [];
                            delete targets[oldVal];
                          }

                          form.setValue('decisionOptions', next);
                          form.setValue('optionTargets', targets);
                        }}
                        onBlur={() => applyChanges(form.getValues())}
                        className="h-8 text-xs bg-background flex-1"
                      />
                      {watchDecisionOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => {
                            const removed = watchDecisionOptions[idx];
                            const next = watchDecisionOptions.filter((_, i) => i !== idx);
                            const targets = { ...form.getValues('optionTargets') };
                            delete targets[removed];

                            form.setValue('decisionOptions', next);
                            form.setValue('optionTargets', targets);
                            applyChanges(form.getValues());
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Each Option Has Different Questions Below */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase">
                BRANCHING
              </span>
              <h4 className="text-xs font-bold text-foreground">Option Answers (Questions Shown Below)</h4>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            For each choice, select which questions should appear below when the user selects that option.
          </p>

          {activeBranchOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              Add at least one choice above to configure questions.
            </p>
          ) : (
            <div className="space-y-3 pt-1">
              {activeBranchOptions.map((optName) => {
                const currentFields = watchOptionTargets[optName] || [];
                const specificQuestions = watchOptionQuestions[optName] || [];
                const isConfigured = currentFields.length > 0 || specificQuestions.length > 0;

                return (
                  <div
                    key={optName}
                    className={cn(
                      'rounded-xl border p-3.5 bg-background/90 transition-all space-y-3 shadow-2xs',
                      isConfigured
                        ? 'border-emerald-500/50 dark:border-emerald-500/40'
                        : 'border-border/80'
                    )}
                  >
                    {/* Option Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 max-w-[170px] truncate',
                            isConfigured
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-muted text-foreground'
                          )}
                        >
                          Option: &quot;{optName}&quot;
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {specificQuestions.length > 0
                            ? `${specificQuestions.length} custom Qs`
                            : ''}
                          {specificQuestions.length > 0 && currentFields.length > 0 ? ', ' : ''}
                          {currentFields.length > 0 ? `${currentFields.length} linked` : ''}
                          {!isConfigured ? 'No answers configured' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => selectAllForOption(optName)}
                        >
                          Select All
                        </Button>
                        <span className="text-muted-foreground/40 text-[10px]">|</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-destructive"
                          onClick={() => clearAllForOption(optName)}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Developer Option-Specific Questions */}
                    <div className="rounded-xl border border-primary/25 bg-primary/[0.03] p-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-bold text-foreground">
                            Option-Specific Questions
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 gap-1 text-primary border-primary/30 hover:bg-primary/10 font-semibold"
                          onClick={() => addQuestionToOption(optName)}
                        >
                          <Plus className="h-3 w-3" />
                          <span>New Question</span>
                        </Button>
                      </div>

                      <p className="text-[10px] text-muted-foreground">
                        Questions created here will only appear when the user selects <strong className="text-foreground">&quot;{optName}&quot;</strong>.
                      </p>

                      {specificQuestions.length === 0 ? (
                        <div className="p-2.5 rounded-lg border border-dashed border-border/80 bg-background/60 text-[11px] text-muted-foreground flex items-center justify-between">
                          <span>No option-specific questions added yet.</span>
                          <button
                            type="button"
                            onClick={() => addQuestionToOption(optName)}
                            className="text-primary font-semibold hover:underline cursor-pointer ml-2"
                          >
                            + Add Question
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {specificQuestions.map((q, qIdx) => (
                            <div
                              key={q.id || qIdx}
                              className="p-3 rounded-xl border border-border/80 bg-background shadow-2xs space-y-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                  <span>Specific Question #{qIdx + 1}</span>
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                  onClick={() => removeQuestionFromOption(optName, qIdx)}
                                  title="Delete question"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {/* Question Label */}
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Question Label / Title</Label>
                                <Input
                                  value={q.label}
                                  onChange={(e) =>
                                    updateQuestionInOption(optName, qIdx, { label: e.target.value })
                                  }
                                  onBlur={() => applyChanges(form.getValues())}
                                  placeholder="e.g. Please specify reason..."
                                  className="h-8 text-xs bg-background"
                                />
                              </div>

                              {/* Question Type & Required Grid */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[11px] font-semibold">Question Type</Label>
                                  <Select
                                    value={q.type}
                                    onValueChange={(val: any) =>
                                      updateQuestionInOption(optName, qIdx, { type: val })
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Short Text</SelectItem>
                                      <SelectItem value="textarea">Paragraph / Notes</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="select">Dropdown Menu</SelectItem>
                                      <SelectItem value="radio">Radio Choices</SelectItem>
                                      <SelectItem value="date">Date Picker</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-[11px] font-semibold">Mandatory?</Label>
                                  <div className="flex items-center h-8 gap-2">
                                    <Switch
                                      checked={q.required}
                                      onCheckedChange={(checked) =>
                                        updateQuestionInOption(optName, qIdx, { required: checked })
                                      }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {q.required ? 'Required' : 'Optional'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Placeholder */}
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold">Placeholder</Label>
                                <Input
                                  value={q.placeholder || ''}
                                  onChange={(e) =>
                                    updateQuestionInOption(optName, qIdx, { placeholder: e.target.value })
                                  }
                                  onBlur={() => applyChanges(form.getValues())}
                                  placeholder="e.g. Enter details..."
                                  className="h-8 text-xs bg-background"
                                />
                              </div>

                              {/* Choices if Select or Radio */}
                              {(q.type === 'select' || q.type === 'radio') && (
                                <div className="space-y-1.5 pt-1 border-t border-border/40">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-semibold">Choices</Label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curOpts = q.options || [];
                                        updateQuestionInOption(optName, qIdx, {
                                          options: [...curOpts, `Choice ${curOpts.length + 1}`],
                                        });
                                      }}
                                      className="text-[10px] text-primary font-semibold hover:underline"
                                    >
                                      + Add Choice
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    {(q.options || ['Choice 1', 'Choice 2']).map((choice, cIdx) => (
                                      <div key={cIdx} className="flex items-center gap-1.5">
                                        <Input
                                          value={choice}
                                          onChange={(e) => {
                                            const nextChoices = [...(q.options || [])];
                                            nextChoices[cIdx] = e.target.value;
                                            updateQuestionInOption(optName, qIdx, { options: nextChoices });
                                          }}
                                          onBlur={() => applyChanges(form.getValues())}
                                          className="h-7 text-xs bg-background flex-1"
                                        />
                                        {(q.options || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextChoices = (q.options || []).filter((_, i) => i !== cIdx);
                                              updateQuestionInOption(optName, qIdx, { options: nextChoices });
                                            }}
                                            className="text-muted-foreground hover:text-destructive text-xs p-1"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium pt-1">
                      Also link other form questions to show when user selects <strong className="text-foreground">&quot;{optName}&quot;</strong>:
                    </p>

                    {/* Question Selection List */}
                    {otherElements.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic py-1">
                        Add questions (Title Field, Range Dropdown, Date & Time, etc.) to your form to show them here.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 rounded-lg border border-border/60 p-1.5 bg-muted/20 divide-y divide-border/30">
                        {otherElements.map((el) => {
                          const isChecked = currentFields.includes(el.id);
                          const displayName = getElementDisplayName(el);

                          return (
                            <label
                              key={el.id}
                              onClick={() => toggleOptionField(optName, el.id)}
                              className={cn(
                                'flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs select-none',
                                isChecked
                                  ? 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium'
                                  : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => toggleOptionField(optName, el.id)}
                                  className={cn(
                                    'h-4 w-4 rounded',
                                    isChecked && 'border-emerald-600 bg-emerald-600 text-white'
                                  )}
                                />
                                <span className="truncate" title={displayName}>
                                  {displayName}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {el.type === 'TsplCurrentDateTimeField' && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0 h-4 border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                                  >
                                    Time (Editable)
                                  </Badge>
                                )}
                                {el.type === 'TitleField' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    Title Field
                                  </Badge>
                                )}
                                {el.type === 'TsplRangeDropdownField' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    Range Dropdown
                                  </Badge>
                                )}
                                {el.type === 'TsplGenderField' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    Gender
                                  </Badge>
                                )}
                                {el.type === 'TsplLocationField' && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    Location
                                  </Badge>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Optional Dropdown Option Filter */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-foreground">
              Filter Options in Target Dropdown / Radio (Optional)
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Optionally filter which choices appear inside another dropdown or radio list based on this decision.
          </p>

          <FormField
            control={form.control}
            name="targetOptionFieldId"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value || 'none'}
                  onValueChange={(val) => {
                    const actualVal = val === 'none' ? '' : val;
                    field.onChange(actualVal);
                    applyChanges({ ...form.getValues(), targetOptionFieldId: actualVal });
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="None (Control questions only)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-- None (Show / hide questions only) --</SelectItem>
                    {optionBasedElements.map((el) => (
                      <SelectItem key={el.id} value={el.id}>
                        {getElementDisplayName(el)} ({el.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {watchTargetOptionId && targetFieldOptions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-indigo-500/20">
              <div>
                <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Visible options when condition is active:
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {targetFieldOptions.map((opt) => {
                    const active = (form.watch('thenVisibleOptions') || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleOption('thenVisibleOptions', opt)}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-full border transition-all',
                          active
                            ? 'bg-emerald-500 text-white border-emerald-600 font-semibold'
                            : 'bg-background text-muted-foreground border-border hover:bg-muted'
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  Visible options otherwise:
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {targetFieldOptions.map((opt) => {
                    const active = (form.watch('elseVisibleOptions') || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleOption('elseVisibleOptions', opt)}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-full border transition-all',
                          active
                            ? 'bg-orange-500 text-white border-orange-600 font-semibold'
                            : 'bg-background text-muted-foreground border-border hover:bg-muted'
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <Button type="button" onClick={form.handleSubmit(applyChanges)} className="w-full text-xs font-semibold">
          Save Condition Settings
        </Button>
      </form>
    </Form>
  );
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { elements } = useDesginerStore();
  const extra = element.extraAttributes || extraAttributes;

  const isSelf = (extra.sourceFieldId || 'self') === 'self';
  const options = extra.decisionOptions || ['Yes', 'No'];
  const optionTargets = extra.optionTargets || {};

  return (
    <div className="flex w-full flex-col gap-2.5 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <Label className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>{isSelf ? extra.label : `Condition (Watches: ${extra.sourceFieldId})`}</span>
              {extra.required && isSelf && <span className="text-red-500">*</span>}
            </Label>
            {extra.helperText && <p className="text-[11px] text-muted-foreground">{extra.helperText}</p>}
          </div>
        </div>

        <Badge
          variant="outline"
          className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        >
          Option Branching
        </Badge>
      </div>

      {isSelf && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          {options.map((opt, i) => (
            <div
              key={i}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border shadow-2xs transition-all flex items-center gap-1.5 bg-muted/40 border-border/80 text-foreground"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Visual Branching Summary */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5 text-xs space-y-2 font-sans">
        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
          <Layers className="h-3.5 w-3.5" />
          <span>Option Answers (Branching Logic):</span>
        </div>

        <div className="space-y-1.5 pl-1">
          {options.map((opt) => {
            const targets = (optionTargets[opt] || [])
              .map((id) => {
                const el = elements.find((e) => e.id === id);
                return el ? getElementDisplayName(el) : null;
              })
              .filter(Boolean);
            const specificQuestions = extra.optionQuestions?.[opt] || [];
            const hasAny = targets.length > 0 || specificQuestions.length > 0;

            return (
              <div key={opt} className="flex items-start gap-2 text-[11px]">
                <Badge
                  variant="secondary"
                  className="font-bold text-[10px] shrink-0 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30"
                >
                  {opt}
                </Badge>
                <ArrowRight className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                {hasAny ? (
                  <div className="flex flex-wrap gap-1.5">
                    {specificQuestions.map((sq, i) => (
                      <span
                        key={`sq-${i}`}
                        className="bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"
                        title={`Option Specific Question: ${sq.label}`}
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span>{sq.label || 'Question'} ({sq.type}){sq.required ? '*' : ''}</span>
                      </span>
                    ))}
                    {targets.map((name, i) => (
                      <span
                        key={`target-${i}`}
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-[10px]">
                    No extra questions configured
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {extra.targetOptionFieldId && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 pt-1 border-t border-border/40">
            <Filter className="h-3 w-3" />
            <span>Filters options in target dropdown/radio</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitFunction,
  isInvalid,
  defaultValues,
}: {
  elementInstance: FormElementInstance;
  submitFunction?: SubmitFunction;
  isInvalid?: boolean;
  defaultValues?: string;
}) {
  const element = elementInstance as CustomInstance;
  const extra = element.extraAttributes || extraAttributes;
  const isSelf = (extra.sourceFieldId || 'self') === 'self';

  const [selectedValue, setSelectedValue] = useState<string>(defaultValues || '');
  const [subAnswers, setSubAnswers] = useState<Record<string, string>>({});

  if (!isSelf) {
    return null;
  }

  const handleSelect = (val: string) => {
    const previousVal = selectedValue;
    setSelectedValue(val);
    if (submitFunction) {
      submitFunction(element.id, val);

      // Clear previous option's sub-answers if changed
      if (previousVal && previousVal !== val && extra.optionQuestions?.[previousVal]) {
        extra.optionQuestions[previousVal].forEach((oldQ) => {
          submitFunction(`${element.id}_${oldQ.id}`, '');
        });
      }
    }
  };

  const handleSubAnswerChange = (qId: string, value: string) => {
    setSubAnswers((prev) => ({ ...prev, [qId]: value }));
    if (submitFunction) {
      submitFunction(`${element.id}_${qId}`, value);
    }
  };

  const options = extra.decisionOptions || ['Yes', 'No'];
  const displayType = extra.decisionType || 'buttons';
  const activeQuestions = (extra.optionQuestions && extra.optionQuestions[selectedValue]) || [];

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            isInvalid && 'text-red-500'
          )}
        >
          <GitBranch className="h-4 w-4 text-primary shrink-0" />
          <span>{extra.label}</span>
          {extra.required && <span className="text-red-500">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Decision
        </span>
      </div>

      {extra.helperText && <p className="text-xs text-muted-foreground">{extra.helperText}</p>}

      {displayType === 'buttons' && (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {options.map((opt) => {
            const isChosen = selectedValue === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 flex items-center gap-2 shadow-xs cursor-pointer',
                  isChosen
                    ? 'border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]'
                    : 'border-border/80 bg-card hover:bg-muted text-foreground hover:border-foreground/30'
                )}
              >
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 transition-colors flex items-center justify-center',
                    isChosen ? 'border-white bg-white' : 'border-muted-foreground/40'
                  )}
                >
                  {isChosen && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {displayType === 'radio' && (
        <RadioGroup value={selectedValue} onValueChange={handleSelect} className="space-y-2 pt-1">
          {options.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={opt} id={`${element.id}-${opt}`} />
              <Label htmlFor={`${element.id}-${opt}`} className="text-sm font-medium cursor-pointer">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {displayType === 'select' && (
        <div className="pt-1">
          <Select value={selectedValue} onValueChange={handleSelect}>
            <SelectTrigger className="w-full sm:w-[280px] h-11 text-sm bg-background">
              <SelectValue placeholder="Select decision..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Render Option-Specific Questions if configured for selected option */}
      {selectedValue && activeQuestions.length > 0 && (
        <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-3.5 animate-in fade-in-50 duration-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Additional questions for &quot;{selectedValue}&quot;:</span>
          </div>

          <div className="space-y-3">
            {activeQuestions.map((q) => {
              const val = subAnswers[q.id] || '';

              return (
                <div key={q.id} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>{q.label || 'Question'}</span>
                    {q.required && <span className="text-red-500 font-bold">*</span>}
                  </Label>

                  {q.type === 'text' && (
                    <Input
                      value={val}
                      onChange={(e) => handleSubAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Enter answer...'}
                      className="h-10 text-sm bg-background border-border rounded-xl"
                    />
                  )}

                  {q.type === 'textarea' && (
                    <Textarea
                      value={val}
                      onChange={(e) => handleSubAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Enter details...'}
                      rows={3}
                      className="text-sm bg-background border-border rounded-xl resize-y"
                    />
                  )}

                  {q.type === 'number' && (
                    <Input
                      type="number"
                      value={val}
                      onChange={(e) => handleSubAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || '0'}
                      className="h-10 text-sm bg-background border-border rounded-xl"
                    />
                  )}

                  {q.type === 'date' && (
                    <Input
                      type="date"
                      value={val}
                      onChange={(e) => handleSubAnswerChange(q.id, e.target.value)}
                      className="h-10 text-sm bg-background border-border rounded-xl"
                    />
                  )}

                  {q.type === 'select' && (
                    <Select value={val} onValueChange={(v) => handleSubAnswerChange(q.id, v)}>
                      <SelectTrigger className="h-10 text-sm bg-background border-border rounded-xl">
                        <SelectValue placeholder={q.placeholder || 'Select an option...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(q.options || []).map((choice) => (
                          <SelectItem key={choice} value={choice}>
                            {choice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {q.type === 'radio' && (
                    <RadioGroup
                      value={val}
                      onValueChange={(v) => handleSubAnswerChange(q.id, v)}
                      className="space-y-1.5 pt-1"
                    >
                      {(q.options || []).map((choice) => (
                        <div key={choice} className="flex items-center space-x-2">
                          <RadioGroupItem value={choice} id={`${element.id}-${q.id}-${choice}`} />
                          <Label
                            htmlFor={`${element.id}-${q.id}-${choice}`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            {choice}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.helperText && (
                    <p className="text-[11px] text-muted-foreground">{q.helperText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
