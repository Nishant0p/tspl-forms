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
  Landmark,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Building2,
} from 'lucide-react';
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
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplBankAccountField';

const extraAttributes = {
  label: 'Bank Account Number',
  helperText: '',
  required: false,
  placeholder: 'e.g. 123456789012',
  minDigits: 9,
  maxDigits: 18,
  requireConfirmation: false,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(80),
  placeholder: z.string().max(40),
  required: z.boolean().default(false),
  minDigits: z.coerce.number().min(6).max(20).default(9),
  maxDigits: z.coerce.number().min(6).max(25).default(18),
  requireConfirmation: z.boolean().default(false),
});

export const TsplBankAccountFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    label: 'Bank Account',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const { minDigits = 9, maxDigits = 18 } = element.extraAttributes;
    const cleanDigits = (currentValue || '').replace(/\D/g, '');

    if (!cleanDigits) {
      return true;
    }

    const isValidLength = cleanDigits.length >= minDigits && cleanDigits.length <= maxDigits;
    return isValidLength;
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
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      minDigits: element.extraAttributes.minDigits ?? 9,
      maxDigits: element.extraAttributes.maxDigits ?? 18,
      requireConfirmation: element.extraAttributes.requireConfirmation ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      minDigits: element.extraAttributes.minDigits ?? 9,
      maxDigits: element.extraAttributes.maxDigits ?? 18,
      requireConfirmation: element.extraAttributes.requireConfirmation ?? false,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        placeholder: data.placeholder,
        required: data.required,
        minDigits: Number(data.minDigits) || 9,
        maxDigits: Number(data.maxDigits) || 18,
        requireConfirmation: Boolean(data.requireConfirmation),
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="minDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Min Digits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={6}
                    max={20}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 9)}
                    onBlur={() => form.handleSubmit(applyChanges)()}
                  />
                </FormControl>
                <FormDescription className="text-[10px]">Usually 9 digits</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Max Digits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={6}
                    max={25}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                    onBlur={() => form.handleSubmit(applyChanges)()}
                  />
                </FormControl>
                <FormDescription className="text-[10px]">Usually 18 digits</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requireConfirmation"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Confirm Account Number</FormLabel>
                <FormDescription className="text-xs">
                  Requires respondents to re-enter account number to prevent typos.
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
  const { label, placeholder, minDigits = 9, maxDigits = 18, requireConfirmation } =
    element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-foreground font-semibold flex items-center gap-1.5">
          <Landmark className="h-4 w-4 text-primary" />
          <span>{label}</span>
        </Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 font-mono text-muted-foreground border-border/80"
        >
          {minDigits}-{maxDigits} Digits
        </Badge>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Hash className="h-4 w-4" />
        </div>
        <Input
          readOnly
          disabled
          placeholder={placeholder || 'e.g. 123456789012'}
          className="pl-9 font-mono tracking-wider bg-background"
        />
      </div>

      {requireConfirmation && (
        <div className="relative pt-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Confirm Account Number</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <Input
              readOnly
              disabled
              placeholder="Re-enter account number"
              className="pl-9 font-mono tracking-wider bg-background"
            />
          </div>
        </div>
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
  const {
    label,
    placeholder,
    minDigits = 9,
    maxDigits = 18,
    requireConfirmation = false,
  } = element.extraAttributes;

  const [value, setValue] = useState(defaultValues || '');
  const [confirmValue, setConfirmValue] = useState(defaultValues || '');
  const [showValue, setShowValue] = useState(false);
  const [showConfirmValue, setShowConfirmValue] = useState(false);
  const [error, setError] = useState(false);
  const [confirmMismatch, setConfirmMismatch] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const cleanDigits = value.replace(/\D/g, '');
  const cleanConfirmDigits = confirmValue.replace(/\D/g, '');
  const isLengthValid = cleanDigits.length >= minDigits && cleanDigits.length <= maxDigits;
  const isMatch = !requireConfirmation || (cleanDigits.length > 0 && cleanDigits === cleanConfirmDigits);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, maxDigits);
    setValue(digitsOnly);

    const validLength = digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits;
    const match = !requireConfirmation || digitsOnly === cleanConfirmDigits;
    const valid = digitsOnly.length === 0 || (validLength && match);

    setError(!valid);
    if (requireConfirmation && cleanConfirmDigits.length > 0) {
      setConfirmMismatch(digitsOnly !== cleanConfirmDigits);
    } else {
      setConfirmMismatch(false);
    }

    if (submitFunction) {
      submitFunction(element.id, valid ? digitsOnly : '');
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, maxDigits);
    setConfirmValue(digitsOnly);

    const match = cleanDigits === digitsOnly;
    setConfirmMismatch(!match);

    const validLength = cleanDigits.length >= minDigits && cleanDigits.length <= maxDigits;
    const valid = cleanDigits.length === 0 || (validLength && match);
    setError(!valid);

    if (submitFunction) {
      submitFunction(element.id, valid ? cleanDigits : '');
    }
  };

  const handleBlur = () => {
    if (!submitFunction) return;
    const validLength = cleanDigits.length >= minDigits && cleanDigits.length <= maxDigits;
    const match = !requireConfirmation || cleanDigits === cleanConfirmDigits;
    const valid = cleanDigits.length === 0 || (validLength && match);

    setError(!valid);
    if (valid) {
      submitFunction(element.id, cleanDigits);
    } else {
      submitFunction(element.id, '');
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Label and Count Badge */}
      <div className="flex items-center justify-between gap-2">
        <Label
          className={cn(
            'text-foreground font-semibold flex items-center gap-1.5',
            error && 'text-destructive'
          )}
        >
          <Landmark className="h-4 w-4 text-primary" />
          <span>{label}</span>
        </Label>

        {cleanDigits.length > 0 && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-2 py-0.5 font-mono flex items-center gap-1 transition-colors',
              isLengthValid
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
            )}
          >
            {isLengthValid ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-amber-500" />
            )}
            <span>
              {cleanDigits.length} / {minDigits}-{maxDigits} digits
            </span>
          </Badge>
        )}
      </div>

      {/* Primary Account Number Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Hash className="h-4 w-4" />
        </div>
        <Input
          type={showValue ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={handleAccountChange}
          onBlur={handleBlur}
          placeholder={placeholder || 'Enter bank account number'}
          className={cn(
            'pl-9 pr-10 font-mono tracking-wider bg-background text-foreground transition-colors',
            error && 'border-destructive focus-visible:ring-destructive',
            isLengthValid && 'border-emerald-500/50'
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setShowValue(!showValue)}
          tabIndex={-1}
          aria-label={showValue ? 'Hide account number' : 'Show account number'}
        >
          {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Confirmation Input if required */}
      {requireConfirmation && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label
              className={cn(
                'text-xs font-semibold text-muted-foreground flex items-center gap-1',
                confirmMismatch && 'text-destructive'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Confirm Bank Account Number</span>
              <span className="text-destructive">*</span>
            </Label>

            {cleanConfirmDigits.length > 0 && (
              <span
                className={cn(
                  'text-[10px] font-semibold flex items-center gap-1',
                  isMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                )}
              >
                {isMatch ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Numbers match
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" /> Numbers do not match
                  </>
                )}
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <Input
              type={showConfirmValue ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="off"
              value={confirmValue}
              onChange={handleConfirmChange}
              onBlur={handleBlur}
              placeholder="Re-enter bank account number"
              className={cn(
                'pl-9 pr-10 font-mono tracking-wider bg-background text-foreground transition-colors',
                confirmMismatch && 'border-destructive focus-visible:ring-destructive',
                isMatch && cleanConfirmDigits.length >= minDigits && 'border-emerald-500/50'
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmValue(!showConfirmValue)}
              tabIndex={-1}
              aria-label={showConfirmValue ? 'Hide account number' : 'Show account number'}
            >
              {showConfirmValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Helper Text & Error Messages */}
      {error ? (
        <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {confirmMismatch
            ? 'Account numbers do not match.'
            : `Please enter a valid ${minDigits} to ${maxDigits} digit bank account number.`}
        </p>
      ) : null}
    </div>
  );
}
