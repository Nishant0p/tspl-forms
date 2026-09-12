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
  Users,
  User,
  Sparkles,
  ShieldCheck,
  Plus,
  X,
  RotateCcw,
  Check,
  CircleDot,
  LayoutGrid,
  ChevronDown,
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TsplGenderField';

export const defaultGenderOptions = [
  'Male',
  'Female',
  'Other',
];

const extraAttributes = {
  label: 'Gender',
  helperText: 'Please select your gender.',
  required: false,
  options: defaultGenderOptions,
  displayStyle: 'cards' as 'cards' | 'radio' | 'dropdown',
  allowOtherSpecification: true,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(60),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  displayStyle: z.enum(['cards', 'radio', 'dropdown']).default('cards'),
  allowOtherSpecification: z.boolean().default(true),
  options: z.array(z.string().min(1)).min(1).default(defaultGenderOptions),
});

export const TsplGenderFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <Users className="h-8 w-8 text-primary" />,
    label: 'Gender',
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

function getGenderOptionIcon(opt: string) {
  const lower = opt.toLowerCase();
  if (lower.includes('male') && !lower.includes('female')) {
    return <span className="font-bold text-sm text-sky-500">♂</span>;
  }
  if (lower.includes('female')) {
    return <span className="font-bold text-sm text-pink-500">♀</span>;
  }
  if (lower.includes('other') || lower.includes('non-binary') || lower.includes('trans')) {
    return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
  }
  if (lower.includes('prefer') || lower.includes('say') || lower.includes('decline')) {
    return <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />;
  }
  return <User className="h-3.5 w-3.5 text-muted-foreground" />;
}

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
      required: element.extraAttributes.required,
      displayStyle: element.extraAttributes.displayStyle || 'cards',
      allowOtherSpecification: element.extraAttributes.allowOtherSpecification ?? true,
      options: element.extraAttributes.options || defaultGenderOptions,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      displayStyle: element.extraAttributes.displayStyle || 'cards',
      allowOtherSpecification: element.extraAttributes.allowOtherSpecification ?? true,
      options: element.extraAttributes.options || defaultGenderOptions,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        required: data.required,
        displayStyle: data.displayStyle,
        allowOtherSpecification: data.allowOtherSpecification,
        options: data.options,
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
              <FormDescription>The title displayed for this question.</FormDescription>
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
              <FormDescription>Instructions or guidance shown below the field.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout & Presentation Style</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val: 'cards' | 'radio' | 'dropdown') => {
                  field.onChange(val);
                  form.handleSubmit(applyChanges)();
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cards">Interactive Cards (Recommended)</SelectItem>
                  <SelectItem value="radio">Radio Buttons List</SelectItem>
                  <SelectItem value="dropdown">Dropdown Select</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose how options are rendered to respondents.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowOtherSpecification"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold">Allow Custom Specification</FormLabel>
                <FormDescription className="text-xs">
                  Shows an input field when &quot;Other&quot; is selected.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
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
                <FormLabel className="text-sm font-semibold">Required</FormLabel>
                <FormDescription className="text-xs">
                  Respondents must answer this question to submit.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        {/* Options Management */}
        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <FormLabel className="font-semibold">Gender Options</FormLabel>
                  <FormDescription className="text-xs">
                    Customize or add custom gender identities.
                  </FormDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Reset to default options"
                    onClick={() => {
                      field.onChange(defaultGenderOptions);
                      form.handleSubmit(applyChanges)();
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      field.onChange(field.value.concat(`Option ${field.value.length + 1}`));
                      form.handleSubmit(applyChanges)();
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {field.value.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted/60 text-xs shrink-0">
                      {getGenderOptionIcon(option)}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const updated = [...field.value];
                        updated[index] = e.target.value;
                        field.onChange(updated);
                      }}
                      onBlur={() => form.handleSubmit(applyChanges)()}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                      disabled={field.value.length <= 1}
                      onClick={() => {
                        const updated = [...field.value];
                        updated.splice(index, 1);
                        field.onChange(updated);
                        form.handleSubmit(applyChanges)();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
  const {
    label,
    helperText,
    required,
    options = defaultGenderOptions,
    displayStyle = 'cards',
    allowOtherSpecification = true,
  } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase font-bold tracking-wider">
            TSPL Element
          </Badge>
          <span className="text-[10px] font-semibold text-muted-foreground capitalize">
            {displayStyle}
          </span>
        </div>
      </div>

      {displayStyle === 'cards' && (
        <div className={cn('grid gap-2', options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
          {options.slice(0, 4).map((option, idx) => (
            <div
              key={option}
              className={cn(
                'flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 p-2.5 shadow-xs transition-colors',
                idx === 0 && 'border-primary/50 bg-primary/5'
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                {getGenderOptionIcon(option)}
              </div>
              <span className="text-xs font-semibold text-foreground truncate">
                {option}
              </span>
            </div>
          ))}
        </div>
      )}

      {displayStyle === 'radio' && (
        <div className="space-y-1.5 pl-1">
          {options.slice(0, 3).map((option, idx) => (
            <div key={option} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={cn('h-4 w-4 rounded-full border border-primary flex items-center justify-center', idx === 0 && 'bg-primary')}>
                {idx === 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <span className="text-foreground">{option}</span>
            </div>
          ))}
          {options.length > 3 && (
            <span className="text-[11px] text-muted-foreground italic pl-6">
              +{options.length - 3} more options...
            </span>
          )}
        </div>
      )}

      {displayStyle === 'dropdown' && (
        <div className="h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Select gender...</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      )}

      {allowOtherSpecification && (
        <div className="rounded-md border border-dashed border-border/70 p-2 bg-muted/20 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span>Includes smart &quot;Other&quot; custom specification</span>
        </div>
      )}

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
  const {
    label,
    helperText,
    required,
    options = defaultGenderOptions,
    displayStyle = 'cards',
    allowOtherSpecification = true,
  } = element.extraAttributes;

  // Extract selected main option and optional custom specification
  const parseInitial = () => {
    if (!defaultValues) return { selected: '', customText: '' };
    if (defaultValues.startsWith('Other: ') || defaultValues.startsWith('Other (')) {
      const match = defaultValues.match(/^Other[:\s(]+([^)]+)\)?$/);
      return { selected: 'Other', customText: match ? match[1].trim() : '' };
    }
    return { selected: defaultValues, customText: '' };
  };

  const initial = parseInitial();
  const [selectedOption, setSelectedOption] = useState<string>(initial.selected);
  const [customText, setCustomText] = useState<string>(initial.customText);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const isOtherActive =
    allowOtherSpecification &&
    selectedOption.toLowerCase().includes('other');

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    const effectiveValue =
      option.toLowerCase().includes('other') && customText.trim()
        ? `Other: ${customText.trim()}`
        : option;

    if (submitFunction) {
      const valid = TsplGenderFieldFormElement.validate(element, effectiveValue);
      setError(!valid);
      submitFunction(element.id, effectiveValue);
    }
  };

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    const effectiveValue = text.trim() ? `Other: ${text.trim()}` : 'Other';

    if (submitFunction) {
      const valid = TsplGenderFieldFormElement.validate(element, effectiveValue);
      setError(!valid);
      submitFunction(element.id, effectiveValue);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'font-semibold text-foreground text-sm flex items-center gap-1.5',
            error && 'text-red-500'
          )}
        >
          <Users className={cn('h-4 w-4 text-primary', error && 'text-red-500')} />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </Label>
      </div>

      {/* Cards Layout */}
      {displayStyle === 'cards' && (
        <div className={cn('grid gap-2.5', options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
          {options.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                  'hover:border-primary/60 hover:bg-muted/40 active:scale-[0.98]',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/80 bg-card text-foreground',
                  error && !selectedOption && 'border-red-500/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  )}
                >
                  {getGenderOptionIcon(option)}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold leading-tight',
                    isSelected ? 'text-primary font-bold' : 'text-foreground'
                  )}
                >
                  {option}
                </span>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Radio List Layout */}
      {displayStyle === 'radio' && (
        <RadioGroup
          value={selectedOption}
          onValueChange={handleSelect}
          className="space-y-2 pt-1"
        >
          {options.map((option) => {
            const id = `${element.id}-${option}`;
            return (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  'flex items-center space-x-3 rounded-lg border border-border/70 p-2.5 cursor-pointer transition-colors',
                  selectedOption === option ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                )}
              >
                <RadioGroupItem value={option} id={id} />
                <Label htmlFor={id} className="cursor-pointer flex items-center gap-2 text-xs font-medium text-foreground">
                  {getGenderOptionIcon(option)}
                  <span>{option}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {/* Dropdown Select Layout */}
      {displayStyle === 'dropdown' && (
        <Select value={selectedOption} onValueChange={handleSelect}>
          <SelectTrigger className={cn('h-10 text-xs', error && !selectedOption && 'border-red-500')}>
            <SelectValue placeholder="Select your gender..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                <div className="flex items-center gap-2">
                  {getGenderOptionIcon(option)}
                  <span>{option}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Custom Specification Input when Other is selected */}
      {isOtherActive && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-1.5 animate-in fade-in-50 duration-200">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Please specify your gender identity (optional):</span>
          </Label>
          <Input
            placeholder="e.g. Non-binary, Agender, Two-spirit..."
            value={customText}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="h-8 text-xs bg-background"
          />
        </div>
      )}

      {helperText && (
        <p className={cn('text-xs text-muted-foreground', error && 'text-red-500')}>
          {helperText}
        </p>
      )}
    </div>
  );
}
