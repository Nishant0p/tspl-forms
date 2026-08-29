'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

const type: ElementsType = 'TimeField';
const extraAttributes = { label: 'Time Field', helperText: 'Helper Text', required: false };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().max(200), required: z.boolean().default(false) });

export const TimeFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <Clock3 className="h-8 w-8" />, label: 'Time Field' },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    if (!currentValue) return !element.extraAttributes.required;
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(currentValue);
  },
};

type CustomInstance = FormElementInstance & { extraAttributes: typeof extraAttributes };
type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();
  const form = useForm<propertiesType>({ resolver: zodResolver(propertiesSchema), defaultValues: element.extraAttributes });
  useEffect(() => { form.reset(element.extraAttributes); }, [element, form]);
  function applyChanges(data: propertiesType) { updateElement(element.id, { ...element, extraAttributes: { ...element.extraAttributes, label: data.label, helperText: data.helperText } }); }
  return (
    <Form {...form}>
      <form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="helperText" render={({ field }) => (<FormItem><FormLabel>Helper Text</FormLabel><FormControl><Textarea {...field} rows={2} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} /></FormControl><FormMessage /></FormItem>)} />
      </form>
    </Form>
  );
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="mr-2 text-foreground">{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><Input readOnly disabled type="time" /><span className="text-sm text-muted-foreground">Pick a time</span>{helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}</div>;
}

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);
  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  const { label, helperText, required } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><Input type="time" value={value} onChange={(e) => setValue(e.target.value)} onBlur={(e) => { if (!submitFunction) return; const valid = TimeFieldFormElement.validate(element, e.target.value); setError(!valid); if (!valid) return; submitFunction(element.id, e.target.value); }} />{helperText && <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>{helperText}</p>}</div>;
}
