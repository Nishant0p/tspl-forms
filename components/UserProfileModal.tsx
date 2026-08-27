'use client';

import React, { useState, useEffect } from 'react';
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
import { User, Camera, Building2, GitBranch, Shield, Save, Loader2 } from 'lucide-react';
import { updateMyProfile, getDepartmentsAndBranches } from '@/app/actions/employee';

type DepartmentItem = {
  id: number;
  name: string;
  code: string;
};

type BranchItem = {
  id: number;
  name: string;
  code: string;
};

type UserProfileModalProps = {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    imageUrl?: string | null;
    departmentId?: number | null;
    branchId?: number | null;
  };
  trigger?: React.ReactNode;
};

export default function UserProfileModal({ user, trigger }: UserProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [imageUrl, setImageUrl] = useState(user.imageUrl || '');
  const [departmentId, setDepartmentId] = useState<string>(user.departmentId ? String(user.departmentId) : 'none');
  const [branchId, setBranchId] = useState<string>(user.branchId ? String(user.branchId) : 'none');

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setImageUrl(user.imageUrl || '');
      setDepartmentId(user.departmentId ? String(user.departmentId) : 'none');
      setBranchId(user.branchId ? String(user.branchId) : 'none');

      const fetchData = async () => {
        try {
          setLoadingData(true);
          const data = await getDepartmentsAndBranches();
          setDepartments(data.departments);
          setBranches(data.branches);
        } catch (err) {
          console.error('Failed to load departments/branches', err);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 3MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateMyProfile({
        firstName,
        lastName,
        imageUrl,
        departmentId: departmentId === 'none' ? null : Number(departmentId),
        branchId: branchId === 'none' ? null : Number(branchId),
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile, department, and branch have been updated successfully.',
      });
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="h-5 w-5 text-primary" /> Edit My Profile
          </DialogTitle>
          <DialogDescription>
            Update your DP (Display Picture), department, and branch information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Display Picture Preview & Upload */}
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
            <div className="relative group flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold overflow-hidden border-2 border-primary shadow">
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile DP" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <label
                htmlFor="dp-upload"
                className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:scale-105 transition-transform"
                title="Upload Photo"
              >
                <Camera className="h-3 w-3" />
              </label>
              <input
                id="dp-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="imageUrl" className="text-xs">Or Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/my-photo.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Email & Role fields (Single line) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Unchangeable)</span>
              </Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                readOnly
                className="h-9 text-sm bg-muted/50 cursor-not-allowed text-muted-foreground mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Role
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">(Managed by Admin)</span>
              </Label>
              <div className="mt-1 flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm font-medium text-muted-foreground">
                {user.role || 'EMPLOYEE'}
              </div>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9 text-sm mt-1"
                required
              />
            </div>
          </div>

          {/* Department & Branch (Single line) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="department" className="text-xs flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Department
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={loadingData}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue placeholder={loadingData ? 'Loading...' : 'Select Department'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Department --</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="branch" className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5 text-primary" /> Branch
                </span>
                {user.role !== 'SUPER_ADMIN' && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Locked (Super Admin Only)</span>
                )}
              </Label>
              <Select value={branchId} onValueChange={setBranchId} disabled={loadingData || user.role !== 'SUPER_ADMIN'}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue placeholder={loadingData ? 'Loading...' : 'Select Branch'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Branch --</SelectItem>
                  {branches.map((br) => (
                    <SelectItem key={br.id} value={String(br.id)}>
                      {br.name} ({br.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full gap-2 font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Profile Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
