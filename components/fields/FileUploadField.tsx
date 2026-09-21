'use client';

import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { Upload, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

import FileViewerModal from '../FileViewerModal';
import { toast } from '../ui/use-toast';

const type: ElementsType = 'FileUploadField';
const extraAttributes = {
  label: 'File Upload',
  helperText: '',
  required: false,
  accept: '*',
  maxFileSizeMB: 50,
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().optional(),
  required: z.boolean().default(false),
  accept: z.string().max(100),
  maxFileSizeMB: z.coerce.number().min(1).max(100).default(50),
});

export const FileUploadFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: <Upload className="h-8 w-8" />, label: 'File Upload' },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    return !element.extraAttributes.required || currentValue.length > 0;
  },
};

type CustomInstance = FormElementInstance & { extraAttributes: typeof extraAttributes };
type propertiesType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesginerStore();
  const form = useForm<propertiesType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      accept: element.extraAttributes.accept,
      maxFileSizeMB: element.extraAttributes.maxFileSizeMB ?? 50,
    },
  });

  useEffect(() => {
    form.reset({
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      accept: element.extraAttributes.accept,
      maxFileSizeMB: element.extraAttributes.maxFileSizeMB ?? 50,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        label: data.label,
        helperText: data.helperText,
        accept: data.accept,
        maxFileSizeMB: data.maxFileSizeMB,
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
                <Input {...field} />
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
                <Input {...field} placeholder="e.g. Upload your PDF document or ID proof" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accepted File Types</FormLabel>
              <FormControl>
                <Input {...field} placeholder="application/pdf, image/*, *" />
              </FormControl>
              <FormDescription className="text-xs">
                Enter MIME types or extensions (e.g. application/pdf, .pdf, image/*)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxFileSizeMB"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Upload Limit (MB)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Allowed file size up to 100 MB (Default: 50 MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, helperText, required, accept, maxFileSizeMB = 50 } = element.extraAttributes;
  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="mr-2 text-foreground font-semibold text-sm">
        {label}
        {required && <span className="ml-2 text-red-500 font-bold">*</span>}
      </Label>
      <div className="rounded-md border border-dashed p-3.5 text-xs text-muted-foreground flex flex-col gap-1 bg-muted/20">
        <div>Accepts: <span className="font-mono text-foreground font-medium">{accept}</span></div>
        <div>Max upload limit: <span className="font-semibold text-foreground">{maxFileSizeMB} MB</span> (PDF / Documents supported)</div>
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
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
  const [fileUrl, setFileUrl] = useState(() => {
    if (!defaultValues) return '';
    try {
      return JSON.parse(defaultValues).dataUrl || '';
    } catch {
      return defaultValues;
    }
  });
  const [fileName, setFileName] = useState(() => {
    if (!defaultValues) return '';
    try {
      return JSON.parse(defaultValues).name || 'Uploaded File';
    } catch {
      return 'Uploaded File';
    }
  });

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const {
    label,
    helperText,
    required,
    accept,
    maxFileSizeMB = 50,
  } = element.extraAttributes;

  const maxBytes = (maxFileSizeMB || 50) * 1024 * 1024;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn('mr-2 text-foreground font-medium', error && 'text-red-500')}>
        {label}
        {required && <span className="ml-2 text-red-500 font-bold">*</span>}
      </Label>
      <Input
        type="file"
        accept={accept === '*' ? undefined : accept}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (file.size > maxBytes) {
            toast({
              title: 'File too large',
              description: `Maximum file size allowed is ${maxFileSizeMB} MB. Please upload a smaller file.`,
              variant: 'destructive',
            });
            e.target.value = '';
            return;
          }

          try {
            const dataUrl = await readFileAsDataUrl(file);
            const payload = toFilePayload(file, dataUrl);
            setValue(payload);
            setFileName(file.name);
            setFileUrl(dataUrl);
            if (!submitFunction) return;
            const valid = FileUploadFieldFormElement.validate(element, payload);
            setError(!valid);
            submitFunction(element.id, payload);
          } catch {
            setError(true);
          }
        }}
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {helperText || `Supported formats: ${accept === '*' ? 'PDF, Documents, Images' : accept}`}
        </span>
        <span className="font-medium text-foreground/80">Max: {maxFileSizeMB} MB</span>
      </div>
      {fileName && fileUrl && (
        <div className="flex items-center justify-between rounded-md border border-border p-2 bg-muted/40">
          <div className="flex items-center gap-2 truncate mr-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium truncate">{fileName}</span>
          </div>
          <FileViewerModal fileUrl={fileUrl} fileName={fileName} />
        </div>
      )}
    </div>
  );
}