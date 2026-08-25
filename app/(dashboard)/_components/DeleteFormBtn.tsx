'use client';

import { DeleteForm } from '@/app/actions/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function DeleteFormBtn({
  formId,
  formName,
  trigger,
  iconOnly,
}: {
  formId: number;
  formName?: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
}) {
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    try {
      await DeleteForm(formId);
      toast({
        title: 'Success',
        description: 'Form deleted successfully.',
      });
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: "Couldn't delete form.",
        variant: 'destructive',
      });
    }
  }

  const defaultTrigger = iconOnly ? (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="destructive" className="flex items-center gap-2 text-sm font-semibold">
      <Trash2 className="h-4 w-4" />
      <span>Delete Form</span>
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete {formName ? `"${formName}"` : 'this form'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All submissions and data associated with this form will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              startTransition(() => {
                handleDelete();
              });
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
