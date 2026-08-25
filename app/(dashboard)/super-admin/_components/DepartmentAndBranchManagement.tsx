'use client';

import React, { useState, useTransition } from 'react';
import {
  createDepartment,
  deleteDepartment,
  createBranch,
  deleteBranch,
} from '@/app/actions/super-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Building2, GitBranch, Plus, Trash2, Loader2, Users } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  active: boolean;
  _count?: { employees: number };
}

interface Branch {
  id: number;
  name: string;
  code: string;
  location: string;
  active: boolean;
  _count?: { employees: number };
}

interface Props {
  initialDepartments: Department[];
  initialBranches: Branch[];
}

export default function DepartmentAndBranchManagement({ initialDepartments, initialBranches }: Props) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [pending, startTransition] = useTransition();

  // Dialog open states
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  // Form states
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchLoc, setBranchLoc] = useState('');

  // Submit Department
  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await createDepartment({
          name: deptName,
          code: deptCode,
          description: deptDesc,
        });
        setDepartments((prev) => [...prev, created as any].sort((a, b) => a.name.localeCompare(b.name)));
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        setIsDeptOpen(false);
        toast({
          title: 'Department Created',
          description: `Successfully added ${created.name} (${created.code}). It is now available in user editable profiles!`,
        });
      } catch (err: any) {
        toast({
          title: 'Creation Failed',
          description: err.message || 'Failed to create department',
          variant: 'destructive',
        });
      }
    });
  };

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

  // Delete Department
  const handleDeleteDept = (id: number, name: string) => {
    startTransition(async () => {
      try {
        await deleteDepartment(id);
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        toast({
          title: 'Department Deleted',
          description: `Removed department ${name}`,
        });
      } catch (err: any) {
        toast({
          title: 'Deletion Failed',
          description: err.message || 'Failed to delete department',
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Section */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Departments
            </CardTitle>
            <CardDescription className="text-xs">
              Manage organization departments. Newly created departments appear immediately in user profiles.
            </CardDescription>
          </div>

          <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" /> Add Dept
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <Building2 className="h-5 w-5 text-primary" /> Add New Department
                </DialogTitle>
                <DialogDescription>
                  Enter details to add a new department to the company database.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateDepartment} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deptName" className="text-xs font-semibold">Department Name *</Label>
                  <Input
                    id="deptName"
                    required
                    placeholder="e.g. Information Technology"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deptCode" className="text-xs font-semibold">Department Code *</Label>
                  <Input
                    id="deptCode"
                    required
                    placeholder="e.g. IT"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deptDesc" className="text-xs font-semibold">Description (Optional)</Label>
                  <Input
                    id="deptDesc"
                    placeholder="Short description of department..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDeptOpen(false)} disabled={pending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending} className="gap-2 font-bold">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Department
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3">
          {departments.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No departments created yet. Click &quot;Add Dept&quot; to create one.
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{dept.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                        {dept.code}
                      </Badge>
                    </div>
                    {dept.description && (
                      <p className="text-xs text-muted-foreground">{dept.description}</p>
                    )}
                    {dept._count !== undefined && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {dept._count.employees} Employee{dept._count.employees === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete department <strong>{dept.name} ({dept.code})</strong>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDept(dept.id, dept.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Section */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" /> Branches
            </CardTitle>
            <CardDescription className="text-xs">
              Manage office branches. Newly created branches appear immediately in user profiles.
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

        <CardContent className="space-y-3">
          {branches.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No branches created yet. Click &quot;Add Branch&quot; to create one.
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{branch.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                        {branch.code}
                      </Badge>
                    </div>
                    {branch.location && (
                      <p className="text-xs text-muted-foreground">{branch.location}</p>
                    )}
                    {branch._count !== undefined && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {branch._count.employees} Employee{branch._count.employees === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
