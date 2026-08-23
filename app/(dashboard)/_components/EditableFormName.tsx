'use client';

import React, { useState, useTransition } from 'react';
import { UpdateFormName } from '@/app/actions/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Check, Edit2, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EditableFormNameProps {
  formId: number;
  initialName: string;
  className?: string;
  inputClassName?: string;
}

export default function EditableFormName({
  formId,
  initialName,
  className,
  inputClassName,
}: EditableFormNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: 'Validation Error',
        description: 'Form name cannot be empty.',
        variant: 'destructive',
      });
      setName(initialName);
      setIsEditing(false);
      return;
    }

    if (trimmed === initialName) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await UpdateFormName(formId, trimmed);
        toast({
          title: 'Success',
          description: 'Form name updated successfully.',
        });
        setIsEditing(false);
        router.refresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update form name.',
          variant: 'destructive',
        });
        setName(initialName);
        setIsEditing(false);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setName(initialName);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={loading}
          className={cn('h-9 max-w-xs sm:max-w-md font-semibold text-foreground', inputClassName)}
        />
        <Button
          size="icon"
          variant="ghost"
          disabled={loading}
          onClick={handleSave}
          className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={loading}
          onClick={() => {
            setName(initialName);
            setIsEditing(false);
          }}
          className="h-8 w-8 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="group inline-flex items-center gap-2 cursor-pointer rounded-md px-1.5 py-0.5 hover:bg-accent/60 transition-colors"
      title="Click to edit form name"
    >
      <span className={cn('truncate font-bold text-foreground', className)}>
        {name}
      </span>
      <Edit2 className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
    </div>
  );
}
