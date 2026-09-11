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
import { Calendar as CalendarIcon, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { differenceInYears, differenceInMonths, isValid, parseISO } from 'date-fns';

const type: ElementsType = 'TsplDobAgeField';

const extraAttributes = {
  label: 'Date of Birth & Age',
  helperText: 'Select your birth date. Current age will be calculated automatically.',
  required: false,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
});

function calculateAgeFromDate(dateStr: string): { years: number; months: number; isValid: boolean; isFuture: boolean } {
  if (!dateStr) return { years: 0, months: 0, isValid: false, isFuture: false };
  const birthDate = new Date(dateStr);
  if (!isValid(birthDate)) return { years: 0, months: 0, isValid: false, isFuture: false };

  const now = new Date();
  if (birthDate > now) {
    return { years: 0, months: 0, isValid: true, isFuture: true };
  }

  const years = differenceInYears(now, birthDate);
  const totalMonths = differenceInMonths(now, birthDate);
  const remainingMonths = totalMonths % 12;

  return { years, months: remainingMonths, isValid: true, isFuture: false };
}

export const TsplDobAgeFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <CalendarIcon className="h-8 w-8 text-primary" />,
    label: 'DOB → Age',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const val = (currentValue || '').trim();

    if (!val) {
      return !element.extraAttributes.required;
    }

    // Extract ISO date part
    const datePart = val.split(' ')[0] || val;
    const { isValid: validDate, isFuture } = calculateAgeFromDate(datePart);
    return validDate && !isFuture;
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
      required: element.extraAttributes.required,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        required: data.required,
      },
    });
  }

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
              <FormLabel>Label</FormLabel>
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

        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper Text</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Mandatory Field</FormLabel>
                <FormDescription>Respondent must pick birth date.</FormDescription>
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
  const { label, helperText, required } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Auto Age
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          readOnly
          disabled
          type="date"
          defaultValue="2000-01-01"
          className="bg-muted/40 cursor-not-allowed"
        />
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Auto Age: 26 Years old</span>
        </div>
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
  const { label, helperText, required } = element.extraAttributes;

  // Extract initial date part from e.g. "2002-05-15 (Age: 24 yrs)"
  const initialDate = defaultValues ? defaultValues.split(' ')[0] || '' : '';
  const [dateValue, setDateValue] = useState(initialDate);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const ageData = calculateAgeFromDate(dateValue);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateValue(newDate);

    const calculated = calculateAgeFromDate(newDate);
    const valid = !newDate ? !required : calculated.isValid && !calculated.isFuture;
    setError(!valid);

    if (submitFunction) {
      if (!newDate) {
        submitFunction(element.id, '');
      } else if (calculated.isValid && !calculated.isFuture) {
        const fullPayload = `${newDate} (Age: ${calculated.years} yrs ${calculated.months > 0 ? `${calculated.months} mos` : ''})`.trim();
        submitFunction(element.id, fullPayload);
      } else {
        submitFunction(element.id, newDate);
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>

        {dateValue && ageData.isValid && !ageData.isFuture && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Age Calculated
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={dateValue}
            type="date"
            max={todayStr}
            onChange={handleDateChange}
            className={cn(
              'transition-colors',
              (error || ageData.isFuture) && 'border-red-500 focus-visible:ring-red-500/20',
              dateValue && ageData.isValid && !ageData.isFuture && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
            )}
          />
        </div>

        {dateValue && ageData.isValid && !ageData.isFuture && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-in fade-in zoom-in-95 duration-200 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>
              Age: <strong className="font-bold text-foreground">{ageData.years} Years</strong>
              {ageData.months > 0 && <span className="text-muted-foreground ml-1 font-normal">({ageData.months} months)</span>}
            </span>
          </div>
        )}
      </div>

      {ageData.isFuture ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Birthdate future me nahi ho sakti. Kripya valid date chunein.
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
