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
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Users, Trash2, Eye, KeyRound } from 'lucide-react';
import { createFormViewerUser, getFormViewers, removeFormViewerAccess } from '@/app/actions/formViewer';

type FormViewerManagerProps = {
  formId: number;
  formName: string;
};

type ViewerUser = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export default function FormViewerManager({ formId, formName }: FormViewerManagerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewers, setViewers] = useState<ViewerUser[]>([]);
  const [fetchingViewers, setFetchingViewers] = useState(false);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadViewers = async () => {
    try {
      setFetchingViewers(true);
      const data = await getFormViewers(formId);
      setViewers(data as ViewerUser[]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingViewers(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadViewers();
    }
  }, [open, formId]);

  const handleCreateViewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !firstName || !lastName || !email || !password) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all fields to create a viewer user.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await createFormViewerUser({
        formId,
        employeeId,
        firstName,
        lastName,
        email,
        password,
      });

      toast({
        title: 'Form Viewer User Created',
        description: `Successfully created viewer account for ${firstName} ${lastName}.`,
      });

      // Reset form
      setEmployeeId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

      await loadViewers();
    } catch (error: any) {
      toast({
        title: 'Failed to create viewer user',
        description: error?.message || 'An error occurred while creating the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveViewer = async (empId: number) => {
    try {
      await removeFormViewerAccess(formId, empId);
      toast({
        title: 'Access Revoked',
        description: 'Removed viewer access for this form.',
      });
      await loadViewers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to remove viewer access.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary">
          <Users className="h-4 w-4 text-primary" />
          <span>Form Viewers</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Eye className="h-5 w-5 text-primary" />
            Manage Form Viewers for "{formName}"
          </DialogTitle>
          <DialogDescription>
            Create or assign users who will ONLY have access to view this form's submissions and analytics. They cannot see any other form or dashboard section.
          </DialogDescription>
        </DialogHeader>

        {/* Create Viewer User Form */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4 my-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Create & Assign New Viewer User
          </h3>

          <form onSubmit={handleCreateViewer} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="empId" className="text-xs">Employee / User ID</Label>
                <Input
                  id="empId"
                  placeholder="e.g. VIEW001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@tspl.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs flex items-center gap-1">
                <KeyRound className="h-3 w-3" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Set user password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <Button type="submit" size="sm" className="w-full gap-2 mt-2" disabled={loading}>
              {loading ? 'Creating...' : 'Create Viewer & Grant Access'}
            </Button>
          </form>
        </div>

        {/* List of Current Assigned Viewers */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-sm flex items-center justify-between">
            <span>Assigned Form Viewers ({viewers.length})</span>
          </h3>

          {fetchingViewers ? (
            <p className="text-xs text-muted-foreground">Loading viewers...</p>
          ) : viewers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-md">
              No specific viewer users created for this form yet.
            </p>
          ) : (
            <div className="divide-y border rounded-md overflow-hidden">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center justify-between p-3 bg-background text-xs">
                  <div>
                    <p className="font-bold text-foreground">{viewer.firstName} {viewer.lastName}</p>
                    <p className="text-muted-foreground">{viewer.email} • ID: {viewer.employeeId}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveViewer(viewer.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Revoke
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
