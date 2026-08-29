'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

const type: ElementsType = 'RatingField';
const extraAttributes = { label: 'Rating Field', helperText: 'Helper Text', required: false, maxRating: 5 };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().max(200), required: z.boolean().default(false), maxRating: z.number().min(3).max(10) });

export const RatingFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <Star className="h-8 w-8" />, label: 'Rating Field' },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => { const element = formElement as CustomInstance; if (!currentValue) return !element.extraAttributes.required; return Number(currentValue) >= 1; },
};

type CustomInstance = FormElementInstance & { extraAttributes: typeof extraAttributes };
type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();
  const form = useForm<propertiesType>({ resolver: zodResolver(propertiesSchema), defaultValues: element.extraAttributes });
  useEffect(() => { form.reset(element.extraAttributes); }, [element, form]);
  function applyChanges(data: propertiesType) { updateElement(element.id, { ...element, extraAttributes: { ...element.extraAttributes, label: data.label, helperText: data.helperText, maxRating: data.maxRating } }); }
  return <Form {...form}><form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4"><FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="helperText" render={({ field }) => (<FormItem><FormLabel>Helper Text</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="maxRating" render={({ field }) => (<FormItem><FormLabel>Max Rating {form.watch('maxRating')}</FormLabel><FormControl><Slider defaultValue={[field.value]} min={3} max={10} step={1} onValueChange={(values) => field.onChange(values[0])} /></FormControl><FormMessage /></FormItem>)} /></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="mr-2 text-foreground">{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}</div>{helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}</div>;
}

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);
  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  const { label, helperText, required, maxRating } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className="flex gap-2">{Array.from({ length: maxRating }).map((_, index) => { const ratingValue = String(index + 1); return <Button key={ratingValue} type="button" variant={Number(value) >= index + 1 ? 'default' : 'outline'} className="h-10 w-10 p-0" onClick={() => { setValue(ratingValue); if (!submitFunction) return; const valid = RatingFieldFormElement.validate(element, ratingValue); setError(!valid); submitFunction(element.id, ratingValue); }}><Star className="h-4 w-4" /></Button>; })}</div>{helperText && <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>{helperText}</p>}</div>;
}