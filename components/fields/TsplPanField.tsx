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
import { CreditCard, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
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

const type: ElementsType = 'TsplPanField';

const extraAttributes = {
  label: 'PAN Card Number',
  helperText: 'Enter 10-character Permanent Account Number (e.g. ABCDE1234F)',
  required: false,
  placeholder: 'ABCDE1234F',
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(80),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(30),
});

// Indian PAN regex: 5 uppercase letters, 4 digits, 1 uppercase letter
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Identify PAN holder category by 4th letter
function getPanHolderType(pan: string): string | null {
  if (pan.length < 4) return null;
  const char = pan[3].toUpperCase();
  const types: Record<string, string> = {
    P: 'Individual / Person',
    C: 'Company',
    H: 'HUF (Hindu Undivided Family)',
    A: 'Association of Persons (AOP)',
    B: 'Body of Individuals (BOI)',
    G: 'Government Agency',
    J: 'Artificial Juridical Person',
    L: 'Local Authority',
    F: 'Firm / LLP',
    T: 'Trust',
  };
  return types[char] || null;
}

export const TsplPanFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    label: 'PAN Card',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const cleanPan = (currentValue || '').trim().toUpperCase();

    if (!cleanPan) {
      return !element.extraAttributes.required;
    }

    return panRegex.test(cleanPan);
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
    form.reset({
      ...element.extraAttributes,
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
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Required</FormLabel>
                <FormDescription className="text-xs">
                  Respondents must enter a valid 10-character Indian PAN number.
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
          <CreditCard className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-wider">
            10-Char PAN
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 px-2.5 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none">
          🇮🇳 NSDL
        </div>
        <Input
          readOnly
          disabled
          type="text"
          placeholder={placeholder || 'ABCDE1234F'}
          className="bg-muted/40 cursor-not-allowed font-mono tracking-widest uppercase text-sm"
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
  const [value, setValue] = useState<string>((defaultValues || '').trim().toUpperCase());
  const [error, setError] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, placeholder } = element.extraAttributes;

  const isValidPan = panRegex.test(value);
  const holderType = isValidPan ? getPanHolderType(value) : null;
  const showFormatError = isTouched && value.length > 0 && !isValidPan;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept alphanumeric characters, auto-uppercase, max 10 chars
    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setValue(sanitized);
    if (!isTouched) setIsTouched(true);

    const valid = TsplPanFieldFormElement.validate(element, sanitized);
    setError(!valid);

    if (submitFunction) {
      submitFunction(element.id, sanitized);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    const valid = TsplPanFieldFormElement.validate(element, sanitized);
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
            (error || showFormatError) && 'text-red-500'
          )}
        >
          <CreditCard className="h-4 w-4 text-primary shrink-0" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>

        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <span
              className={cn(
                'text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md',
                isValidPan
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              {value.length}/10 chars
            </span>
          )}
          {isValidPan && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valid PAN
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 px-2.5 rounded-md bg-muted border border-input text-xs font-bold text-foreground shrink-0 select-none shadow-2xs">
          🇮🇳 PAN
        </div>
        <div className="relative flex-1">
          <Input
            value={value}
            type="text"
            maxLength={10}
            placeholder={placeholder || 'ABCDE1234F'}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'font-mono tracking-widest text-sm uppercase transition-colors',
              (error || showFormatError) && 'border-red-500 focus-visible:ring-red-500/20',
              isValidPan && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
            )}
          />
        </div>
      </div>

      {holderType && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-md px-2.5 py-1 border border-emerald-500/20">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Category: <strong className="font-semibold">{holderType}</strong></span>
        </div>
      )}

      {showFormatError ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {value.length < 10
            ? `PAN must be 10 characters (${10 - value.length} left). Format: 5 letters, 4 digits, 1 letter.`
            : 'Invalid PAN format. Standard format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).'}
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          <span>{helperText}</span>
        </p>
      ) : null}
    </div>
  );
}
