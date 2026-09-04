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
import { CreateForm } from '@/app/actions/form';
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
import { Loader, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateFormBtn({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      branchId: null,
    },
  });

  async function onSubmit(values: FormSchema) {
    try {
      const formId = await CreateForm(values);

      toast({
        title: 'Success',
        description: 'Form created successfully',
      });

      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all text-sm px-3.5 py-2 rounded-md flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Create a new form to start collecting responses and data.
          </DialogDescription>
        </DialogHeader>

        {/* Form input */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2">
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
                      placeholder="e.g. Employee Details Form"
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
                  <FormLabel htmlFor="description">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Provide context or instructions for this form..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="font-semibold text-zinc-50 bg-blue-600 hover:bg-blue-700">
                {!form.formState.isSubmitting && <span>Create Form</span>}
                {form.formState.isSubmitting && (
                  <div className="inline-flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

