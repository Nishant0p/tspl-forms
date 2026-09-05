'use client';

import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Loader2, GitBranch, Shield, KeyRound, Building2 } from 'lucide-react';
import { createAdminManagedUser } from '@/app/actions/admin-management';

type DepartmentOption = {
  id: number;
  name: string;
  code: string;
};

type BranchOption = {
  id: number;
  name: string;
  code: string;
} | null;

interface AddAdminManagedUserDialogProps {
  departments: DepartmentOption[];
  adminBranch: BranchOption;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const ALLOWED_ROLES = [
  { value: 'EDITOR', label: 'EDITOR (Form Editor)', desc: 'Build and edit forms' },
  { value: 'EMPLOYEE', label: 'USER (Standard Staff)', desc: 'Fill out published forms' },
  { value: 'FORM_VIEWER', label: 'FORM_VIEWER (Submissions Viewer)', desc: 'Read-only access to assigned form responses' },
];

export default function AddAdminManagedUserDialog({
  departments,
  adminBranch,
  trigger,
  onSuccess,
}: AddAdminManagedUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState<string>('none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !employeeId || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await createAdminManagedUser({
        firstName,
        lastName,
        email,
        employeeId,
        password,
        phone: phone || undefined,
        role: role as any,
        departmentId: departmentId === 'none' ? null : Number(departmentId),
      });

      toast({
        title: 'User Created',
        description: `Successfully created ${role} user: ${firstName} ${lastName}. Branch automatically set to ${adminBranch?.name || 'Admin Branch'}.`,
      });

      setFirstName('');
      setLastName('');
      setEmail('');
      setEmployeeId('');
      setPassword('');
      setPhone('');
      setRole('EMPLOYEE');
      setDepartmentId('none');
      setOpen(false);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Failed to create user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 font-bold shadow-md">
            <UserPlus className="h-4 w-4" /> Add Team User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="h-5 w-5 text-primary" /> Create New Team User
          </DialogTitle>
          <DialogDescription>
            Add a new Editor, User, or Form Viewer under your branch control.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Automatic Branch Notification */}
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
            <GitBranch className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Automatic Branch Assignment: </span>
              <span>This user will be automatically assigned to your branch: </span>
              <strong className="text-primary font-bold">
                {adminBranch ? `${adminBranch.name} (${adminBranch.code})` : 'Default Main Branch'}
              </strong>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="admin-create-fn" className="text-xs">First Name *</Label>
              <Input
                id="admin-create-fn"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="admin-create-ln" className="text-xs">Last Name *</Label>
              <Input
                id="admin-create-ln"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
          </div>

          {/* User ID & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="admin-create-empid" className="text-xs">User ID *</Label>
              <Input
                id="admin-create-empid"
                placeholder="e.g. EMP102"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="admin-create-email" className="text-xs">Email Address *</Label>
              <Input
                id="admin-create-email"
                type="email"
                placeholder="user@tspl.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="admin-create-pass" className="text-xs flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-muted-foreground" /> Initial Password *
              </Label>
              <Input
                id="admin-create-pass"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="admin-create-phone" className="text-xs">Phone (Optional)</Label>
              <Input
                id="admin-create-phone"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-sm mt-1"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="admin-create-role" className="text-xs flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" /> Assign Role *
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="admin-create-role" className="h-9 text-sm mt-1">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className="font-semibold">{r.value}</span> - <span className="text-muted-foreground text-xs">{r.desc}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full gap-2 font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Create User & Assign Branch
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
