'use client';

import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { CreateForm, GetActiveBranches } from '@/app/actions/form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { FormSchema, formSchema } from '@/schemas/form';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Loader, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TemplateKey = 'joining' | 'leave' | 'expense' | 'feedback' | 'exit';

const templateLibrary: Array<{
  key: TemplateKey;
  label: string;
  description: string;
  name: string;
  content: FormSchema['content'];
}> = [
  {
    key: 'joining',
    label: 'Joining Form',
    description: 'Collect employee onboarding details and document uploads.',
    name: 'Joining Form',
    content: JSON.stringify([
      { id: 'title-1', type: 'TitleField', extraAttributes: { title: 'New Joiner Information' } },
      { id: 'text-1', type: 'TextField', extraAttributes: { label: 'Employee Name', helperText: 'Enter the full name as per records.', required: true, placeholder: 'Full name' } },
      { id: 'text-2', type: 'TextField', extraAttributes: { label: 'Employee ID', helperText: 'If already assigned, add the employee code.', required: false, placeholder: 'Employee ID' } },
      { id: 'date-1', type: 'DateField', extraAttributes: { label: 'Joining Date', helperText: 'Planned or confirmed joining date.', required: true } },
    ]),
  },
  {
    key: 'leave',
    label: 'Leave Request',
    description: 'Capture leave dates, type, and backup approver details.',
    name: 'Leave Request Form',
    content: JSON.stringify([
      { id: 'title-2', type: 'TitleField', extraAttributes: { title: 'Leave Request' } },
      { id: 'text-3', type: 'TextField', extraAttributes: { label: 'Employee Name', helperText: 'Who is requesting leave?', required: true, placeholder: 'Employee name' } },
      { id: 'date-2', type: 'DateField', extraAttributes: { label: 'Start Date', helperText: 'Leave start date.', required: true } },
      { id: 'date-3', type: 'DateField', extraAttributes: { label: 'End Date', helperText: 'Leave end date.', required: true } },
      { id: 'select-1', type: 'SelectField', extraAttributes: { label: 'Leave Type', helperText: 'Choose the leave category.', required: true, placeholder: 'Select leave type', options: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home'] } },
    ]),
  },
  {
    key: 'expense',
    label: 'Expense Claim',
    description: 'Track amount, purpose, and approval information.',
    name: 'Expense Claim Form',
    content: JSON.stringify([
      { id: 'title-3', type: 'TitleField', extraAttributes: { title: 'Expense Claim' } },
      { id: 'text-4', type: 'TextField', extraAttributes: { label: 'Employee Name', helperText: 'Submitted by', required: true, placeholder: 'Employee name' } },
      { id: 'text-5', type: 'TextField', extraAttributes: { label: 'Expense Amount', helperText: 'Total amount claimed.', required: true, placeholder: 'Amount' } },
      { id: 'text-6', type: 'TextField', extraAttributes: { label: 'Purpose', helperText: 'Why was the expense incurred?', required: true, placeholder: 'Expense purpose' } },
    ]),
  },
  {
    key: 'feedback',
    label: 'Feedback',
    description: 'Gather employee or candidate feedback with a simple structure.',
    name: 'Feedback Form',
    content: JSON.stringify([
      { id: 'title-4', type: 'TitleField', extraAttributes: { title: 'Feedback Survey' } },
      { id: 'paragraph-1', type: 'ParagraphField', extraAttributes: { title: 'Share your thoughts to help us improve.' } },
      { id: 'text-7', type: 'TextField', extraAttributes: { label: 'Name', helperText: 'Optional if anonymous feedback is allowed.', required: false, placeholder: 'Your name' } },
      { id: 'text-8', type: 'TextField', extraAttributes: { label: 'Feedback Summary', helperText: 'Summarize your feedback in a few words.', required: true, placeholder: 'Feedback summary' } },
    ]),
  },
  {
    key: 'exit',
    label: 'Exit Form',
    description: 'Capture clearance, exit reason, and handover information.',
    name: 'Exit Clearance Form',
    content: JSON.stringify([
      { id: 'title-5', type: 'TitleField', extraAttributes: { title: 'Exit Clearance' } },
      { id: 'text-9', type: 'TextField', extraAttributes: { label: 'Employee Name', helperText: 'Employee leaving the organization.', required: true, placeholder: 'Employee name' } },
      { id: 'text-10', type: 'TextField', extraAttributes: { label: 'Reason for Exit', helperText: 'Brief reason for resignation or exit.', required: true, placeholder: 'Reason' } },
      { id: 'date-4', type: 'DateField', extraAttributes: { label: 'Last Working Day', helperText: 'Final date with the company.', required: true } },
    ]),
  },
];

export default function CreateFormBtn({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [creatingTemplate, setCreatingTemplate] = useState<TemplateKey | null>(null);
  const [branches, setBranches] = useState<Array<{ id: number; name: string; code: string }>>([]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      branchId: null,
    },
  });

  useEffect(() => {
    GetActiveBranches()
      .then((b) => setBranches(b))
      .catch((err) => console.error('Failed to fetch branches', err));
  }, []);

  async function onSubmit(values: FormSchema) {
    try {
      const formId = await CreateForm(values);

      toast({
        title: 'Success',
        description: 'Form created successfully',
      });

      router.push(`/builder/${formId}`);

      form.reset({
        name: '',
        description: '',
        branchId: null,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: "Couldn't create form",
        variant: 'destructive',
      });
    }
  }

  async function createFromTemplate(templateKey: TemplateKey) {
    const template = templateLibrary.find((item) => item.key === templateKey);

    if (!template) return;

    try {
      setCreatingTemplate(templateKey);

      const currentBranchId = form.getValues('branchId');

      const formId = await CreateForm({
        name: template.name,
        description: template.description,
        content: template.content,
        branchId: currentBranchId,
      });

      toast({
        title: 'Template created',
        description: `${template.label} is ready to edit.`,
      });

      router.push(`/builder/${formId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: "Couldn't create template form",
        variant: 'destructive',
      });
    } finally {
      setCreatingTemplate(null);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all text-sm px-3.5 py-2 rounded-md flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create TSPL Form</DialogTitle>
          <DialogDescription className="break-words">
            Start a new internal form for HR, recruitment, feedback, approvals, or operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick-start templates
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {templateLibrary.map((template) => (
              <Button
                key={template.key}
                type="button"
                variant="outline"
                onClick={() => createFromTemplate(template.key)}
                disabled={creatingTemplate !== null}
                className="h-auto w-full flex-col items-start justify-start gap-1 p-3 text-left whitespace-normal break-words hover:border-primary transition-all">
                <span className="flex items-center gap-2 font-semibold text-sm w-full">
                  {template.label}
                  {creatingTemplate === template.key && <Loader className="h-4 w-4 animate-spin shrink-0" />}
                </span>
                <span className="text-xs text-muted-foreground whitespace-normal break-words w-full">
                  {template.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Form input */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Form Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Example: Expense Approval Form"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{formState.errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Add the purpose, department, approval route, or audience for this form..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Target Branch Access Field */}
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="branchId" className="flex items-center gap-1.5 font-bold">
                    <GitBranch className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Target Branch Access (Restricted Visibility)
                  </FormLabel>
                  <Select
                    value={field.value ? String(field.value) : 'ALL'}
                    onValueChange={(val) => field.onChange(val === 'ALL' ? null : Number(val))}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-xs font-semibold">
                        <SelectValue placeholder="Select target branch access..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL" className="font-semibold">
                        🌐 All Branches (System-wide Access)
                      </SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          🌿 {b.name} ({b.code}) — Only this branch can view & submit
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    If selected, only members belonging to this specific branch can view, submit, or access form responses.
                  </p>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
            className="mt-2 w-full font-semibold text-zinc-50">
            {!form.formState.isSubmitting && <span>Create Form</span>}
            {form.formState.isSubmitting && (
              <div className="inline-flex items-center gap-2">
                <Loader className="w-5 animate-spin" />
                <span>Creating...</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
