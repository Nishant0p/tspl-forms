'use client';

import {
  ElementsType,
  FormElement,
  FormElementInstance
} from '@/app/(dashboard)/_components/FormElements';
import { useDesginerStore } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { PartyPopper, CheckCircle2, ExternalLink } from 'lucide-react';
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
  message: z.string().max(500),
  imageUrl: z.string().max(500),
  buttonText: z.string().max(50),
  buttonUrl: z.string().max(500),
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
        <div className="relative w-full max-h-40 overflow-hidden rounded-md border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Thank you banner" className="h-full w-full object-cover" />
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

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image / Banner URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/thankyou-banner.png"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Optional image or logo shown at the top of the thank you screen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
