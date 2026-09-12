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
  CheckCircle2,
  Plus,
  X,
  Sliders,
  Eye,
  EyeOff,
  Filter,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Settings2,
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
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const type: ElementsType = 'ConditionField';

export type ConditionFieldExtraAttributes = {
  label: string;
  helperText: string;
  required: boolean;

  // Source Decision Question: 'self' means this element itself asks the question on the form,
  // or the ID of another question in the form to watch
  sourceFieldId: string;
  decisionType: 'buttons' | 'radio' | 'select';
  decisionOptions: string[];

  // IF Decision Rule
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  compareValue: string;

  // THEN Action (when condition is TRUE)
  thenAction: 'show' | 'hide';
  thenTargetFields: string[];

  // Option-level Visibility (dynamically change visible options in a target dropdown/radio)
  targetOptionFieldId: string;
  thenVisibleOptions: string[];
  elseVisibleOptions: string[];

  // ELSE Action (when condition is FALSE)
  elseAction: 'hide' | 'show' | 'none';
  elseTargetFields: string[];
};

const extraAttributes: ConditionFieldExtraAttributes = {
  label: 'Do you need transport facilities?',
  helperText: 'Select an option to see additional relevant questions.',
  required: false,

  sourceFieldId: 'self',
  decisionType: 'buttons',
  decisionOptions: ['Yes', 'No'],

  operator: 'equals',
  compareValue: 'Yes',

  thenAction: 'show',
  thenTargetFields: [],

  targetOptionFieldId: '',
  thenVisibleOptions: [],
  elseVisibleOptions: [],

  elseAction: 'hide',
  elseTargetFields: [],
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(120),
  helperText: z.string().max(200),
  required: z.boolean().default(false),

  sourceFieldId: z.string().default('self'),
  decisionType: z.enum(['buttons', 'radio', 'select']).default('buttons'),
  decisionOptions: z.array(z.string()).default(['Yes', 'No']),

  operator: z
    .enum(['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'])
    .default('equals'),
  compareValue: z.string().default('Yes'),

  thenAction: z.enum(['show', 'hide']).default('show'),
  thenTargetFields: z.array(z.string()).default([]),

  targetOptionFieldId: z.string().default(''),
  thenVisibleOptions: z.array(z.string()).default([]),
  elseVisibleOptions: z.array(z.string()).default([]),

  elseAction: z.enum(['hide', 'show', 'none']).default('hide'),
  elseTargetFields: z.array(z.string()).default([]),
});

export const ConditionFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      ...extraAttributes,
      thenTargetFields: [],
      elseTargetFields: [],
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
    if (!isSelf) return true; // Background logic rule does not require validation
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

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement, elements } = useDesginerStore();

  // Retrieve other questions in the form for targeting
  const otherElements = useMemo(() => {
    return elements.filter((el) => el.id !== element.id && el.type !== 'BannerField' && el.type !== 'ThemeField');
  }, [elements, element.id]);

  // Option-based fields (SelectField, RadioField, CheckboxField) for option visibility control
  const optionBasedElements = useMemo(() => {
    return otherElements.filter((el) => ['SelectField', 'RadioField', 'CheckboxField'].includes(el.type));
  }, [otherElements]);

  const form = useForm<PropertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes?.label || extraAttributes.label,
      helperText: element.extraAttributes?.helperText || '',
      required: element.extraAttributes?.required ?? false,
      sourceFieldId: element.extraAttributes?.sourceFieldId || 'self',
      decisionType: element.extraAttributes?.decisionType || 'buttons',
      decisionOptions: element.extraAttributes?.decisionOptions || ['Yes', 'No'],
      operator: element.extraAttributes?.operator || 'equals',
      compareValue: element.extraAttributes?.compareValue || 'Yes',
      thenAction: element.extraAttributes?.thenAction || 'show',
      thenTargetFields: element.extraAttributes?.thenTargetFields || [],
      targetOptionFieldId: element.extraAttributes?.targetOptionFieldId || '',
      thenVisibleOptions: element.extraAttributes?.thenVisibleOptions || [],
      elseVisibleOptions: element.extraAttributes?.elseVisibleOptions || [],
      elseAction: element.extraAttributes?.elseAction || 'hide',
      elseTargetFields: element.extraAttributes?.elseTargetFields || [],
    },
  });

  const watchSource = form.watch('sourceFieldId');
  const watchTargetOptionId = form.watch('targetOptionFieldId');
  const watchThenTargets = form.watch('thenTargetFields') || [];
  const watchElseTargets = form.watch('elseTargetFields') || [];
  const watchDecisionOptions = form.watch('decisionOptions') || [];

  // Options of the chosen option-based target field
  const selectedOptionField = optionBasedElements.find((el) => el.id === watchTargetOptionId);
  const targetFieldOptions: string[] = selectedOptionField?.extraAttributes?.options || [];

  useEffect(() => {
    form.reset({
      label: element.extraAttributes?.label || extraAttributes.label,
      helperText: element.extraAttributes?.helperText || '',
      required: element.extraAttributes?.required ?? false,
      sourceFieldId: element.extraAttributes?.sourceFieldId || 'self',
      decisionType: element.extraAttributes?.decisionType || 'buttons',
      decisionOptions: element.extraAttributes?.decisionOptions || ['Yes', 'No'],
      operator: element.extraAttributes?.operator || 'equals',
      compareValue: element.extraAttributes?.compareValue || 'Yes',
      thenAction: element.extraAttributes?.thenAction || 'show',
      thenTargetFields: element.extraAttributes?.thenTargetFields || [],
      targetOptionFieldId: element.extraAttributes?.targetOptionFieldId || '',
      thenVisibleOptions: element.extraAttributes?.thenVisibleOptions || [],
      elseVisibleOptions: element.extraAttributes?.elseVisibleOptions || [],
      elseAction: element.extraAttributes?.elseAction || 'hide',
      elseTargetFields: element.extraAttributes?.elseTargetFields || [],
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

  // Helper to toggle a target field in the array
  const toggleTargetField = (fieldArrayName: 'thenTargetFields' | 'elseTargetFields', targetId: string) => {
    const current = form.getValues(fieldArrayName) || [];
    let next: string[];
    if (current.includes(targetId)) {
      next = current.filter((id) => id !== targetId);
    } else {
      next = [...current, targetId];
    }
    form.setValue(fieldArrayName, next);
    applyChanges(form.getValues());
  };

  // Helper to toggle an option in then/else options
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
        {/* Section 1: Decision Source */}
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
                        Watch: {el.extraAttributes?.label || el.extraAttributes?.title || el.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-[11px]">
                  {field.value === 'self'
                    ? 'Renders an interactive question on the form (e.g. Yes / No).'
                    : 'Watches an existing question already present on the form.'}
                </FormDescription>
              </FormItem>
            )}
          />

          {/* If source is self: question config */}
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

              {/* Options list */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Decision Choices</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 px-2"
                    onClick={() => {
                      const next = [...watchDecisionOptions, `Option ${watchDecisionOptions.length + 1}`];
                      form.setValue('decisionOptions', next);
                      applyChanges(form.getValues());
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {watchDecisionOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const next = [...watchDecisionOptions];
                          next[idx] = e.target.value;
                          form.setValue('decisionOptions', next);
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
                            const next = watchDecisionOptions.filter((_, i) => i !== idx);
                            form.setValue('decisionOptions', next);
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

        {/* Section 2: IF Condition (Emerald / Green) */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase">
              IF
            </span>
            <h4 className="text-xs font-bold text-foreground">Decision Match Condition</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Operator</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val: any) => {
                      field.onChange(val);
                      applyChanges({ ...form.getValues(), operator: val });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="equals">Equals (==)</SelectItem>
                      <SelectItem value="not_equals">Does not equal (!=)</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="not_contains">Does not contain</SelectItem>
                      <SelectItem value="is_not_empty">Is Answered</SelectItem>
                      <SelectItem value="is_empty">Is Empty</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compareValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Compare Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Yes" className="h-9 text-xs bg-background" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* THEN Action */}
          <div className="pt-2 border-t border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" /> THEN (When True):
              </span>
              <FormField
                control={form.control}
                name="thenAction"
                render={({ field }) => (
                  <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border">
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('show');
                        applyChanges({ ...form.getValues(), thenAction: 'show' });
                      }}
                      className={cn(
                        'px-2 py-1 text-[11px] font-semibold rounded',
                        field.value === 'show'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Show
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('hide');
                        applyChanges({ ...form.getValues(), thenAction: 'hide' });
                      }}
                      className={cn(
                        'px-2 py-1 text-[11px] font-semibold rounded',
                        field.value === 'hide'
                          ? 'bg-red-500 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Hide
                    </button>
                  </div>
                )}
              />
            </div>

            {/* Target questions checklist */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 border rounded-lg p-2 bg-background/50">
              {otherElements.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic py-1">
                  Add more questions to the form to link them here.
                </p>
              ) : (
                otherElements.map((el) => {
                  const isChecked = watchThenTargets.includes(el.id);
                  return (
                    <label
                      key={el.id}
                      className={cn(
                        'flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors',
                        isChecked ? 'bg-emerald-500/15 text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTargetField('thenTargetFields', el.id)}
                        className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">
                        {el.extraAttributes?.label || el.extraAttributes?.title || el.type}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Change Visible Option (Option-Level Decision) */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-foreground">
              Change Visible Options in Dropdown / Radio
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Dynamically filter which options appear in another question based on this decision.
          </p>

          <FormField
            control={form.control}
            name="targetOptionFieldId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Target Question with Options</FormLabel>
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
                      <SelectValue placeholder="None (Only show/hide questions)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-- None (Control whole questions only) --</SelectItem>
                    {optionBasedElements.map((el) => (
                      <SelectItem key={el.id} value={el.id}>
                        {el.extraAttributes?.label || el.type} ({el.type})
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
                  Visible options when condition is TRUE:
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
                  Visible options when condition is FALSE (ELSE):
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

        {/* Section 4: ELSE Action (Orange / Amber) */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase">
                ELSE
              </span>
              <h4 className="text-xs font-bold text-foreground">Otherwise Behavior</h4>
            </div>

            <FormField
              control={form.control}
              name="elseAction"
              render={({ field }) => (
                <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border">
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange('hide');
                      applyChanges({ ...form.getValues(), elseAction: 'hide' });
                    }}
                    className={cn(
                      'px-2 py-1 text-[11px] font-semibold rounded',
                      field.value === 'hide'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange('show');
                      applyChanges({ ...form.getValues(), elseAction: 'show' });
                    }}
                    className={cn(
                      'px-2 py-1 text-[11px] font-semibold rounded',
                      field.value === 'show'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange('none');
                      applyChanges({ ...form.getValues(), elseAction: 'none' });
                    }}
                    className={cn(
                      'px-2 py-1 text-[11px] font-semibold rounded',
                      field.value === 'none'
                        ? 'bg-muted-foreground text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    None
                  </button>
                </div>
              )}
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            {form.watch('elseAction') === 'hide' &&
              'Questions shown in the IF rule are automatically kept hidden when false.'}
            {form.watch('elseAction') === 'show' &&
              'Alternative questions below will be shown instead when condition is false.'}
            {form.watch('elseAction') === 'none' &&
              'Do not change question visibility when condition is false.'}
          </p>

          {/* If elseAction === 'show': alternative targets */}
          {form.watch('elseAction') === 'show' && (
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 border rounded-lg p-2 bg-background/50 pt-2">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Alternative Questions to Show when FALSE:
              </Label>
              {otherElements.map((el) => {
                const isChecked = watchElseTargets.includes(el.id);
                return (
                  <label
                    key={el.id}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors',
                      isChecked ? 'bg-amber-500/15 text-foreground font-medium' : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTargetField('elseTargetFields', el.id)}
                      className="rounded border-border text-amber-600 focus:ring-amber-500"
                    />
                    <span className="truncate">
                      {el.extraAttributes?.label || el.extraAttributes?.title || el.type}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <Button type="button" onClick={form.handleSubmit(applyChanges)} className="w-full text-xs font-semibold">
          Save Condition Rule
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
  const thenTargets = extra.thenTargetFields || [];
  const elseTargets = extra.elseTargetFields || [];

  // Count target names
  const thenTargetNames = elements
    .filter((el) => thenTargets.includes(el.id))
    .map((el) => el.extraAttributes?.label || el.type);

  return (
    <div className="flex w-full flex-col gap-2.5 select-none">
      {/* Top Header Card */}
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
          If / Else Decision
        </Badge>
      </div>

      {/* Decision question preview if self */}
      {isSelf && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          {(extra.decisionOptions || ['Yes', 'No']).map((opt, i) => (
            <div
              key={i}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-semibold border shadow-2xs transition-all flex items-center gap-1.5',
                opt === extra.compareValue
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'bg-muted/40 border-border/80 text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  opt === extra.compareValue ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                )}
              />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Visual Flow Representation */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5 text-xs space-y-1.5 font-mono">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <span className="font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">IF</span>
          <span>Answer {extra.operator} &quot;{extra.compareValue}&quot;</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span className="font-semibold uppercase text-[11px]">
            {extra.thenAction} ({thenTargets.length} question{thenTargets.length === 1 ? '' : 's'})
          </span>
        </div>

        {thenTargetNames.length > 0 && (
          <div className="pl-6 text-[11px] text-muted-foreground flex flex-wrap gap-1 font-sans">
            {thenTargetNames.map((name, idx) => (
              <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[10px] truncate max-w-[200px]">
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 pt-0.5">
          <span className="font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">ELSE</span>
          <span>Otherwise</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span className="font-semibold uppercase text-[11px]">
            {extra.elseAction} ({extra.elseAction === 'show' ? elseTargets.length : thenTargets.length} question{thenTargets.length === 1 ? '' : 's'})
          </span>
        </div>

        {extra.targetOptionFieldId && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-sans pt-1 border-t border-border/40">
            <Filter className="h-3 w-3" />
            <span>Changes visible options in target dropdown/radio</span>
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

  // If this condition element is merely watching another field, it doesn't render any visible UI on the form
  if (!isSelf) {
    return null;
  }

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    if (submitFunction) {
      submitFunction(element.id, val);
    }
  };

  const options = extra.decisionOptions || ['Yes', 'No'];
  const displayType = extra.decisionType || 'buttons';

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

      {/* Render based on decisionType */}
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
    </div>
  );
}
