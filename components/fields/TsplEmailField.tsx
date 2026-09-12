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
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
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

const type: ElementsType = 'TsplEmailField';

const extraAttributes = {
  label: 'Email ID',
  helperText: 'Must be a valid email format (e.g. user@gmail.com)',
  required: false,
  placeholder: 'user@gmail.com',
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(60),
});

// Strict RFC 5322 compliant regex for standard email validation
const emailStrictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const TsplEmailFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Mail className="h-8 w-8 text-primary" />,
    label: 'Email ID',
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

    return emailStrictRegex.test(val);
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
        placeholder: data.placeholder,
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
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>The title shown above the input.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placeholder</FormLabel>
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
              <FormLabel>Helper Text / Guidance</FormLabel>
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
  const { label, helperText, required, placeholder } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Strict Format
        </span>
      </div>
      <div className="relative">
        <Input
          readOnly
          disabled
          type="email"
          placeholder={placeholder}
          className="bg-muted/40 cursor-not-allowed"
        />
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
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, placeholder } = element.extraAttributes;

  const trimmed = value.trim();
  const isValidFormat = trimmed.length > 0 ? emailStrictRegex.test(trimmed) : !required;
  const showFormatError = isTouched && trimmed.length > 0 && !emailStrictRegex.test(trimmed);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s/g, '');
    setValue(val);
    if (!isTouched) setIsTouched(true);

    const valid = TsplEmailFieldFormElement.validate(element, val);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, val);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const val = e.target.value.trim();
    const valid = TsplEmailFieldFormElement.validate(element, val);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, val);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            (error || showFormatError) && 'text-red-500'
          )}
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        {trimmed.length > 0 && (
          <span
            className={cn(
              'text-[11px] font-medium flex items-center gap-1',
              isValidFormat ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            )}
          >
            {isValidFormat ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Valid email
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" /> Invalid format
              </>
            )}
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          value={value}
          type="email"
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'transition-colors',
            (error || showFormatError) && 'border-red-500 focus-visible:ring-red-500/20',
            isValidFormat && trimmed.length > 0 && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
          )}
        />
      </div>

      {showFormatError ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Galat format! Kripya valid email dalein (e.g. user@gmail.com).
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
