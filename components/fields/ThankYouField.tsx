'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance
} from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartyPopper, CheckCircle2, ExternalLink, Upload, X, Image as ImageIcon } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';

const type: ElementsType = 'ThankYouField';

const extraAttributes = {
  title: 'Thank You!',
  message: 'Your response has been recorded successfully.',
  imageUrl: '',
  buttonText: 'Submit another response',
  buttonUrl: '',
  showRedirectButton: true,
};

const propertiesSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().max(1000),
  imageUrl: z.string().optional(),
  buttonText: z.string().max(100),
  buttonUrl: z.string().optional(),
  showRedirectButton: z.boolean(),
});

export const ThankYouFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: <PartyPopper className="h-8 w-8 text-emerald-500" />,
    label: 'Thank You Screen',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function FormComponent() {
  // Thank You screen element is rendered post-submission in FormSubmitComponent
  return null;
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { title, message, imageUrl, buttonText, buttonUrl, showRedirectButton } = element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        <PartyPopper className="h-4 w-4" />
        <span>Thank You Screen Element</span>
      </div>

      {imageUrl && (
        <div className="relative w-full max-h-48 overflow-hidden rounded-md border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Thank you banner" className="w-full max-h-48 object-cover rounded-md" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-lg font-bold text-foreground">{title || 'Thank You!'}</p>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>
      )}

      {showRedirectButton && (
        <div className="mt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary border border-primary/20">
            {buttonText || 'Submit another response'}
            {buttonUrl && <ExternalLink className="h-3 w-3" />}
          </span>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground italic border-t pt-2 border-border/50">
        Note: This screen will automatically display to respondents after they submit the form.
      </p>
    </div>
  );
}

type propertiesType = z.infer<typeof propertiesSchema>;

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
      title: element.extraAttributes.title || 'Thank You!',
      message: element.extraAttributes.message || '',
      imageUrl: element.extraAttributes.imageUrl || '',
      buttonText: element.extraAttributes.buttonText || 'Submit another response',
      buttonUrl: element.extraAttributes.buttonUrl || '',
      showRedirectButton: element.extraAttributes.showRedirectButton ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      title: element.extraAttributes.title || 'Thank You!',
      message: element.extraAttributes.message || '',
      imageUrl: element.extraAttributes.imageUrl || '',
      buttonText: element.extraAttributes.buttonText || 'Submit another response',
      buttonUrl: element.extraAttributes.buttonUrl || '',
      showRedirectButton: element.extraAttributes.showRedirectButton ?? true,
    });
  }, [element, form]);

  function applyChanges(data: propertiesType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...data,
      },
    });
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      form.setValue('imageUrl', dataUrl);
      const updated = {
        ...form.getValues(),
        imageUrl: dataUrl,
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
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thank You Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Thank You!"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Main heading displayed after submission.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thank You Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Your response has been recorded successfully..."
                />
              </FormControl>
              <FormDescription>
                Custom message or instructions for the respondent.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload Image Section */}
        <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
          <FormLabel className="font-semibold flex items-center gap-2 text-xs">
            <ImageIcon className="h-4 w-4 text-primary" /> Thank You Banner / Image
          </FormLabel>

          {form.watch('imageUrl') ? (
            <div className="relative overflow-hidden rounded-md border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.watch('imageUrl')}
                alt="Thank You Banner preview"
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
            <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 text-center hover:bg-muted/30 transition-all">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> image
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
                    placeholder="https://example.com/thankyou-banner.png"
                    onChange={(e) => {
                      field.onChange(e);
                      const url = e.target.value;
                      applyChanges({
                        ...form.getValues(),
                        imageUrl: url,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Submit another response / Visit Website"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Label for the post-submission action button.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Redirect URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://tsplgroup.in (Leave blank for response reset)"
                  onChange={(e) => {
                    field.onChange(e);
                    applyChanges({
                      ...form.getValues(),
                      buttonUrl: e.target.value,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter a website URL if you want the button to redirect respondents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showRedirectButton"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    form.handleSubmit(applyChanges)();
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Show Action Button</FormLabel>
                <FormDescription>
                  Display the action button on the Thank You screen.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
