'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  UserPlus,
  Users,
  Trash2,
  Eye,
  Edit,
  Shield,
  Search,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  getFormCollaborators,
  assignFormCollaborator,
  removeFormCollaborator,
  createAndAssignNewCollaborator,
  FormCollaboratorUser,
} from '@/app/actions/formViewer';

type FormCollaboratorsModalProps = {
  formId: number;
  formName: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
};

export default function FormCollaboratorsModal({
  formId,
  formName,
  trigger,
  iconOnly,
}: FormCollaboratorsModalProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [editors, setEditors] = useState<FormCollaboratorUser[]>([]);
  const [viewers, setViewers] = useState<FormCollaboratorUser[]>([]);
  const [allEmployees, setAllEmployees] = useState<FormCollaboratorUser[]>([]);
  const [fetching, setFetching] = useState(false);

  // Existing employee assignment
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedAccessType, setSelectedAccessType] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // New employee creation
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAccessType, setNewAccessType] = useState<'EDITOR' | 'VIEWER'>('VIEWER');

  const loadData = async () => {
    try {
      setFetching(true);
      const data = await getFormCollaborators(formId);
      setEditors(data.editors as any);
      setViewers(data.viewers as any);
      setAllEmployees(data.allEmployees as any);
    } catch (err: any) {
      console.error('Failed to load form collaborators', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, formId]);

  const handleAssignExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast({
        title: 'Select Employee',
        description: 'Please select an employee to grant access.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        await assignFormCollaborator(formId, Number(selectedEmployeeId), selectedAccessType);
        toast({
          title: 'Access Granted',
          description: `Granted ${selectedAccessType.toLowerCase()} access successfully.`,
        });
        setSelectedEmployeeId('');
        await loadData();
      } catch (err: any) {
        toast({
          title: 'Failed to assign access',
          description: err?.message || 'An error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newEmail || !newEmpId) {
      toast({
        title: 'Missing Fields',
        description: 'First Name, Last Name, Email, and Employee ID are required.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        await createAndAssignNewCollaborator({
          formId,
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          employeeId: newEmpId,
          password: newPassword,
          accessType: newAccessType,
        });

        toast({
          title: 'User Created & Access Granted',
          description: `Created ${newFirstName} ${newLastName} and granted ${newAccessType.toLowerCase()} access.`,
        });

        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewEmpId('');
        setNewPassword('');

        await loadData();
      } catch (err: any) {
        toast({
          title: 'Failed to create user',
          description: err?.message || 'An error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRemove = (employeeId: number) => {
    startTransition(async () => {
      try {
        await removeFormCollaborator(formId, employeeId);
        toast({
          title: 'Access Revoked',
          description: 'Removed access for this employee.',
        });
        await loadData();
      } catch (err: any) {
        toast({
          title: 'Failed to revoke access',
          description: err?.message || 'An error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  // Filter available employees (excluding those who already have access)
  const existingAccessIds = new Set([
    ...editors.map((e) => e.id),
    ...viewers.map((v) => v.id),
  ]);

  const availableEmployees = allEmployees
    .filter((emp) => !existingAccessIds.has(emp.id))
    .filter((emp) => {
      const q = employeeSearch.toLowerCase();
      return (
        emp.firstName.toLowerCase().includes(q) ||
        emp.lastName.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q)
      );
    });

  const defaultTrigger = iconOnly ? (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 border-blue-500/30 text-blue-600 hover:border-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
      title="Form Collaborators & Access"
    >
      <Users className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" className="gap-2 border-blue-500/30 text-blue-600 hover:border-blue-500 hover:bg-blue-500/10 dark:text-blue-400">
      <Users className="h-4 w-4" />
      <span>Access & Collaborators</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Manage Form Access: &ldquo;{formName}&rdquo;
          </DialogTitle>
          <DialogDescription>
            Grant any team member access as an <strong>Editor</strong> (edit questions and view submissions) or a <strong>Viewer</strong> (unlimited viewers, view submissions only).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="text-xs font-semibold">
              Select Teammate
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs font-semibold">
              Create New Member
            </TabsTrigger>
          </TabsList>

          {/* Select Existing Employee Tab */}
          <TabsContent value="existing" className="space-y-3 pt-2">
            <form onSubmit={handleAssignExisting} className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Search & Select Employee</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger className="flex-1 text-xs">
                      <SelectValue placeholder="Choose an organization employee..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableEmployees.length === 0 ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          {allEmployees.length === 0 ? 'Loading employees...' : 'No other employees available'}
                        </div>
                      ) : (
                        availableEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={String(emp.id)} className="text-xs">
                            {emp.firstName} {emp.lastName} ({emp.employeeId}) — {emp.role} {emp.branch ? `• ${emp.branch.name}` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedAccessType}
                    onValueChange={(val) => setSelectedAccessType(val as 'EDITOR' | 'VIEWER')}
                  >
                    <SelectTrigger className="w-[120px] text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER" className="text-xs">
                        👁️ Viewer
                      </SelectItem>
                      <SelectItem value="EDITOR" className="text-xs">
                        ✏️ Editor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {selectedAccessType === 'EDITOR'
                    ? 'Editors can modify form structure, settings, and view all submissions.'
                    : 'Viewers can only access and view form submissions & responses (unlimited viewers).'}
                </p>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={pending || !selectedEmployeeId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Granting Access...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Grant Form Access</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Create New Employee Tab */}
          <TabsContent value="new" className="space-y-3 pt-2">
            <form onSubmit={handleCreateNew} className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">First Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Vinay"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Last Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Sharma"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="vinay@tspl.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Employee ID * (Prefix: TSPL)</Label>
                  <Input
                    required
                    placeholder="e.g. TSPL101"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Grant Access As *</Label>
                  <Select
                    value={newAccessType}
                    onValueChange={(val) => setNewAccessType(val as 'EDITOR' | 'VIEWER')}
                  >
                    <SelectTrigger className="h-8 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER" className="text-xs">
                        👁️ Viewer (Unlimited)
                      </SelectItem>
                      <SelectItem value="EDITOR" className="text-xs">
                        ✏️ Editor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Password (Optional, default: Tspl123456)
                </Label>
                <Input
                  type="password"
                  placeholder="Set login password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={pending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating & Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Member & Grant Access</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Current Collaborators List */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Active Collaborators ({editors.length + viewers.length})
            </h3>
            {fetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {editors.length === 0 && viewers.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No additional collaborators assigned to this form yet. Only the form creator and Super Admin have access.
            </div>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden">
              {/* Editors */}
              {editors.map((emp) => (
                <div
                  key={`editor-${emp.id}`}
                  className="flex items-center justify-between p-3 bg-card hover:bg-muted/10 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 text-[10px] px-1.5 py-0">
                          ✏️ Editor
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        {emp.email} • ID: <code className="font-mono">{emp.employeeId}</code>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    disabled={pending}
                    onClick={() => handleRemove(emp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ))}

              {/* Viewers */}
              {viewers.map((emp) => (
                <div
                  key={`viewer-${emp.id}`}
                  className="flex items-center justify-between p-3 bg-card hover:bg-muted/10 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 text-[10px] px-1.5 py-0">
                          👁️ Viewer
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        {emp.email} • ID: <code className="font-mono">{emp.employeeId}</code>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    disabled={pending}
                    onClick={() => handleRemove(emp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
