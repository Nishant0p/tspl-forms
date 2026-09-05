'use client';

import { useState, useTransition } from 'react';
import {
  createAdminUser,
  updateAdminRoleAndStatus,
  updateAdminPassword,
  deleteAdminUser,
  getAdminReportCard,
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
  BarChart3,
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
  EDITOR: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  EMPLOYEE: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800',
};

import AssignFormAccessDialog from '@/components/AssignFormAccessDialog';
import { FileText } from 'lucide-react';

export default function AdminManagementTable({ initialAdmins, departments = [], branches = [] }: Props) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
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

  // Report Card state
  const [reportAdmin, setReportAdmin] = useState<AdminUser | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleOpenReportCard = async (admin: AdminUser) => {
    setReportAdmin(admin);
    setReportData(null);
    setLoadingReport(true);
    try {
      const data = await getAdminReportCard(admin.id);
      setReportData(data);
    } catch (err: any) {
      toast({
        title: 'Error Loading Report Card',
        description: err.message || 'Failed to fetch admin report card',
        variant: 'destructive',
      });
    } finally {
      setLoadingReport(false);
    }
  };

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

    const matchesRole = roleFilter === 'ALL' || admin.role === roleFilter;

    return matchesSearch && matchesDept && matchesBranch && matchesRole;
  });

  const totalUsers = admins.length;
  const superAdminsCount = admins.filter((a) => a.role === 'SUPER_ADMIN').length;
  const branchAdminsCount = admins.filter((a) => a.role === 'ADMIN').length;
  const activeCount = admins.filter((a) => a.status === 'ACTIVE').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'ADMIN' && !formData.branchId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a Branch for the Branch Head (Admin).',
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
          title: 'User Created Successfully',
          description: `Created ${created.firstName} ${created.lastName} (${created.role} - ${created.employeeId})`,
        });
      } catch (err: any) {
        toast({
          title: 'Creation Failed',
          description: err.message || 'Failed to create user',
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
          title: 'User Deleted',
          description: `Deleted ${currentAdmin?.firstName || 'user'} from system`,
        });
      } catch (err: any) {
        toast({
          title: 'Deletion Failed',
          description: err.message || 'Failed to delete user',
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
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Organization Users</p>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Super Admins (Max 3)</p>
            <h3 className="text-2xl font-bold">{superAdminsCount} / 3</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Branch Admins (Heads)</p>
            <h3 className="text-2xl font-bold">{branchAdminsCount}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Accounts</p>
            <h3 className="text-2xl font-bold">{activeCount}</h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Role Dropdown, Department Dropdown, Branch Dropdown & Create */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, TSPL ID, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Role Filter Dropdown */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs font-semibold">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles ({admins.length})</SelectItem>
              <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="EDITOR">EDITOR</SelectItem>
              <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
              <SelectItem value="FORM_VIEWER">FORM_VIEWER</SelectItem>
            </SelectContent>
          </Select>

          {/* Department Filter Dropdown */}
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs font-semibold">
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
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs font-semibold">
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
            <Button className="flex items-center gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4" /> Create User / Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <UserPlus className="h-5 w-5 text-primary" /> Create User / Admin
              </DialogTitle>
              <DialogDescription>
                Add a new team member, branch admin, or administrator to the organization.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">First Name *</label>
                  <Input
                    required
                    placeholder="e.g. Yash"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Last Name *</label>
                  <Input
                    required
                    placeholder="e.g. Borse"
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
                  placeholder="name@tspl.in"
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
                    placeholder="Set password (min 6 characters)"
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
                  <label className="text-xs font-semibold">Employee ID * (Prefix: TSPL)</label>
                  <Input
                    required
                    placeholder="e.g. TSPL001"
                    value={formData.employeeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, employeeId: val });
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground">Auto-prefixed with TSPL if omitted</p>
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
                      <SelectItem value="SUPER_ADMIN">SUPER_ADMIN (Max 3)</SelectItem>
                      <SelectItem value="ADMIN">ADMIN (Branch Head - 1/Branch)</SelectItem>
                      <SelectItem value="EDITOR">EDITOR</SelectItem>
                      <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                      <SelectItem value="FORM_VIEWER">FORM_VIEWER</SelectItem>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Assign Branch {formData.role === 'ADMIN' ? '*' : '(Optional)'}
                  </label>
                  <Select
                    value={formData.branchId ? String(formData.branchId) : ''}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        branchId: val ? Number(val) : undefined,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Branch" />
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Assign Department (Optional)
                  </label>
                  <Select
                    value={formData.departmentId ? String(formData.departmentId) : ''}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        departmentId: val ? Number(val) : undefined,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          🏢 {d.name} ({d.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <Button type="submit" disabled={pending} className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create User
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
              <TableHead>User ID</TableHead>
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

                    {/* User ID */}
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

                    {/* Actions: Report Card, Assign Forms, Reset Password & Delete */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Report Card Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          title="View Admin Report Card"
                          onClick={() => handleOpenReportCard(admin)}
                          className="h-8 text-xs font-bold gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                        >
                          <BarChart3 className="h-3.5 w-3.5" /> Report Card
                        </Button>

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

      {/* Admin Performance Report Card Dialog */}
      <Dialog open={!!reportAdmin} onOpenChange={(open) => !open && setReportAdmin(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
              <BarChart3 className="h-6 w-6 text-primary" /> Admin Performance Report Card
            </DialogTitle>
            <DialogDescription>
              Overview stats, created forms, and team member directory for {reportAdmin?.firstName} {reportAdmin?.lastName}.
            </DialogDescription>
          </DialogHeader>

          {loadingReport ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Generating Report Card...</p>
            </div>
          ) : reportData ? (
            <div className="space-y-6 py-2">
              {/* Admin Profile Header Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-extrabold text-primary text-lg border border-primary/20">
                    {reportData.admin.firstName[0]}
                    {reportData.admin.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {reportData.admin.firstName} {reportData.admin.lastName}
                      {reportData.admin.role === 'SUPER_ADMIN' && (
                        <BadgeCheck className="h-4 w-4 text-purple-600" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ID: <code className="font-mono text-foreground font-semibold">{reportData.admin.employeeId}</code> • {reportData.admin.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={ROLE_COLORS[reportData.admin.role] || ''}>
                    {reportData.admin.role}
                  </Badge>
                  {reportData.admin.branch && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      🌿 {reportData.admin.branch.name}
                    </Badge>
                  )}
                  <Badge variant={reportData.admin.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {reportData.admin.status}
                  </Badge>
                </div>
              </div>

              {/* 3 Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 shadow-sm">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-purple-600" /> Forms Created
                  </span>
                  <span className="text-3xl font-black mt-2 text-foreground">
                    {reportData.stats.formsCreatedCount}
                  </span>
                </div>

                <div className="flex flex-col p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 shadow-sm">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-600" /> Total Responses
                  </span>
                  <span className="text-3xl font-black mt-2 text-foreground">
                    {reportData.stats.totalSubmissionsCount}
                  </span>
                </div>

                <div className="flex flex-col p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600" /> Team Members
                  </span>
                  <span className="text-3xl font-black mt-2 text-foreground">
                    {reportData.stats.teamMembersCount}
                  </span>
                </div>
              </div>

              {/* Team Members List Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Team Members Under Admin ({reportData.teamMembers.length})
                </h4>
                {reportData.teamMembers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed">
                    No team members assigned under this admin yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="text-xs">
                          <TableHead className="font-bold">Team Member</TableHead>
                          <TableHead className="font-bold">User ID</TableHead>
                          <TableHead className="font-bold">Role</TableHead>
                          <TableHead className="font-bold">Branch</TableHead>
                          <TableHead className="font-bold text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.teamMembers.map((member: any) => (
                          <TableRow key={member.id} className="text-xs hover:bg-muted/30">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">
                                  {member.firstName} {member.lastName}
                                </span>
                                <span className="text-[11px] text-muted-foreground">{member.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                {member.employeeId}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={ROLE_COLORS[member.role] || ''}>
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.branch ? (
                                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                  🌿 {member.branch.name}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic text-[11px]">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`text-[11px] font-bold ${
                                  member.status === 'ACTIVE'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {member.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Forms Created List Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Forms Created ({reportData.forms.length})
                </h4>
                {reportData.forms.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed">
                    No forms created by this admin yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="text-xs">
                          <TableHead className="font-bold">Form Name</TableHead>
                          <TableHead className="font-bold">Publish Status</TableHead>
                          <TableHead className="font-bold text-right">Visits</TableHead>
                          <TableHead className="font-bold text-right">Responses</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.forms.map((form: any) => (
                          <TableRow key={form.id} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-bold text-foreground">{form.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={form.published ? 'default' : 'secondary'}
                                className="text-[10px] font-bold"
                              >
                                {form.published ? 'PUBLISHED' : 'DRAFT'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{form.visits}</TableCell>
                            <TableCell className="text-right font-mono font-bold text-primary">
                              {form.submissions}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Assign Form Access Dialog */}
      <AssignFormAccessDialog
        user={assignFormsUser}
        open={!!assignFormsUser}
        onOpenChange={(o) => !o && setAssignFormsUser(null)}
      />
    </div>
  );
}
