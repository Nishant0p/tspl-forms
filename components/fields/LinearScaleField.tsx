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
import { Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

const type: ElementsType = 'LinearScaleField';

const extraAttributes = {
  label: 'Linear Scale Field',
  helperText: 'Helper Text',
  required: false,
  min: 1,
  max: 10,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  min: z.number().min(0).max(9),
  max: z.number().min(1).max(20),
});

export const LinearScaleFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Scale className="h-8 w-8" />,
    label: 'Linear Scale Field',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;

    if (currentValue.length === 0) {
      return !element.extraAttributes.required;
    }

    const numericValue = Number(currentValue);
    return (
      numericValue >= element.extraAttributes.min &&
      numericValue <= element.extraAttributes.max
    );
  },
};

type propertiesType = z.infer<typeof propertiesSchema>;

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: element.extraAttributes,
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: data,
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(event) => event.preventDefault()}
        className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min {form.watch('min')}</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  min={0}
                  max={9}
                  step={1}
                  onValueChange={(values) => field.onChange(values[0])}
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
              <FormLabel>Max {form.watch('max')}</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(values) => field.onChange(values[0])}
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
            <FormItem>
              <FormLabel>Required</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
  const { label, helperText, required, min, max } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="mr-2 text-foreground">
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{min}</span>
        <Slider value={[Math.floor((min + max) / 2)]} min={min} max={max} step={1} disabled />
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>
      {helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}
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
  const [value, setValue] = useState(defaultValues || String(element.extraAttributes.min));
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, min, max } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>
        {label}
        {required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="flex-1" />
          <span>{max}</span>
        </div>
        <Slider
          value={[Number(value)]}
          min={min}
          max={max}
          step={1}
          onValueChange={(values) => {
            const nextValue = String(values[0]);
            setValue(nextValue);
            if (!submitFunction) return;

            const valid = LinearScaleFieldFormElement.validate(element, nextValue);
            setError(!valid);
            submitFunction(element.id, nextValue);
          }}
        />
      </div>
      {helperText && (
        <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>
          {helperText}
        </p>
      )}
    </div>
  );
}
