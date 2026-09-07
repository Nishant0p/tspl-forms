'use client';

import React, { useState, useTransition } from 'react';
import {
  createBranch,
  deleteBranch,
} from '@/app/actions/super-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from '@/components/ui/use-toast';
import { GitBranch, Plus, Trash2, Loader2 } from 'lucide-react';

interface Branch {
  id: number;
  name: string;
  code: string;
  location: string;
  active: boolean;
  _count?: { employees: number };
}

interface Props {
  initialBranches: Branch[];
}

export default function DepartmentAndBranchManagement({ initialBranches }: Props) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [pending, startTransition] = useTransition();

  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchLoc, setBranchLoc] = useState('');

  // Submit Branch
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await createBranch({
          name: branchName,
          code: branchCode,
          location: branchLoc,
        });
        setBranches((prev) => [...prev, created as any].sort((a, b) => a.name.localeCompare(b.name)));
        setBranchName('');
        setBranchCode('');
        setBranchLoc('');
        setIsBranchOpen(false);
        toast({
          title: 'Branch Created',
          description: `Successfully added ${created.name} (${created.code}). It is now available in user editable profiles!`,
        });
      } catch (err: any) {
        toast({
          title: 'Creation Failed',
          description: err.message || 'Failed to create branch',
          variant: 'destructive',
        });
      }
    });
  };

  // Delete Branch
  const handleDeleteBranch = (id: number, name: string) => {
    startTransition(async () => {
      try {
        await deleteBranch(id);
        setBranches((prev) => prev.filter((b) => b.id !== id));
        toast({
          title: 'Branch Deleted',
          description: `Removed branch ${name}`,
        });
      } catch (err: any) {
        toast({
          title: 'Deletion Failed',
          description: err.message || 'Failed to delete branch',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Branch Section */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" /> Branches
            </CardTitle>
            <CardDescription className="text-xs">
              Manage organization office branch locations.
            </CardDescription>
          </div>

          <Dialog open={isBranchOpen} onOpenChange={setIsBranchOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" /> Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <GitBranch className="h-5 w-5 text-primary" /> Add New Branch
                </DialogTitle>
                <DialogDescription>
                  Enter details to add a new office branch location.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateBranch} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="branchName" className="text-xs font-semibold">Branch Name *</Label>
                  <Input
                    id="branchName"
                    required
                    placeholder="e.g. Headquarters - Delhi"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branchCode" className="text-xs font-semibold">Branch Code *</Label>
                  <Input
                    id="branchCode"
                    required
                    placeholder="e.g. DEL-HQ"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branchLoc" className="text-xs font-semibold">Location / Address (Optional)</Label>
                  <Input
                    id="branchLoc"
                    placeholder="e.g. New Delhi, India"
                    value={branchLoc}
                    onChange={(e) => setBranchLoc(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsBranchOpen(false)} disabled={pending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending} className="gap-2 font-bold">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Branch
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Concise Branch Name List Badges */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Branch List ({branches.length})
            </Label>
            {branches.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No branches created yet.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {branches.map((branch) => {
                  const count = branch._count?.employees ?? 0;
                  return (
                    <div
                      key={branch.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border bg-background text-foreground border-border px-3 py-1.5 text-xs font-bold"
                    >
                      <GitBranch className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{branch.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-muted text-muted-foreground">
                        {branch.code} • {count} emp
                      </span>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="ml-1 text-destructive hover:opacity-80 p-0.5"
                            title="Delete Branch"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete branch <strong>{branch.name} ({branch.code})</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBranch(branch.id, branch.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
