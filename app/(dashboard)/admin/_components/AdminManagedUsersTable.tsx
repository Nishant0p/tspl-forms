'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Search,
  Filter,
  Shield,
  KeyRound,
  Loader2,
  Building2,
  GitBranch,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  updateAdminManagedUserRoleAndStatus,
  updateAdminManagedUserPassword,
} from '@/app/actions/admin-management';

type Department = {
  id: number;
  name: string;
  code: string;
} | null;

type Branch = {
  id: number;
  name: string;
  code: string;
} | null;

type ManagedUser = {
  id: number;
  clerkUserId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: Date | string;
  department?: Department;
  branch?: Branch;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

interface AdminManagedUsersTableProps {
  users: ManagedUser[];
}

const ALLOWED_ROLES = ['EDITOR', 'EMPLOYEE', 'FORM_VIEWER'];

import AssignFormAccessDialog from '@/components/AssignFormAccessDialog';
import { FileText } from 'lucide-react';

export default function AdminManagedUsersTable({ users }: AdminManagedUsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Edit Role & Status Modal
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<string>('EMPLOYEE');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Password Reset Modal
  const [passUser, setPassUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Assign Forms Modal
  const [assignFormsUser, setAssignFormsUser] = useState<ManagedUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const empId = u.employeeId.toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term) || empId.includes(term);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenEditModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleSaveRoleStatus = async () => {
    if (!selectedUser) return;
    try {
      setUpdatingRole(true);
      await updateAdminManagedUserRoleAndStatus(selectedUser.id, editRole as any, editStatus as any);
      toast({
        title: 'User Updated',
        description: `Successfully updated ${selectedUser.firstName} ${selectedUser.lastName}.`,
      });
      setSelectedUser(null);
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.message || 'Failed to update user.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setUpdatingPass(true);
      await updateAdminManagedUserPassword(passUser.id, newPassword);
      toast({
        title: 'Password Updated',
        description: `Successfully updated password for ${passUser.firstName} ${passUser.lastName}.`,
      });
      setPassUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast({
        title: 'Reset Failed',
        description: err?.message || 'Failed to reset password.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3.5 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[160px] text-sm">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles ({users.length})</SelectItem>
              {ALLOWED_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">User Details</TableHead>
              <TableHead className="font-bold">Role & Status</TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Assigned Branch</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No managed users found matching your query.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const createdByName = u.createdBy
                  ? `${u.createdBy.firstName} ${u.createdBy.lastName}`
                  : null;

                return (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    {/* User Details */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: <strong className="font-mono text-foreground">{u.employeeId}</strong> • {u.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role & Status */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-semibold text-xs border-primary/40 text-primary">
                          {u.role}
                        </Badge>
                        <Badge
                          variant={u.status === 'ACTIVE' ? 'default' : 'destructive'}
                          className="text-[11px] px-2 py-0"
                        >
                          {u.status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="text-sm">
                      {u.department ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {u.department.name} ({u.department.code})
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Branch (Locked badge showing auto-branch assignment) */}
                    <TableCell className="text-sm">
                      {u.branch ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-bold border border-emerald-500/30">
                          <GitBranch className="h-3 w-3" />
                          {u.branch.name} ({u.branch.code})
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Branch</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                          onClick={() => setAssignFormsUser(u)}
                        >
                          <FileText className="h-3.5 w-3.5" /> Assign Forms
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleOpenEditModal(u)}
                        >
                          <Shield className="h-3.5 w-3.5 text-primary" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setPassUser(u);
                            setNewPassword('');
                          }}
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role & Status Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Edit User Role & Status
            </DialogTitle>
            <DialogDescription>
              Update permissions for {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.employeeId}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Lock Indicator */}
            <div className="rounded-md border bg-muted/40 p-2.5 text-xs flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5 text-primary" /> Branch Lock:
              </span>
              <span className="font-bold text-foreground">
                {selectedUser?.branch ? `${selectedUser.branch.name} (${selectedUser.branch.code})` : 'Branch Locked'} (Super Admin only can edit)
              </span>
            </div>

            <Button className="w-full font-bold mt-2" onClick={handleSaveRoleStatus} disabled={updatingRole}>
              {updatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={!!passUser} onOpenChange={(o) => !o && setPassUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Reset User Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {passUser?.firstName} {passUser?.lastName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">New Password</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 text-sm mt-1"
              />
            </div>

            <Button className="w-full font-bold" onClick={handleSavePassword} disabled={updatingPass}>
              {updatingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </div>
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
