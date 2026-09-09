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
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Lock,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getFormCollaborators,
  assignFormCollaborator,
  removeFormCollaborator,
  FormCollaboratorUser,
} from '@/app/actions/formViewer';

type FormCollaboratorsModalProps = {
  formId: number;
  formName: string;
  shareUrl?: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
};

export default function FormCollaboratorsModal({
  formId,
  formName,
  shareUrl,
  trigger,
  iconOnly,
}: FormCollaboratorsModalProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [editors, setEditors] = useState<FormCollaboratorUser[]>([]);
  const [viewers, setViewers] = useState<FormCollaboratorUser[]>([]);
  const [allEmployees, setAllEmployees] = useState<FormCollaboratorUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [formShareUrl, setFormShareUrl] = useState<string>(shareUrl || '');
  const [copied, setCopied] = useState(false);

  // Existing employee assignment
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedAccessType, setSelectedAccessType] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const loadData = async () => {
    try {
      setFetching(true);
      const data = await getFormCollaborators(formId);
      setEditors(data.editors as any);
      setViewers(data.viewers as any);
      setAllEmployees(data.allEmployees as any);
      if (data.form?.shareUrl) {
        setFormShareUrl(data.form.shareUrl);
      }
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
        setEmployeeSearch('');
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

  const effectiveShareUrl = formShareUrl || shareUrl;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://forms.tsplgroup.in';
  const responseLink = effectiveShareUrl ? `${origin}/responses/${effectiveShareUrl}` : '';

  const handleCopyLink = () => {
    if (!responseLink) return;
    navigator.clipboard.writeText(responseLink);
    setCopied(true);
    toast({
      title: 'Responses Link Copied',
      description: 'Anyone with this link can view form responses only (no changes allowed).',
    });
    setTimeout(() => setCopied(false), 2500);
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
      if (selectedEmployeeId && String(emp.id) === selectedEmployeeId) {
        return true;
      }
      const q = employeeSearch.trim().toLowerCase();
      if (!q) return true;
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
      <DialogContent className="w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl font-bold">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Manage Form Access: &ldquo;{formName}&rdquo;</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Grant your team members access as an <strong>Editor</strong> (edit questions and view submissions) or a <strong>Viewer</strong> (unlimited viewers, view submissions only).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="text-xs font-semibold gap-1.5">
              <Users className="h-3.5 w-3.5" /> Select Teammate
            </TabsTrigger>
            <TabsTrigger value="responses-link" className="text-xs font-semibold gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" /> Share Responses Link
            </TabsTrigger>
          </TabsList>

          {/* Select Existing Employee Tab */}
          <TabsContent value="existing" className="space-y-3 pt-2">
            <form onSubmit={handleAssignExisting} className="space-y-3 rounded-lg border bg-muted/20 p-3.5 sm:p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Search & Select Employee</Label>
                  {allEmployees.length > 0 && (
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {availableEmployees.length} of {allEmployees.length} available
                    </span>
                  )}
                </div>

                {allEmployees.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search team member by name, ID, or email..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="h-8 pl-8 pr-8 text-xs bg-background"
                    />
                    {employeeSearch && (
                      <button
                        type="button"
                        onClick={() => setEmployeeSearch('')}
                        className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger className="flex-1 text-xs min-h-[38px]">
                      <SelectValue placeholder="Choose a team member..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableEmployees.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          {allEmployees.length === 0
                            ? 'No team members found created by this admin'
                            : employeeSearch
                            ? `No team members match "${employeeSearch}"`
                            : 'All team members already have access'}
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
                    <SelectTrigger className="w-full sm:w-[130px] text-xs font-semibold min-h-[38px]">
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

          {/* Share Responses Link Tab (View Only) */}
          <TabsContent value="responses-link" className="space-y-4 pt-2">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">View-Only Responses Link</h4>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-semibold gap-1">
                    <Lock className="h-2.5 w-2.5" /> Responses Only
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anyone with this link can view form responses, real-time submission statistics, and export records to Excel. They have <strong>no access</strong> to edit questions, modify settings, or delete anything.
                </p>
              </div>

              {/* Link Input & Action Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shareable Responses URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={responseLink || 'Generating link...'}
                    className="h-9 text-xs font-mono bg-background text-foreground select-all"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!responseLink}
                    className="h-9 px-3.5 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (responseLink) window.open(responseLink, '_blank');
                    }}
                    disabled={!responseLink}
                    className="h-9 px-3 text-xs shrink-0"
                    title="Open responses page in a new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Permissions Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-300">
                  <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> What Viewers CAN Do
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                    <li>View all submissions in real-time</li>
                    <li>Export responses to Excel (.xlsx)</li>
                    <li>Inspect submitted files & signatures</li>
                    <li>Search & filter response records</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1.5 text-xs text-red-900 dark:text-red-300">
                  <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400">
                    <Lock className="h-3.5 w-3.5" /> Strictly Protected (No Changes)
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                    <li>Cannot edit or add form questions</li>
                    <li>Cannot alter form access or settings</li>
                    <li>Cannot delete or archive the form</li>
                    <li>Cannot access admin dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
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
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      {emp.firstName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 text-[10px] px-1.5 py-0">
                          ✏️ Editor
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {emp.email} • ID: <code className="font-mono">{emp.employeeId}</code>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                  className="flex items-center justify-between p-3 bg-card hover:bg-muted/10 text-xs transition-colors gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                      {emp.firstName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 text-[10px] px-1.5 py-0">
                          👁️ Viewer
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {emp.email} • ID: <code className="font-mono">{emp.employeeId}</code>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
