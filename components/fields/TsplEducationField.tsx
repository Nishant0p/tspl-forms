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
import { GraduationCap, ChevronDown, Plus, X, Sparkles } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplEducationField';

const defaultEducationOptions = [
  '10th Pass (High School / SSC)',
  '12th Pass (Higher Secondary / HSC)',
  'ITI (Industrial Training Institute)',
  'Diploma / Polytechnic',
  'Graduate (B.Tech / B.E. / B.Sc / B.Com / B.A. / BBA / BCA)',
  'Post Graduate (M.Tech / M.E. / M.Sc / M.Com / M.A. / MBA / MCA)',
  'Doctorate / Ph.D.',
  'Other / Professional Certification',
];

const extraAttributes = {
  label: 'Education Qualification',
  helperText: 'Select your highest educational degree / qualification.',
  required: false,
  placeholder: 'Select highest education qualification...',
  options: defaultEducationOptions,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeholder: z.string().max(60),
  options: z.array(z.string()).default(defaultEducationOptions),
});

export const TsplEducationFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    label: 'Education',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    const val = (currentValue || '').trim();

    if (element.extraAttributes.required) {
      return val.length > 0;
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

  const [newOption, setNewOption] = useState('');

  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      options: element.extraAttributes.options || defaultEducationOptions,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeholder: element.extraAttributes.placeholder,
      required: element.extraAttributes.required,
      options: element.extraAttributes.options || defaultEducationOptions,
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
        options: data.options,
      },
    });
  }

  const options = form.watch('options') || [];

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const updated = [...options, newOption.trim()];
    form.setValue('options', updated);
    setNewOption('');
    form.handleSubmit(applyChanges)();
  };

  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    form.setValue('options', updated);
    form.handleSubmit(applyChanges)();
  };

  const handleResetDefaults = () => {
    form.setValue('options', defaultEducationOptions);
    form.handleSubmit(applyChanges)();
  };

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

        <Separator />

        {/* Readymade Degrees List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Standard Qualification Options ({options.length})</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetDefaults}
              className="text-[11px] h-6 px-2 text-primary hover:text-primary"
            >
              Reset List
            </Button>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-1.5 rounded border border-border bg-card text-xs"
              >
                <span className="truncate flex-1 font-medium">{opt}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-red-500 shrink-0"
                  onClick={() => handleRemoveOption(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add custom qualification..."
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddOption}
              className="h-8 px-2.5 text-xs gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel>Mandatory Field</FormLabel>
                <FormDescription>User must select a qualification.</FormDescription>
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
  const { label, helperText, required, placeholder, options } = element.extraAttributes;
  const optList = options && options.length > 0 ? options : defaultEducationOptions;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Readymade Degrees ({optList.length})
        </span>
      </div>

      <div className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground flex items-center justify-between cursor-not-allowed">
        <span>{placeholder || 'Select degree...'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
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

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, helperText, required, placeholder, options } = element.extraAttributes;
  const optList = options && options.length > 0 ? options : defaultEducationOptions;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-sm text-foreground flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
      </div>

      <Select
        value={value}
        onValueChange={(val) => {
          setValue(val);
          if (!submitFunction) return;
          const valid = TsplEducationFieldFormElement.validate(element, val);
          setError(!valid);
          submitFunction(element.id, val);
        }}
      >
        <SelectTrigger
          className={cn(
            'w-full transition-colors',
            error && 'border-red-500 focus:ring-red-500/20',
            value && 'border-emerald-500/80'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {optList.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
