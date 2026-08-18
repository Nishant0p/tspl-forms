'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { CircleDot, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const type: ElementsType = 'RadioField';
const extraAttributes = { label: 'Radio Field', helperText: 'Helper Text', required: false, placeholder: 'Placeholder', options: ['Option 1', 'Option 2'] };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().max(200), required: z.boolean().default(false), placeholder: z.string().max(50), options: z.array(z.string()).default([]) });

export const RadioFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <CircleDot className="h-8 w-8" />, label: 'Radio Field' },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => { const element = formElement as CustomInstance; return !element.extraAttributes.required || currentValue.length > 0; },
};

type CustomInstance = FormElementInstance & { extraAttributes: typeof extraAttributes };
type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();
  const form = useForm<propertiesType>({ resolver: zodResolver(propertiesSchema), defaultValues: element.extraAttributes });
  useEffect(() => { form.reset(element.extraAttributes); }, [element, form]);
  function applyChanges(data: propertiesType) { updateElement(element.id, { ...element, extraAttributes: data }); }
  return <Form {...form}><form onSubmit={form.handleSubmit(applyChanges)} className="space-y-4"><FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="placeholder" render={({ field }) => (<FormItem><FormLabel>Placeholder</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="helperText" render={({ field }) => (<FormItem><FormLabel>Helper Text</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} /><Separator /><FormField control={form.control} name="options" render={({ field }) => (<FormItem><div className='flex items-center justify-between'><FormLabel>Options</FormLabel><Button variant={'outline'} size={'sm'} onClick={(e) => { e.preventDefault(); form.setValue('options', field.value.concat(`Option ${field.value.length + 1}`)); }}><Plus className='mr-2 h-5 w-5' />Add</Button></div><div className='flex flex-col gap-2'>{form.watch('options').map((option, index) => (<div key={index} className='flex items-center gap-2'><Input value={option} onChange={(e) => { const next = [...field.value]; next[index] = e.target.value; field.onChange(next); }} /><Button variant={'ghost'} size={'icon'} onClick={(e) => { e.preventDefault(); const next = [...field.value]; next.splice(index, 1); field.onChange(next); }}><X className='h-4 w-4' /></Button></div>))}</div></FormItem>)} /><FormField control={form.control} name="required" render={({ field }) => (<FormItem><FormLabel>Required</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} /><Button type="submit" className="w-full text-zinc-50">Apply Changes</Button></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, options } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="mr-2 text-foreground">{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className="space-y-2">{options.slice(0, 3).map((option) => <div key={option} className='flex items-center gap-2 text-sm text-muted-foreground'><div className='h-4 w-4 rounded-full border' />{option}</div>)}</div>{helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}</div>;
}

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);
  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  const { label, helperText, required, options } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><RadioGroup value={value} onValueChange={(nextValue) => { setValue(nextValue); if (!submitFunction) return; const valid = RadioFieldFormElement.validate(element, nextValue); setError(!valid); submitFunction(element.id, nextValue); }} className="space-y-2">{options.map((option) => (<div key={option} className='flex items-center space-x-2'><RadioGroupItem value={option} id={`${element.id}-${option}`} /><Label htmlFor={`${element.id}-${option}`}>{option}</Label></div>))}</RadioGroup>{helperText && <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>{helperText}</p>}</div>;
}