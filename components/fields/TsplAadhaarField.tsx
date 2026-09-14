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
import { Fingerprint, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplAadhaarField';

const extraAttributes = {
  label: 'Aadhaar Card Number',
  helperText: '',
  required: false,
  placeholder: '1234 5678 9012',
  allowMasking: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(80),
  helperText: z.string().optional(),
  required: z.boolean().default(false),
  placeholder: z.string().max(40),
  allowMasking: z.boolean().default(true),
});

// Format 12 digits as "XXXX XXXX XXXX"
function formatAadhaar(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export const TsplAadhaarFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Fingerprint className="h-8 w-8 text-primary" />,
    label: 'Aadhaar Card',
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

    return digits.length === 12;
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
      allowMasking: element.extraAttributes.allowMasking ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      allowMasking: element.extraAttributes.allowMasking ?? true,
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
        allowMasking: data.allowMasking,
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
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Required</FormLabel>
                <FormDescription className="text-xs">
                  Respondents must enter a valid 12-digit Aadhaar number.
                </FormDescription>
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

        <FormField
          control={form.control}
          name="allowMasking"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Enable Masking Toggle</FormLabel>
                <FormDescription className="text-xs">
                  Allows user to hide digits with bullets for PII security.
                </FormDescription>
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
  const { label, helperText, required, placeholder } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Fingerprint className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-wider">
            UIDAI 12 Digits
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 px-2.5 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none">
          🇮🇳 Aadhaar
        </div>
        <Input
          readOnly
          disabled
          type="text"
          placeholder={placeholder || '1234 5678 9012'}
          className="bg-muted/40 cursor-not-allowed font-mono tracking-widest text-sm"
        />
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
  const [digits, setDigits] = useState<string>(
    (defaultValues || '').replace(/\D/g, '').slice(0, 12)
  );
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, placeholder, allowMasking } = element.extraAttributes;

  const isComplete12Digits = digits.length === 12;
  const showLengthError = isTouched && digits.length > 0 && digits.length < 12;

  const displayFormatted = formatAadhaar(digits);

  // Masked string representation: "•••• •••• 1234"
  const getMaskedDisplay = () => {
    if (!isMasked) return displayFormatted;
    if (digits.length <= 4) return '•'.repeat(digits.length);
    if (digits.length <= 8) {
      const firstGroup = '••••';
      const secondGroup = '•'.repeat(digits.length - 4);
      return `${firstGroup} ${secondGroup}`;
    }
    const lastFour = digits.slice(8);
    return `•••• •••• ${lastFour}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/\D/g, '').slice(0, 12);
    setDigits(sanitized);
    if (!isTouched) setIsTouched(true);

    const formatted = formatAadhaar(sanitized);
    const valid = TsplAadhaarFieldFormElement.validate(element, sanitized);
    setError(!valid);

    if (submitFunction) {
      submitFunction(element.id, formatted);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    const valid = TsplAadhaarFieldFormElement.validate(element, digits);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, formatAadhaar(digits));
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
          <Fingerprint className="h-4 w-4 text-primary shrink-0" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>

        <div className="flex items-center gap-2">
          {digits.length > 0 && (
            <span
              className={cn(
                'text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md',
                isComplete12Digits
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              {digits.length}/12 digits
            </span>
          )}
          {isComplete12Digits && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified Format
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 px-2.5 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none shadow-2xs">
          🇮🇳 UIDAI
        </div>
        <div className="relative flex-1">
          <Input
            value={isMasked ? getMaskedDisplay() : displayFormatted}
            type="text"
            inputMode="numeric"
            maxLength={14} // 12 digits + 2 spaces
            placeholder={placeholder || '1234 5678 9012'}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'font-mono tracking-widest text-sm transition-colors pr-9',
              (error || showLengthError) && 'border-red-500 focus-visible:ring-red-500/20',
              isComplete12Digits && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
            )}
          />
          {allowMasking !== false && digits.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              title={isMasked ? 'Show digits' : 'Mask digits'}
            >
              {isMasked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {showLengthError ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Aadhaar must be exactly 12 digits. {12 - digits.length} digit(s) remaining.
        </p>
      ) : null}
    </div>
  );
}
