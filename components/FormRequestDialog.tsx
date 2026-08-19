'use client';

import React, { useState, useTransition } from 'react';
import { createFormRequest } from '@/app/actions/formRequest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FORM_TYPES = [
  'HR Form',
  'Leave Request',
  'Feedback / Survey',
  'Operations',
  'Recruitment',
  'Finance',
  'Compliance',
  'Other',
];

const PRIORITIES = [
  { value: 'LOW',    label: '🟢 Low' },
  { value: 'NORMAL', label: '🔵 Normal' },
  { value: 'HIGH',   label: '🟠 High' },
  { value: 'URGENT', label: '🔴 Urgent' },
];

export default function FormRequestDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType]     = useState('');
  const [priority, setPriority]     = useState('NORMAL');

  const reset = () => {
    setTitle(''); setDescription(''); setFormType(''); setPriority('NORMAL');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formType) { toast({ title: 'Select a form type', variant: 'destructive' }); return; }
    startTransition(async () => {
      try {
        await createFormRequest({ title, description, formType, priority });
        toast({ title: 'Request submitted!', description: 'The editor team has been notified.' });
        setOpen(false);
        reset();
        onCreated?.();
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Form Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a New Form</DialogTitle>
          <DialogDescription>
            Describe the form you need. The editor team will build it for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="req-title">Form Title</Label>
            <Input
              id="req-title"
              placeholder="e.g. Monthly Leave Application"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Form Type</Label>
              <Select value={formType} onValueChange={setFormType} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-desc">Description</Label>
            <Textarea
              id="req-desc"
              placeholder="What fields do you need? Who fills this form? What is the purpose?"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              disabled={isPending}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
