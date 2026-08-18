'use client';

import { ElementsType, FormElement, FormElementInstance } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heading2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const type: ElementsType = 'SectionHeaderField';
const extraAttributes = { title: 'Section header', description: 'Use this to group related questions together.' };
const propertiesSchema = z.object({ title: z.string().min(2).max(80), description: z.string().max(200) });

export const SectionHeaderFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <Heading2 className="h-8 w-8" />, label: 'Section Header' },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

type CustomInstance = FormElementInstance & { extraAttributes: typeof extraAttributes };
type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();
  const form = useForm<propertiesType>({ resolver: zodResolver(propertiesSchema), defaultValues: element.extraAttributes });
  useEffect(() => { form.reset(element.extraAttributes); }, [element, form]);
  function applyChanges(data: propertiesType) { updateElement(element.id, { ...element, extraAttributes: data }); }
  return <Form {...form}><form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4"><FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} /></FormControl><FormDescription>Header text shown to users.</FormDescription><FormMessage /></FormItem>)} /><FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} /></FormControl><FormDescription>Supporting description text.</FormDescription><FormMessage /></FormItem>)} /></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { title, description } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="text-muted-foreground">Section Header</Label><p className="text-2xl font-semibold">{title}</p><p className="text-sm text-muted-foreground">{description}</p></div>;
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { title, description } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2 rounded-lg border border-dashed p-4"><p className="text-2xl font-semibold">{title}</p><p className="text-sm text-muted-foreground">{description}</p></div>;
}