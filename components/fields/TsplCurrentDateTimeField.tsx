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
import { Clock, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { format } from 'date-fns';

const type: ElementsType = 'TsplCurrentDateTimeField';

const extraAttributes = {
  label: 'Submission Date & Time',
  helperText: 'Recorded automatically upon form submission.',
  includeTime: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  includeTime: z.boolean().default(true),
});

export const TsplCurrentDateTimeFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Clock className="h-8 w-8 text-primary" />,
    label: 'Current Date/Time',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (): boolean => true,
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
      includeTime: element.extraAttributes.includeTime ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      includeTime: element.extraAttributes.includeTime ?? true,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        includeTime: data.includeTime,
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
  const { label, helperText } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          <span>{label}</span>
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Auto-Capture
        </span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {format(new Date(), 'dd MMMM yyyy, hh:mm:ss a')}
            </p>
            <p className="text-[11px] text-muted-foreground">Auto-recorded at time of submission</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          READ ONLY
        </span>
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

function FormComponent({
  elementInstance,
  submitFunction,
  defaultValues,
}: {
  elementInstance: FormElementInstance;
  submitFunction?: SubmitFunction;
  isInvalid?: boolean;
  defaultValues?: string;
}) {
  const element = elementInstance as CustomInstance;
  const { label, helperText } = element.extraAttributes;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const formattedString = format(currentTime, 'dd MMMM yyyy, hh:mm:ss a');

  // Auto-record submission time automatically on render/mount
  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);
    const stamped = format(now, 'yyyy-MM-dd HH:mm:ss');
    if (submitFunction) {
      submitFunction(element.id, stamped);
    }
    // Update live clock tick every second for crisp feedback
    const interval = setInterval(() => {
      const liveNow = new Date();
      setCurrentTime(liveNow);
      if (submitFunction) {
        submitFunction(element.id, format(liveNow, 'yyyy-MM-dd HH:mm:ss'));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [element.id, submitFunction]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-sm text-foreground flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Auto Recorded
        </span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Clock className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-foreground font-mono">
              {formattedString}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>Timestamp will be securely saved with response</span>
            </p>
          </div>
        </div>
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
