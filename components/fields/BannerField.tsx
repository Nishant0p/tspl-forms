'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
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
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

const type: ElementsType = 'BannerField';

const extraAttributes = {
  imageUrl: '',
  title: '',
  subtitle: '',
  height: '200px',
  textAlign: 'center' as 'left' | 'center' | 'right',
  overlay: false,
  preset: 'custom',
};

const propertiesSchema = z.object({
  imageUrl: z.string().optional(),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(250).optional(),
  height: z.string().default('200px'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  overlay: z.boolean().default(false),
  preset: z.string().default('custom'),
});

export const BannerFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
    label: 'Banner',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type propertiesType = z.infer<typeof propertiesSchema>;

const PRESETS: Record<string, { name: string; bg: string }> = {
  'gradient-blue': {
    name: 'Ocean Blue',
    bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  },
  'gradient-purple': {
    name: 'Royal Purple',
    bg: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
  },
  'gradient-emerald': {
    name: 'Emerald Teal',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  'gradient-sunset': {
    name: 'Sunset Red',
    bg: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
  },
  'gradient-dark': {
    name: 'Midnight Dark',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
};

function BannerDisplay({ extraAttrs }: { extraAttrs: typeof extraAttributes }) {
  const { imageUrl, title, subtitle, height, textAlign, overlay, preset } = extraAttrs;

  const isPreset = preset && preset !== 'custom' && PRESETS[preset];
  const bgStyle = isPreset
    ? { backgroundImage: PRESETS[preset].bg }
    : { backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' };

  return (
    <div
      className="relative flex w-full flex-col justify-end overflow-hidden rounded-xl shadow-md transition-all border border-border/50"
      style={{
        ...bgStyle,
        height: height || '200px',
      }}
    >
      {/* Explicit img element for fail-safe data URL & Web image display */}
      {imageUrl && (!isPreset || preset === 'custom') && (
        <img
          src={imageUrl}
          alt={title || 'Form banner'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!imageUrl && !isPreset && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60 text-muted-foreground backdrop-blur-xs">
          <ImageIcon className="h-10 w-10 opacity-50" />
          <p className="text-sm font-medium">Click settings to upload custom banner image</p>
        </div>
      )}

      {overlay && (title || subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
      )}

      {(title || subtitle) && (
        <div
          className="relative z-20 p-6 text-white"
          style={{ textAlign: (textAlign as any) || 'center' }}
        >
          {title && <h2 className="text-2xl font-bold tracking-tight md:text-3xl drop-shadow-sm">{title}</h2>}
          {subtitle && (
            <p className="mt-1 text-sm text-white/90 md:text-base drop-shadow-sm">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold">
          <ImageIcon className="h-3.5 w-3.5" /> Form Banner
        </span>
        <span>Click to edit properties</span>
      </div>
      <BannerDisplay extraAttrs={element.extraAttributes} />
    </div>
  );
}

function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  return <BannerDisplay extraAttrs={element.extraAttributes} />;
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
      imageUrl: element.extraAttributes.imageUrl || '',
      title: element.extraAttributes.title || '',
      subtitle: element.extraAttributes.subtitle || '',
      height: element.extraAttributes.height || '200px',
      textAlign: (element.extraAttributes.textAlign as 'left' | 'center' | 'right') || 'center',
      overlay: element.extraAttributes.overlay ?? false,
      preset: element.extraAttributes.preset || 'custom',
    },
  });

  useEffect(() => {
    form.reset({
      ...element.extraAttributes,
      textAlign: (element.extraAttributes.textAlign as 'left' | 'center' | 'right') || 'center',
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: data,
    });
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      form.setValue('imageUrl', dataUrl);
      form.setValue('preset', 'custom');
      const updated = {
        ...form.getValues(),
        imageUrl: dataUrl,
        preset: 'custom',
      };
      applyChanges(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    form.setValue('imageUrl', '');
    const updated = {
      ...form.getValues(),
      imageUrl: '',
    };
    applyChanges(updated);
  };

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <ImageIcon className="h-4 w-4" /> Upload Custom Form Banner
        </div>

        {/* Upload Image Section */}
        <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
          <FormLabel className="font-semibold">Banner Image</FormLabel>

          {form.watch('imageUrl') ? (
            <div className="relative overflow-hidden rounded-md border border-border group">
              <img
                src={form.watch('imageUrl')}
                alt="Banner preview"
                className="h-28 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full shadow"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 text-center hover:bg-muted/30 transition-all">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> banner image
                <p className="text-[10px] opacity-75">PNG, JPG, WEBP, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Or Image Web URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/banner.jpg"
                    onChange={(e) => {
                      field.onChange(e);
                      const url = e.target.value;
                      if (url) {
                        form.setValue('preset', 'custom');
                      }
                      applyChanges({
                        ...form.getValues(),
                        imageUrl: url,
                        preset: url ? 'custom' : form.getValues('preset'),
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Preset background fallback */}
        <FormField
          control={form.control}
          name="preset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preset Gradient (Optional)</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.handleSubmit(applyChanges)();
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Custom Image / Preset Gradient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="custom">Custom Uploaded Image</SelectItem>
                  <SelectItem value="gradient-blue">Ocean Blue Gradient</SelectItem>
                  <SelectItem value="gradient-purple">Royal Purple Gradient</SelectItem>
                  <SelectItem value="gradient-emerald">Emerald Teal Gradient</SelectItem>
                  <SelectItem value="gradient-sunset">Sunset Red Gradient</SelectItem>
                  <SelectItem value="gradient-dark">Midnight Dark Gradient</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Height control */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Height</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.handleSubmit(applyChanges)();
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="140px">Compact (140px)</SelectItem>
                  <SelectItem value="200px">Medium (200px)</SelectItem>
                  <SelectItem value="260px">Large (260px)</SelectItem>
                  <SelectItem value="320px">Hero (320px)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Optional Title & Subtitle */}
        <div className="space-y-3 rounded-lg border border-border p-3">
          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Optional Overlay Text
          </FormLabel>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Title Text (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Leave empty for image only"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Subtitle Text (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="Leave empty for image only"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {(form.watch('title') || form.watch('subtitle')) && (
            <>
              <FormField
                control={form.control}
                name="textAlign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Text Alignment</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.handleSubmit(applyChanges)();
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overlay"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-2.5">
                    <div>
                      <FormLabel className="text-xs font-medium">Dark Gradient Overlay</FormLabel>
                      <FormDescription className="text-[10px]">
                        Improves text readability over bright images
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
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
