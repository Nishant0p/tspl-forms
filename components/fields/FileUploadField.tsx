'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

const type: ElementsType = 'FileUploadField';
const extraAttributes = { label: 'File Upload', helperText: 'Helper Text', required: false, accept: '*' };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().max(200), required: z.boolean().default(false), accept: z.string().max(100) });

export const FileUploadFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <Upload className="h-8 w-8" />, label: 'File Upload' },
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
  return <Form {...form}><form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4"><FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="accept" render={({ field }) => (<FormItem><FormLabel>Accepted File Types</FormLabel><FormControl><Input {...field} placeholder="*" /></FormControl><FormDescription>Example: image/*, application/pdf, *</FormDescription><FormMessage /></FormItem>)} /><FormField control={form.control} name="helperText" render={({ field }) => (<FormItem><FormLabel>Helper Text</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="required" render={({ field }) => (<FormItem><FormLabel>Required</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} /></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, accept } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="mr-2 text-foreground">{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Accepts: {accept}</div>{helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}</div>;
}

function toFilePayload(file: File, dataUrl: string) {
  return JSON.stringify({ name: file.name, type: file.type, size: file.size, dataUrl });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);
  const [fileName, setFileName] = useState('');
  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  const { label, helperText, required, accept } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><Input type="file" accept={accept === '*' ? undefined : accept} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const dataUrl = await readFileAsDataUrl(file); const payload = toFilePayload(file, dataUrl); setValue(payload); setFileName(file.name); if (!submitFunction) return; const valid = FileUploadFieldFormElement.validate(element, payload); setError(!valid); submitFunction(element.id, payload); } catch { setError(true); } }} />{fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}{helperText && <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>{helperText}</p>}</div>;
}