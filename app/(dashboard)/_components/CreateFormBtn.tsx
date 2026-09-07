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
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all text-sm px-4 py-2.5 min-h-[42px] rounded-lg flex items-center justify-center gap-2">
            <Plus className="h-4 w-4 shrink-0" />
            <span>Create Form</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[94vw] max-w-md rounded-xl p-4 sm:p-6 mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg sm:text-xl font-bold">Create New Form</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Create a new form to start collecting responses and data.
          </DialogDescription>
        </DialogHeader>

        {/* Form input */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-1 sm:py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel htmlFor="name" className="text-xs sm:text-sm font-semibold">Form Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Employee Details Form"
                      className="min-h-[40px] text-base sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs">{formState.errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel htmlFor="description" className="text-xs sm:text-sm font-semibold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Provide context or instructions for this form..."
                      className="text-base sm:text-sm resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto min-h-[42px]"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto min-h-[42px] font-semibold text-zinc-50 bg-blue-600 hover:bg-blue-700">
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

