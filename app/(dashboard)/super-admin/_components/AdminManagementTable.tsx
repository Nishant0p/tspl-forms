'use client';

import { useState, useTransition } from 'react';
import {
  createAdminUser,
  updateAdminRoleAndStatus,
  updateAdminPassword,
  deleteAdminUser,
  CreateAdminInput,
} from '@/app/actions/super-admin';
import { EmployeeRole, EmployeeStatus } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  ShieldAlert,
  UserPlus,
  Search,
  Trash2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  BadgeCheck,
} from 'lucide-react';

interface AdminUser {
  id: number;
  clerkUserId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: Date;
  department?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
}

interface Props {
  initialAdmins: AdminUser[];
  departments?: { id: number; name: string; code: string }[];
  branches?: { id: number; name: string; code: string }[];
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  ADMIN: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  HR: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800',
  MANAGER: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  EDITOR: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  EMPLOYEE: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800',
};

import AssignFormAccessDialog from '@/components/AssignFormAccessDialog';
import { FileText } from 'lucide-react';

export default function AdminManagementTable({ initialAdmins, departments = [], branches = [] }: Props) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  // Assign Forms state
  const [assignFormsUser, setAssignFormsUser] = useState<AdminUser | null>(null);

  // Reset password state
  const [resetAdmin, setResetAdmin] = useState<AdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateAdminInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    departmentId: undefined,
    branchId: undefined,
  });

  const filteredAdmins = admins.filter((admin) => {
    const q = search.toLowerCase();
    const matchesSearch =
      admin.firstName.toLowerCase().includes(q) ||
      admin.lastName.toLowerCase().includes(q) ||
      admin.email.toLowerCase().includes(q) ||
      admin.employeeId.toLowerCase().includes(q) ||
      admin.role.toLowerCase().includes(q);

    const adminDeptId = (admin as any).departmentId || admin.department?.id;
    const matchesDept = deptFilter === 'ALL' || String(adminDeptId) === deptFilter;

    const adminBranchId = (admin as any).branchId || admin.branch?.id;
    const matchesBranch = branchFilter === 'ALL' || String(adminBranchId) === branchFilter;

    return matchesSearch && matchesDept && matchesBranch;
  });

  const totalUsers = admins.length;
  const superAdminsCount = admins.filter((a) => a.role === 'SUPER_ADMIN').length;
  const activeCount = admins.filter((a) => a.status === 'ACTIVE').length;
  const inactiveCount = admins.filter((a) => a.status !== 'ACTIVE').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a Branch for the admin user.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const created = await createAdminUser(formData);
        setAdmins((prev) => [created as any, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          employeeId: '',
          role: 'ADMIN',
          status: 'ACTIVE',
          departmentId: undefined,
          branchId: undefined,
        });
        toast({
          title: 'Admin Created Successfully',
          description: `Created admin ${created.firstName} ${created.lastName} (${created.role})`,
        });
      } catch (err: any) {
        toast({
          title: 'Creation Failed',
          description: err.message || 'Failed to create admin user',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRoleChange = (adminId: number, newRole: EmployeeRole) => {
    const currentAdmin = admins.find((a) => a.id === adminId);
    if (!currentAdmin) return;

    startTransition(async () => {
      try {
        await updateAdminRoleAndStatus(adminId, newRole, currentAdmin.status);
        setAdmins((prev) =>
          prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a))
        );
        toast({
          title: 'Role Updated',
          description: `Updated ${currentAdmin.firstName}'s role to ${newRole}`,
        });
      } catch (err: any) {
        toast({
          title: 'Update Failed',
          description: err.message || 'Failed to update role',
          variant: 'destructive',
        });
      }
    });
  };

  const handleStatusToggle = (adminId: number, currentStatus: EmployeeStatus) => {
    const currentAdmin = admins.find((a) => a.id === adminId);
    if (!currentAdmin) return;

    const newStatus: EmployeeStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    startTransition(async () => {
      try {
        await updateAdminRoleAndStatus(adminId, currentAdmin.role, newStatus);
        setAdmins((prev) =>
          prev.map((a) => (a.id === adminId ? { ...a, status: newStatus } : a))
        );
        toast({
          title: 'Status Updated',
          description: `Set ${currentAdmin.firstName}'s status to ${newStatus}`,
        });
      } catch (err: any) {
        toast({
          title: 'Update Failed',
          description: err.message || 'Failed to update status',
          variant: 'destructive',
        });
      }
    });
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAdmin) return;

    startTransition(async () => {
      try {
        await updateAdminPassword(resetAdmin.id, newPasswordInput);
        toast({
          title: 'Password Updated',
          description: `Password for ${resetAdmin.firstName} updated successfully.`,
        });
        setResetAdmin(null);
        setNewPasswordInput('');
      } catch (err: any) {
        toast({
          title: 'Reset Failed',
          description: err.message || 'Failed to update password',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDelete = (adminId: number) => {
    const currentAdmin = admins.find((a) => a.id === adminId);
    startTransition(async () => {
      try {
        await deleteAdminUser(adminId);
        setAdmins((prev) => prev.filter((a) => a.id !== adminId));
        toast({
          title: 'Admin Deleted',
          description: `Deleted ${currentAdmin?.firstName || 'admin'} from system`,
        });
      } catch (err: any) {
        toast({
          title: 'Deletion Failed',
          description: err.message || 'Failed to delete admin',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total System Users</p>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Super Admins</p>
            <h3 className="text-2xl font-bold">{superAdminsCount}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Admins</p>
            <h3 className="text-2xl font-bold">{activeCount}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Inactive / Suspended</p>
            <h3 className="text-2xl font-bold">{inactiveCount}</h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Department Dropdown, Branch Dropdown & Create */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          <div className="relative flex-1 w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Department Filter Dropdown */}
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs font-semibold">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  🏢 {d.name} ({d.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch Filter Dropdown */}
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs font-semibold">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  🌿 {b.name} ({b.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 font-bold">
              <UserPlus className="h-4 w-4" /> Create New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <UserPlus className="h-5 w-5 text-primary" /> Create New Admin / User
              </DialogTitle>
              <DialogDescription>
                Add a new administrative or staff member to the platform directly.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">First Name *</label>
                  <Input
                    required
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Last Name *</label>
                  <Input
                    required
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="admin@tsplgroup.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Login Password *</label>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Set account password (min 6 chars)"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Employee ID *</label>
                  <Input
                    required
                    placeholder="e.g. EMP101"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Phone Number (Optional)</label>
                  <Input
                    placeholder="+91 9876543210"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Assigned Role *</label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val as EmployeeRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="MANAGER">MANAGER</SelectItem>
                      <SelectItem value="EDITOR">EDITOR</SelectItem>
                      <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Account Status *</label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val as EmployeeStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branch Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Assign Branch *</label>
                <Select
                  value={formData.branchId ? String(formData.branchId) : ''}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      branchId: val ? Number(val) : undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Branch (Required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        🌿 {b.name} ({b.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="gap-2 font-bold">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Admin
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Users Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>User / Admin</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Branch & Dept</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Active Permission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No admins or staff members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => {
                const isSuperAdminRole = admin.role === 'SUPER_ADMIN';

                return (
                  <TableRow key={admin.id} className="hover:bg-muted/20">
                    {/* Name & Email */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {admin.firstName[0]}
                          {admin.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            {admin.firstName} {admin.lastName}
                            {isSuperAdminRole && (
                              <BadgeCheck className="h-4 w-4 text-purple-600 fill-purple-100 dark:fill-purple-950" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Employee ID */}
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono font-medium">
                        {admin.employeeId}
                      </code>
                    </TableCell>

                    {/* Branch & Dept */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {admin.branch ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            🌿 {admin.branch.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">No Branch</span>
                        )}
                        {admin.department && (
                          <span className="text-muted-foreground text-[11px]">
                            🏢 {admin.department.name}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Role Dropdown */}
                    <TableCell>
                      <Select
                        value={admin.role}
                        onValueChange={(val) => handleRoleChange(admin.id, val as EmployeeRole)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                          <SelectValue>
                            <Badge variant="outline" className={ROLE_COLORS[admin.role] || ''}>
                              {admin.role}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="EDITOR">EDITOR</SelectItem>
                          <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Active / Inactive Status Switch */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={admin.status === 'ACTIVE'}
                          onCheckedChange={() => handleStatusToggle(admin.id, admin.status)}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            admin.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {admin.status}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions: Reset Password & Delete */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Assign Form Access Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Assign Form Access"
                          onClick={() => setAssignFormsUser(admin)}
                          className="h-8 w-8 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>

                        {/* Reset Password Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reset Admin Password"
                          onClick={() => {
                            setResetAdmin(admin);
                            setNewPasswordInput('');
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Admin"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-5 w-5" /> Delete Admin User?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete{' '}
                                <strong>
                                  {admin.firstName} {admin.lastName} ({admin.email})
                                </strong>{' '}
                                from the platform? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(admin.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Password Reset Modal */}
      {resetAdmin && (
        <Dialog open={!!resetAdmin} onOpenChange={(open) => !open && setResetAdmin(null)}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <KeyRound className="h-5 w-5 text-primary" /> Reset Password
              </DialogTitle>
              <DialogDescription>
                Set a new password for{' '}
                <strong className="text-foreground">
                  {resetAdmin.firstName} {resetAdmin.lastName} ({resetAdmin.email})
                </strong>
                .
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">New Password *</label>
                <div className="relative">
                  <Input
                    required
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 chars)"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setResetAdmin(null)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="gap-2 font-bold">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Form Access Dialog */}
      <AssignFormAccessDialog
        user={assignFormsUser}
        open={!!assignFormsUser}
        onOpenChange={(o) => !o && setAssignFormsUser(null)}
      />
    </div>
  );
}
