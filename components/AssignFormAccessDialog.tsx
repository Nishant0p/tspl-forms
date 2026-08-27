'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { FileText, Loader2, ShieldCheck } from 'lucide-react';
import {
  getAvailableFormsForAssignment,
  getUserFormAssignments,
  updateUserFormAssignments,
} from '@/app/actions/admin-management';

interface AssignFormAccessDialogProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
    role: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormItem = {
  id: number;
  name: string;
  description: string;
  published: boolean;
  status: string;
};

export default function AssignFormAccessDialog({
  user,
  open,
  onOpenChange,
}: AssignFormAccessDialogProps) {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, startTransition] = useTransition();

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      Promise.all([
        getAvailableFormsForAssignment(),
        getUserFormAssignments(user.id),
      ])
        .then(([availableForms, assignedIds]) => {
          setForms(availableForms);
          setSelectedFormIds(assignedIds);
        })
        .catch((err) => {
          toast({
            title: 'Error loading form assignments',
            description: err?.message || 'Could not fetch forms.',
            variant: 'destructive',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [open, user]);

  const toggleForm = (formId: number) => {
    setSelectedFormIds((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    );
  };

  const handleSave = () => {
    if (!user) return;
    startTransition(async () => {
      try {
        await updateUserFormAssignments(user.id, selectedFormIds);
        toast({
          title: 'Form Access Updated',
          description: `Assigned ${selectedFormIds.length} form(s) to ${user.firstName} ${user.lastName}.`,
        });
        onOpenChange(false);
      } catch (err: any) {
        toast({
          title: 'Failed to update access',
          description: err?.message || 'An error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" /> Assign Form Visibility Access
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select which forms <strong>{user?.firstName} {user?.lastName}</strong> ({user?.role} - {user?.employeeId}) can view and fill out.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No forms created yet in the system.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-semibold px-1">
              <span>Available Forms ({forms.length})</span>
              <span className="text-primary">{selectedFormIds.length} Selected</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/20">
              {forms.map((f) => {
                const isChecked = selectedFormIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleForm(f.id)}
                    className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors text-xs ${
                      isChecked
                        ? 'bg-primary/10 border-primary/40 font-semibold'
                        : 'bg-card hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleForm(f.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-primary" /> {f.name}
                        </span>
                        {f.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {f.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={f.published ? 'default' : 'secondary'}
                      className="text-[10px] px-2 py-0"
                    >
                      {f.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full font-bold gap-2 mt-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Form Permissions ({selectedFormIds.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
