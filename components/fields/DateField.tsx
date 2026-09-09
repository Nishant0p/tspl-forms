'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from '@/app/(dashboard)/_components/FormElements';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useDesginerStore } from '@/store/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { format, isValid, parse } from 'date-fns';

const type: ElementsType = 'DateField';

const extraAttributes = {
  label: 'Date Field',
  helperText: '',
  required: false,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
});

export const DateFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <CalendarIcon className="h-8 w-8" />,
    label: 'Date Field',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;

    if (element.extraAttributes.required) {
      return !!currentValue && currentValue.trim().length > 0;
    }

    return true;
  }
};

type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { updateElement } = useDesginerStore();

  const { label, helperText, required } = element.extraAttributes;

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: label,
      helperText: helperText,
      required: required,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    const { label, helperText } = data;

    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label,
        helperText,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-4">
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
      </form>
    </Form>
  );
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear + 15 - 1920 + 1 },
  (_, i) => String(currentYear + 15 - i)
);

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, helperText } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="mr-2 text-foreground font-semibold text-sm">
        {label}
        {required && <span className="ml-2 text-red-500 font-bold">*</span>}
      </Label>
      <div className="relative flex items-center w-full">
        <Button
          variant={'outline'}
          className="w-full justify-start text-left font-normal h-11 pl-3.5 pr-10 border-border rounded-xl pointer-events-none bg-background shadow-xs text-sm"
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-foreground/70 shrink-0" />
          <span className="text-muted-foreground truncate">Select date (DD/MM/YYYY)</span>
        </Button>
      </div>
      {helperText && (
        <p className="text-[.8rem] text-muted-foreground">{helperText}</p>
      )}
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

  const parseInitialDate = (val?: string) => {
    if (!val) return undefined;
    const d = new Date(val);
    if (isValid(d)) return d;
    try {
      const parsed = parse(val, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) return parsed;
    } catch {}
    return undefined;
  };

  const [date, setDate] = useState<Date | undefined>(() => parseInitialDate(defaultValues));
  const [currentMonth, setCurrentMonth] = useState<Date>(() => date || new Date());
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  useEffect(() => {
    if (defaultValues) {
      const parsed = parseInitialDate(defaultValues);
      if (parsed) {
        setDate(parsed);
        setCurrentMonth(parsed);
      }
    }
  }, [defaultValues]);

  const { label, required, helperText } = element.extraAttributes;

  const handleSelectDate = (selected?: Date) => {
    setDate(selected);
    if (!selected) {
      const valid = DateFieldFormElement.validate(element, '');
      setError(!valid);
      submitFunction?.(element.id, '');
      return;
    }

    setCurrentMonth(selected);
    const isoString = selected.toISOString();
    const valid = DateFieldFormElement.validate(element, isoString);
    setError(!valid);
    submitFunction?.(element.id, isoString);
    setOpen(false);
  };

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const updated = new Date(currentMonth);
    updated.setFullYear(year);
    setCurrentMonth(updated);
  };

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    const updated = new Date(currentMonth);
    updated.setMonth(month);
    setCurrentMonth(updated);
  };

  const handleSetToday = () => {
    const today = new Date();
    handleSelectDate(today);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDate(undefined);
    const valid = DateFieldFormElement.validate(element, '');
    setError(!valid);
    submitFunction?.(element.id, '');
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn("mr-2 text-foreground font-semibold text-sm", error && 'text-red-500')}>
        {label}
        {required && <span className="ml-2 text-red-500 font-bold">*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative flex items-center w-full">
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11 pl-3.5 pr-10 border-border rounded-xl bg-background transition-all shadow-xs overflow-hidden",
                !date && "text-muted-foreground",
                error && "border-red-500 ring-1 ring-red-500",
                open && "border-foreground ring-1 ring-foreground/20"
              )}
            >
              <CalendarIcon className="mr-2.5 h-4 w-4 text-foreground/70 shrink-0" />
              {date ? (
                <span className="font-semibold text-foreground truncate text-sm">
                  {format(date, "dd/MM/yyyy")}
                  <span className="text-muted-foreground font-normal hidden sm:inline"> &mdash; </span>
                  <span className="font-medium hidden sm:inline">{format(date, "EEE, MMM d, yyyy")}</span>
                </span>
              ) : (
                <span className="truncate text-sm">Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>

          {date && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-muted/80 active:scale-95 transition-all z-10 cursor-pointer"
              title="Clear date"
              aria-label="Clear date"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <PopoverContent
          className="w-auto max-w-[calc(100vw-32px)] p-3 z-50 bg-card text-card-foreground border border-border shadow-2xl rounded-2xl"
          align="start"
        >
          {/* Year & Month Choose Option Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-border/80">
            {/* Month Dropdown */}
            <Select
              value={String(currentMonth.getMonth())}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 text-xs font-semibold flex-1 min-w-[90px] rounded-lg">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-56 z-50">
                {MONTHS.map((m, idx) => (
                  <SelectItem key={m} value={String(idx)} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Dropdown - Dedicated Year Choose Option */}
            <Select
              value={String(currentMonth.getFullYear())}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 text-xs font-bold w-[95px] text-foreground border-border rounded-lg">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-56 z-50">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="text-xs font-medium">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DayPicker Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            initialFocus
            className="rounded-lg p-0"
          />

          {/* Footer Shortcuts: Today and Clear */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/80 text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-foreground font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Today ({format(new Date(), 'dd/MM/yyyy')})</span>
            </button>
            {date && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer font-medium"
              >
                Clear date
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {helperText && (
        <p className={cn("text-[.8rem] text-muted-foreground", error && "text-red-500")}>
          {helperText}
        </p>
      )}
    </div>
  );
}
