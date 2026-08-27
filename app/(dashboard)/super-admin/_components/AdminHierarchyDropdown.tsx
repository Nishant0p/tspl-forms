'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, ShieldCheck, GitBranch, Building2, ChevronDown, UserCheck, Search } from 'lucide-react';

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

type SubEmployee = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department?: Department;
  branch?: Branch;
};

type AdminUser = {
  id: number;
  clerkUserId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department?: Department;
  branch?: Branch;
  createdEmployees?: SubEmployee[];
};

interface AdminHierarchyDropdownProps {
  admins: AdminUser[];
  allUsers: SubEmployee[];
}

import AssignFormAccessDialog from '@/components/AssignFormAccessDialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function AdminHierarchyDropdown({ admins, allUsers }: AdminHierarchyDropdownProps) {
  // Filter only Admin and Super Admin users for the Admin Dropdown
  const adminOptions = admins.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');

  const [selectedAdminId, setSelectedAdminId] = useState<string>(
    adminOptions[0] ? String(adminOptions[0].id) : 'ALL'
  );
  const [subSearch, setSubSearch] = useState('');
  const [assignUser, setAssignUser] = useState<SubEmployee | null>(null);

  const activeAdmin = adminOptions.find((a) => String(a.id) === selectedAdminId) || null;

  // Sub-employees under selected admin: created directly by this admin OR belonging to admin's branch
  let subEmployees: SubEmployee[] = [];
  if (activeAdmin) {
    const directCreated = activeAdmin.createdEmployees || [];
    const branchEmployees = activeAdmin.branch
      ? allUsers.filter(
          (u) => u.branch?.id === activeAdmin.branch?.id && u.id !== activeAdmin.id
        )
      : [];

    // Deduplicate sub-employees
    const map = new Map<number, SubEmployee>();
    directCreated.forEach((e) => map.set(e.id, e));
    branchEmployees.forEach((e) => map.set(e.id, e));
    subEmployees = Array.from(map.values());
  } else {
    subEmployees = allUsers;
  }

  // Filter sub-employees search
  const filteredSub = subEmployees.filter((sub) => {
    const term = subSearch.toLowerCase();
    const name = `${sub.firstName} ${sub.lastName}`.toLowerCase();
    return name.includes(term) || sub.email.toLowerCase().includes(term) || sub.employeeId.toLowerCase().includes(term);
  });

  return (
    <Card className="border shadow-md bg-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-purple-500/5 pb-4 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Admin & Sub-Employees Hierarchy Dropdown
            </CardTitle>
            <CardDescription className="text-xs">
              Select an Admin from the dropdown to view their created team members and branch sub-employees.
            </CardDescription>
          </div>

          {/* Admin Selection Dropdown */}
          <div className="w-full sm:w-[320px]">
            <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
              <SelectTrigger className="h-10 text-sm font-bold bg-background border-primary/40 shadow-xs">
                <SelectValue placeholder="Select Admin Dropdown..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-semibold">
                  🌐 All System Users ({allUsers.length})
                </SelectItem>
                {adminOptions.map((admin) => {
                  const subCount = admin.createdEmployees?.length || 0;
                  const branchName = admin.branch ? admin.branch.name : 'No Branch';
                  return (
                    <SelectItem key={admin.id} value={String(admin.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">
                          {admin.firstName} {admin.lastName} ({admin.role})
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          [{branchName} • {subCount} sub]
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Selected Admin Details Bar */}
        {activeAdmin && (
          <div className="rounded-xl border border-primary/25 bg-muted/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-base shadow">
                {activeAdmin.firstName[0]}
                {activeAdmin.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  {activeAdmin.firstName} {activeAdmin.lastName}
                  <Badge variant="outline" className="text-xs font-semibold border-primary/50 text-primary">
                    {activeAdmin.role}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  ID: <strong className="font-mono text-foreground">{activeAdmin.employeeId}</strong> • {activeAdmin.email}
                </p>
              </div>
            </div>

            {/* Admin Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {activeAdmin.branch ? (
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
                  <GitBranch className="h-3 w-3" /> Branch: {activeAdmin.branch.name} ({activeAdmin.branch.code})
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs font-medium">
                  No Branch
                </Badge>
              )}

              {activeAdmin.department && (
                <Badge variant="outline" className="text-xs font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Dept: {activeAdmin.department.name}
                </Badge>
              )}

              <Badge variant="default" className="text-xs font-bold px-2.5 py-0.5">
                {subEmployees.length} Sub-Employee{subEmployees.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </div>
        )}

        {/* Sub-Employees Table Header & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Sub-Employees Under {activeAdmin ? `${activeAdmin.firstName} ${activeAdmin.lastName}` : 'All Admins'} ({filteredSub.length})
          </h4>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sub-employees..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Sub-Employees Dropdown Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="text-xs font-bold">Sub-Employee Name</TableHead>
                <TableHead className="text-xs font-bold">Employee ID & Email</TableHead>
                <TableHead className="text-xs font-bold">Assigned Role</TableHead>
                <TableHead className="text-xs font-bold">Department</TableHead>
                <TableHead className="text-xs font-bold">Branch</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSub.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                    No sub-employees created under this admin yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSub.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 text-xs">
                    {/* Name */}
                    <TableCell className="font-bold text-foreground">
                      {sub.firstName} {sub.lastName}
                    </TableCell>

                    {/* Employee ID & Email */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold">{sub.employeeId}</span>
                        <span className="text-[11px] text-muted-foreground">{sub.email}</span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-semibold border-primary/30 text-primary">
                        {sub.role}
                      </Badge>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      {sub.department ? (
                        <span className="font-medium text-foreground">
                          {sub.department.name} ({sub.department.code})
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Branch */}
                    <TableCell>
                      {sub.branch ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <GitBranch className="h-3 w-3" /> {sub.branch.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">No Branch</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 px-2"
                          onClick={() => setAssignUser(sub)}
                        >
                          <FileText className="h-3 w-3" /> Assign Forms
                        </Button>
                        <Badge
                          variant={sub.status === 'ACTIVE' ? 'default' : 'destructive'}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {sub.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Assign Form Access Modal */}
      <AssignFormAccessDialog
        user={assignUser}
        open={!!assignUser}
        onOpenChange={(o) => !o && setAssignUser(null)}
      />
    </Card>
  );
}
