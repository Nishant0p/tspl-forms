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
import { ListFilter, SlidersHorizontal, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplRangeDropdownField';

const extraAttributes = {
  label: 'Range Dropdown (Years / Numbers)',
  helperText: 'Select a value from the auto-populated range.',
  required: false,
  placeholder: 'Select an option...',
  min: 2000,
  max: 2026,
  step: 1,
  direction: 'desc' as 'asc' | 'desc',
  unitSuffix: '',
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(50),
  min: z.coerce.number().default(2000),
  max: z.coerce.number().default(2026),
  step: z.coerce.number().min(1).default(1),
  direction: z.enum(['asc', 'desc']).default('desc'),
  unitSuffix: z.string().max(20).default(''),
});

function generateRangeOptions(
  min: number,
  max: number,
  step: number = 1,
  direction: 'asc' | 'desc' = 'desc',
  suffix: string = ''
): string[] {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const safeStep = Math.max(1, step);

  const list: string[] = [];
  for (let i = safeMin; i <= safeMax; i += safeStep) {
    list.push(suffix ? `${i} ${suffix}`.trim() : String(i));
  }

  return direction === 'desc' ? list.reverse() : list;
}

export const TsplRangeDropdownFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <ListFilter className="h-8 w-8 text-primary" />,
    label: 'Range Dropdown',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const val = (currentValue || '').trim();

    if (element.extraAttributes.required) {
      return val.length > 0;
    }

    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      min: element.extraAttributes.min ?? 2000,
      max: element.extraAttributes.max ?? 2026,
      step: element.extraAttributes.step ?? 1,
      direction: element.extraAttributes.direction ?? 'desc',
      unitSuffix: element.extraAttributes.unitSuffix ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      min: element.extraAttributes.min ?? 2000,
      max: element.extraAttributes.max ?? 2026,
      step: element.extraAttributes.step ?? 1,
      direction: element.extraAttributes.direction ?? 'desc',
      unitSuffix: element.extraAttributes.unitSuffix ?? '',
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        placeholder: data.placeholder,
        required: data.required,
        min: data.min,
        max: data.max,
        step: data.step,
        direction: data.direction,
        unitSuffix: data.unitSuffix,
      },
    });
  }

  const currentMin = form.watch('min');
  const currentMax = form.watch('max');
  const currentStep = form.watch('step');
  const count = useMemo(() => {
    return Math.floor(Math.abs(Number(currentMax) - Number(currentMin)) / Math.max(1, Number(currentStep))) + 1;
  }, [currentMin, currentMax, currentStep]);

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Value / Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.handleSubmit(applyChanges)();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Value / Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.handleSubmit(applyChanges)();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="step"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Step</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.handleSubmit(applyChanges)();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val: 'asc' | 'desc') => {
                    field.onChange(val);
                    form.handleSubmit(applyChanges)();
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="desc">Descending (e.g. 2026..2000)</SelectItem>
                    <SelectItem value="asc">Ascending (e.g. 1..100)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="unitSuffix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit / Suffix (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Years, Kg, etc."
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>Appended to each number (e.g. "2024").</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center justify-between">
          <span>Auto-populated Options:</span>
          <strong className="font-bold">{count} items</strong>
        </div>

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Mandatory Field</FormLabel>
                <FormDescription>User must pick an option.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(val) => {
                    field.onChange(val);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
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
  const { label, helperText, required, placeholder, min, max, step, direction, unitSuffix } =
    element.extraAttributes;

  const options = generateRangeOptions(min, max, step, direction, unitSuffix);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <ListFilter className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {options.length} Auto-Items ({min}–{max})
        </span>
      </div>

      <div className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground flex items-center justify-between cursor-not-allowed">
        <span>{placeholder || 'Select value...'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
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
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, placeholder, min, max, step, direction, unitSuffix } =
    element.extraAttributes;

  const options = useMemo(
    () => generateRangeOptions(min, max, step, direction, unitSuffix),
    [min, max, step, direction, unitSuffix]
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
      </div>

      <Select
        value={value}
        onValueChange={(val) => {
          setValue(val);
          if (!submitFunction) return;
          const valid = TsplRangeDropdownFieldFormElement.validate(element, val);
          setError(!valid);
          submitFunction(element.id, val);
        }}
      >
        <SelectTrigger
          className={cn(
            'w-full transition-colors',
            error && 'border-red-500 focus:ring-red-500/20',
            value && 'border-emerald-500/80'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
