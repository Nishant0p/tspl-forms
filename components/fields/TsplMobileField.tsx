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
import { Phone, CheckCircle2, AlertCircle, Hash } from 'lucide-react';
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

const type: ElementsType = 'TsplMobileField';

const extraAttributes = {
  label: 'Mobile Number',
  helperText: 'Enter 10-digit mobile number (e.g. 9876543210)',
  required: false,
  placeholder: '9876543210',
  showCountryCode: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(30),
  showCountryCode: z.boolean().default(true),
});

// Strict 10-digit mobile number regex (starts with standard 6-9, or any 10 digits)
const mobileStrictRegex = /^[6-9]\d{9}$/;
const mobileTenDigitsOnlyRegex = /^\d{10}$/;

export const TsplMobileFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Phone className="h-8 w-8 text-primary" />,
    label: 'Mobile No.',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const digits = (currentValue || '').replace(/\D/g, '');

    if (!digits) {
      return !element.extraAttributes.required;
    }

    return mobileTenDigitsOnlyRegex.test(digits);
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
      showCountryCode: element.extraAttributes.showCountryCode ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      showCountryCode: element.extraAttributes.showCountryCode ?? true,
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
        showCountryCode: data.showCountryCode,
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
          name="showCountryCode"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Show +91 Prefix</FormLabel>
                <FormDescription>Displays India code badge beside the input.</FormDescription>
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
  const { label, helperText, required, placeholder, showCountryCode } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Phone className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Strict 10 Digits
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {showCountryCode !== false && (
          <div className="flex items-center justify-center h-10 px-3 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none">
            🇮🇳 +91
          </div>
        )}
        <Input
          readOnly
          disabled
          type="tel"
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

  const { label, helperText, required, placeholder, showCountryCode } = element.extraAttributes;

  const digits = value.replace(/\D/g, '').slice(0, 10);
  const isComplete10Digits = digits.length === 10;
  const isStandardIndianMobile = mobileStrictRegex.test(digits);
  const isValidMobile = digits.length === 10;
  const showLengthError = isTouched && digits.length > 0 && digits.length < 10;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, truncate to 10 max
    const raw = e.target.value;
    const sanitized = raw.replace(/\D/g, '').slice(0, 10);
    setValue(sanitized);
    if (!isTouched) setIsTouched(true);

    const valid = TsplMobileFieldFormElement.validate(element, sanitized);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, sanitized);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
    const valid = TsplMobileFieldFormElement.validate(element, sanitized);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, sanitized);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            (error || showLengthError) && 'text-red-500'
          )}
        >
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>

        <div className="flex items-center gap-2">
          {digits.length > 0 && (
            <span
              className={cn(
                'text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded-md',
                isComplete10Digits
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              {digits.length}/10 digits
            </span>
          )}
          {isComplete10Digits && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showCountryCode !== false && (
          <div className="flex items-center justify-center h-10 px-3 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none shadow-2xs">
            🇮🇳 +91
          </div>
        )}
        <div className="relative flex-1">
          <Input
            value={value}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'font-mono tracking-wider transition-colors',
              (error || showLengthError) && 'border-red-500 focus-visible:ring-red-500/20',
              isComplete10Digits && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
            )}
          />
        </div>
      </div>

      {showLengthError ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Sirf 10-digit number accept hoga. {10 - digits.length} digit aur daliye.
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
