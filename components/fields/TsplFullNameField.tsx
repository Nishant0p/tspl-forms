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
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
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

const type: ElementsType = 'TsplFullNameField';

const extraAttributes = {
  label: 'Full Name',
  helperText: 'Enter your full legal name as per government records / ID.',
  required: false,
  placeholder: 'e.g. Rahul Sharma',
  autoTitleCase: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(60),
  autoTitleCase: z.boolean().default(true),
});

// Name regex: permits alphabet letters, spaces, hyphens, and dots (e.g. "Dr. A. P. J. Abdul Kalam")
const nameRegex = /^[a-zA-Z\s.'-]+$/;

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const TsplFullNameFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <User className="h-8 w-8 text-primary" />,
    label: 'Full Name',
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

    // Must be at least 2 characters and match alphabet regex
    return val.length >= 2 && nameRegex.test(val);
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
      autoTitleCase: element.extraAttributes.autoTitleCase ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      autoTitleCase: element.extraAttributes.autoTitleCase ?? true,
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
        autoTitleCase: data.autoTitleCase,
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
          name="autoTitleCase"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Auto-Capitalize Words</FormLabel>
                <FormDescription>Converts each word to Title Case (e.g. John Doe).</FormDescription>
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
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Mandatory Field</FormLabel>
                <FormDescription>User must enter their full name.</FormDescription>
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
          <User className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Letters Only
        </span>
      </div>
      <div className="relative">
        <Input
          readOnly
          disabled
          placeholder={placeholder}
          className="pl-9 bg-muted/40 cursor-not-allowed"
        />
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

  const { label, helperText, required, placeholder, autoTitleCase } = element.extraAttributes;

  const trimmed = value.trim();
  const isValidName = trimmed.length >= 2 && nameRegex.test(trimmed);
  const hasInvalidChars = trimmed.length > 0 && !nameRegex.test(trimmed);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Disallow numbers and symbols except space, period, hyphen
    val = val.replace(/[^a-zA-Z\s.'-]/g, '');
    setValue(val);
    if (!isTouched) setIsTouched(true);

    const valid = TsplFullNameFieldFormElement.validate(element, val);
    setError(!valid);
    if (submitFunction) {
      submitFunction(element.id, val);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    let val = e.target.value.trim();
    if (autoTitleCase !== false && val) {
      val = toTitleCase(val);
      setValue(val);
    }
    const valid = TsplFullNameFieldFormElement.validate(element, val);
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
            error && 'text-red-500'
          )}
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        {isValidName && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Valid Name
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          value={value}
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'pl-9 transition-colors',
            error && 'border-red-500 focus-visible:ring-red-500/20',
            isValidName && 'border-emerald-500/80 focus-visible:ring-emerald-500/20'
          )}
        />
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {hasInvalidChars ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Name me sirf letters allow hain (numbers ya special symbols nahi).
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
