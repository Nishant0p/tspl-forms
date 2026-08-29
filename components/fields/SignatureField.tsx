'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { PenTool, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

const type: ElementsType = 'SignatureField';
const extraAttributes = { label: 'Digital Signature', helperText: 'Helper Text', required: false };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().max(200), required: z.boolean().default(false) });

export const SignatureFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <PenTool className="h-8 w-8" />, label: 'Signature Field' },
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
  function applyChanges(data: propertiesType) { updateElement(element.id, { ...element, extraAttributes: { ...element.extraAttributes, label: data.label, helperText: data.helperText } }); }
  return <Form {...form}><form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4"><FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="helperText" render={({ field }) => (<FormItem><FormLabel>Helper Text</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} /></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required } = element.extraAttributes;
  return <div className="flex w-full flex-col gap-2"><Label className="mr-2 text-foreground">{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Draw or type a signature</div>{helperText && <p className="text-[.8rem] text-muted-foreground">{helperText}</p>}</div>;
}

function signatureToDataUrl(canvas: HTMLCanvasElement | null) { return canvas ? canvas.toDataURL('image/png') : ''; }

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [preview, setPreview] = useState(defaultValues || '');

  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  useEffect(() => {
    if (!defaultValues || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = defaultValues;
  }, [defaultValues]);

  const { label, helperText, required } = element.extraAttributes;

  function pointerPosition(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = pointerPosition(event);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!drawingRef.current || !canvas || !ctx) return;
    const { x, y } = pointerPosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    drawingRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    const dataUrl = signatureToDataUrl(canvas);
    setPreview(dataUrl);
    if (!submitFunction) return;
    const valid = SignatureFieldFormElement.validate(element, dataUrl);
    setError(!valid);
    submitFunction(element.id, dataUrl);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPreview('');
  }

  return <div className="flex w-full flex-col gap-2"><Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>{label}{required && <span className="ml-2 text-red-500">*</span>}</Label><div className={cn('rounded-lg border bg-background p-3', error && 'border-rose-500')}><canvas ref={canvasRef} width={640} height={180} className="h-40 w-full touch-none rounded-md border bg-white" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} /><div className="mt-3 flex items-center justify-between"><p className="text-xs text-muted-foreground">Sign inside the box above.</p><Button type="button" variant="outline" size="sm" onClick={clearCanvas}><RotateCcw className="mr-2 h-4 w-4" />Clear</Button></div></div>{preview && <img alt="Signature preview" src={preview} className="max-h-28 rounded-md border" />}{helperText && <p className={cn('text-[.8rem] text-muted-foreground', error && 'text-rose-500')}>{helperText}</p>}</div>;
}