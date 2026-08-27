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

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: string;
  status: string;
  departmentId?: number | null;
  branchId?: number | null;
  department?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
}

interface Props {
  initialDepartments: Department[];
  initialBranches: Branch[];
  allUsers?: UserItem[];
}

export default function DepartmentAndBranchManagement({ initialDepartments, initialBranches, allUsers = [] }: Props) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [pending, startTransition] = useTransition();

  // Dropdown selection states
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

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

        <CardContent className="space-y-4">
          {/* Concise Department Name List Badges */}
          <div className="space-y-1.5 border-b pb-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Department List ({departments.length})
            </Label>
            {departments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No departments created yet.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div
                  onClick={() => setSelectedDeptId('ALL')}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedDeptId === 'ALL'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>All Departments</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedDeptId === 'ALL' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {allUsers.length} emp
                  </span>
                </div>
                {departments.map((dept) => {
                  const count = allUsers.filter(u => String(u.departmentId || u.department?.id) === String(dept.id)).length;
                  const isSelected = selectedDeptId === String(dept.id);
                  return (
                    <div
                      key={dept.id}
                      onClick={() => setSelectedDeptId(String(dept.id))}
                      className={`cursor-pointer group relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{dept.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {dept.code} • {count} emp
                      </span>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="ml-1 text-destructive hover:opacity-80 p-0.5"
                            title="Delete Department"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Department Employees List */}
          <div className="rounded-lg border bg-card p-3 space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                Department Members ({selectedDeptId === 'ALL' ? allUsers.length : allUsers.filter(u => String(u.departmentId || u.department?.id) === selectedDeptId).length})
              </span>
              {selectedDeptId !== 'ALL' && (
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {departments.find(d => String(d.id) === selectedDeptId)?.name}
                </span>
              )}
            </p>

            {allUsers.filter(u => selectedDeptId === 'ALL' || String(u.departmentId || u.department?.id) === selectedDeptId).length === 0 ? (
              <p className="text-muted-foreground italic text-xs py-3 text-center">No employees assigned to this department yet.</p>
            ) : (
              <div className="divide-y max-h-48 overflow-y-auto pr-1">
                {allUsers
                  .filter(u => selectedDeptId === 'ALL' || String(u.departmentId || u.department?.id) === selectedDeptId)
                  .map((u) => (
                    <div key={u.id} className="py-2 flex items-center justify-between hover:bg-muted/40 px-1 rounded transition-colors">
                      <div>
                        <span className="font-bold text-foreground block">{u.firstName} {u.lastName}</span>
                        <span className="text-[11px] text-muted-foreground">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-semibold border-primary/30 text-primary">
                          {u.role}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">{u.employeeId}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
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
              View branch names and select a branch from the dropdown to list all branch sub-employees.
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
          <div className="space-y-1.5 border-b pb-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Branch List ({branches.length})
            </Label>
            {branches.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No branches created yet.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div
                  onClick={() => setSelectedBranchId('ALL')}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedBranchId === 'ALL'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>All Branches</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedBranchId === 'ALL' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {allUsers.length} emp
                  </span>
                </div>
                {branches.map((branch) => {
                  const count = allUsers.filter(u => String(u.branchId || u.branch?.id) === String(branch.id)).length;
                  const isSelected = selectedBranchId === String(branch.id);
                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranchId(String(branch.id))}
                      className={`cursor-pointer group relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-background hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>{branch.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
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

          {/* Selected Branch Employees List */}
          <div className="rounded-lg border bg-card p-3 space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Branch Members ({selectedBranchId === 'ALL' ? allUsers.length : allUsers.filter(u => String(u.branchId || u.branch?.id) === selectedBranchId).length})
              </span>
              {selectedBranchId !== 'ALL' && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {branches.find(b => String(b.id) === selectedBranchId)?.name}
                </span>
              )}
            </p>

            {allUsers.filter(u => selectedBranchId === 'ALL' || String(u.branchId || u.branch?.id) === selectedBranchId).length === 0 ? (
              <p className="text-muted-foreground italic text-xs py-3 text-center">No employees assigned to this branch yet.</p>
            ) : (
              <div className="divide-y max-h-48 overflow-y-auto pr-1">
                {allUsers
                  .filter(u => selectedBranchId === 'ALL' || String(u.branchId || u.branch?.id) === selectedBranchId)
                  .map((u) => (
                    <div key={u.id} className="py-2 flex items-center justify-between hover:bg-muted/40 px-1 rounded transition-colors">
                      <div>
                        <span className="font-bold text-foreground block">{u.firstName} {u.lastName}</span>
                        <span className="text-[11px] text-muted-foreground">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                          {u.role}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">{u.employeeId}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
