'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

const type: ElementsType = 'ImageField';
const extraAttributes = { label: 'Image Field', helperText: '', required: false };
const propertiesSchema = z.object({ label: z.string().min(2).max(50), helperText: z.string().optional(), required: z.boolean().default(false) });

export const ImageFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <ImageIcon className="h-8 w-8" />, label: 'Image Field' },
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
  return <Form {...form}><form onBlur={form.handleSubmit(applyChanges)} onSubmit={(e) => e.preventDefault()} className="space-y-4"><FormField control={form.control} name="label" render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></form></Form>;
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required } = element.extraAttributes;
  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="mr-2 text-foreground font-semibold text-sm">
        {label}
        {required && <span className="ml-2 text-red-500 font-bold">*</span>}
      </Label>
      <div className="rounded-md border border-dashed p-3.5 text-xs text-muted-foreground flex flex-col gap-1 bg-muted/20">
        <div>Accepts: <span className="font-mono text-foreground font-medium">Images (PNG, JPG, WEBP)</span></div>
        <div>Max upload limit: <span className="font-semibold text-foreground">2 MB</span></div>
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

function toFilePayload(file: File, dataUrl: string) { return JSON.stringify({ name: file.name, type: file.type, size: file.size, dataUrl }); }
function readFileAsDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }); }

import FileViewerModal from '../FileViewerModal';
import CompressFileModal from '../CompressFileModal';
import { toast } from '../ui/use-toast';

function FormComponent({ elementInstance, submitFunction, isInvalid, defaultValues }: { elementInstance: FormElementInstance; submitFunction?: SubmitFunction; isInvalid?: boolean; defaultValues?: string; }) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValues || '');
  const [error, setError] = useState(false);
  const [showCompressModal, setShowCompressModal] = useState(false);
  const [rejectedFileSize, setRejectedFileSize] = useState<string>('');
  const [rejectedFileName, setRejectedFileName] = useState<string>('');
  const [preview, setPreview] = useState(() => {
    if (!defaultValues) return '';
    try { return JSON.parse(defaultValues).dataUrl || ''; } catch { return defaultValues; }
  });
  useEffect(() => { setError(isInvalid === true); }, [isInvalid]);
  const { label, helperText, required } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn('mr-2 text-foreground', error && 'text-red-500')}>
        {label}{required && <span className="ml-2 text-red-500">*</span>}
      </Label>
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (file.size > 2 * 1024 * 1024) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            setRejectedFileSize(sizeMB);
            setRejectedFileName(file.name);
            setShowCompressModal(true);
            toast({
              title: 'Image too large',
              description: `Selected image is ${sizeMB} MB. Maximum allowed is 2 MB. Please compress the image.`,
              variant: 'destructive',
            });
            e.target.value = '';
            return;
          }

          try {
            const dataUrl = await readFileAsDataUrl(file);
            const payload = toFilePayload(file, dataUrl);
            setValue(payload);
            setPreview(dataUrl);
            if (!submitFunction) return;
            const valid = ImageFieldFormElement.validate(element, payload);
            setError(!valid);
            submitFunction(element.id, payload);
          } catch {
            setError(true);
          }
        }}
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{helperText || 'Supported formats: PNG, JPG, JPEG, WEBP'}</span>
        <span className="font-medium text-foreground/80">Max: 2 MB</span>
      </div>
      {preview && (
        <div className="flex items-center gap-3 mt-1">
          <img src={preview} alt="Preview" className="max-h-24 rounded-md object-contain border border-border" />
          <FileViewerModal fileUrl={preview} fileName="Uploaded Image" fileType="image" />
        </div>
      )}
      <CompressFileModal
        open={showCompressModal}
        onOpenChange={setShowCompressModal}
        fileType="image"
        actualSizeMB={rejectedFileSize}
        fileName={rejectedFileName}
      />
    </div>
  );
}