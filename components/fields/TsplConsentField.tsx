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
import { ShieldCheck, CheckSquare, AlertCircle } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplConsentField';

const defaultDeclarationText =
  'I hereby declare that all the information provided in this form is true, correct, and complete to the best of my knowledge and belief. I understand that submitting false or misleading information may lead to disqualification or appropriate action as per TSPL policy.';

const extraAttributes = {
  label: 'Consent & Declaration',
  declarationText: defaultDeclarationText,
  agreementLabel: 'I have read, understood, and agree to the declaration above',
  helperText: 'You must check the box above to acknowledge and submit.',
  required: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  declarationText: z.string().min(10).max(1000),
  agreementLabel: z.string().min(2).max(150),
  helperText: z.string().max(200),
  required: z.boolean().default(true),
});

export const TsplConsentFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    label: 'Consent / Dec.',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const isChecked = currentValue === 'true' || currentValue === 'Accepted' || currentValue === 'agreed';

    if (element.extraAttributes.required) {
      return isChecked;
    }

    return true;
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
      declarationText: element.extraAttributes.declarationText || defaultDeclarationText,
      agreementLabel: element.extraAttributes.agreementLabel,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      declarationText: element.extraAttributes.declarationText || defaultDeclarationText,
      agreementLabel: element.extraAttributes.agreementLabel,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required ?? true,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        declarationText: data.declarationText,
        agreementLabel: data.agreementLabel,
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
              <FormLabel>Section Title</FormLabel>
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
          name="declarationText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Declaration Text / Terms</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>The terms or statement the user must read.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreementLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checkbox Label</FormLabel>
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
  const { label, declarationText, agreementLabel, helperText, required } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Legal / Consent
        </span>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-3">
          &ldquo;{declarationText || defaultDeclarationText}&rdquo;
        </p>
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox disabled id="designer-consent" />
          <label
            htmlFor="designer-consent"
            className="text-xs font-semibold text-foreground leading-tight cursor-not-allowed"
          >
            {agreementLabel || 'I have read, understood, and agree to the declaration above'}
          </label>
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
  const [agreed, setAgreed] = useState<boolean>(
    defaultValues === 'true' || defaultValues === 'Accepted'
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, declarationText, agreementLabel, helperText, required } = element.extraAttributes;

  const handleCheckedChange = (checked: boolean) => {
    setAgreed(checked);
    const valid = !required || checked;
    setError(!valid);

    if (submitFunction) {
      submitFunction(element.id, checked ? 'Accepted' : '');
    }
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        {agreed && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" /> Confirmed
          </span>
        )}
      </div>

      <div
        className={cn(
          'rounded-xl border p-4 space-y-3.5 transition-all',
          agreed
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : error
              ? 'border-red-500/80 bg-red-500/5 ring-1 ring-red-500/20'
              : 'border-border/90 bg-card/60'
        )}
      >
        <div className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/60 pl-3 py-0.5">
          {declarationText || defaultDeclarationText}
        </div>

        <div className="flex items-start space-x-2.5 pt-1">
          <Checkbox
            id={`consent-${element.id}`}
            checked={agreed}
            onCheckedChange={(checked) => handleCheckedChange(Boolean(checked))}
            className={cn(
              'mt-0.5 transition-colors',
              error && 'border-red-500 data-[state=unchecked]:border-red-500'
            )}
          />
          <label
            htmlFor={`consent-${element.id}`}
            className={cn(
              'text-xs font-semibold leading-tight cursor-pointer select-none transition-colors',
              agreed ? 'text-foreground' : 'text-foreground/90',
              error && 'text-red-500'
            )}
          >
            {agreementLabel || 'I have read, understood, and agree to the declaration above'}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Aage badhne ke liye kripya declaration accept karein.
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
