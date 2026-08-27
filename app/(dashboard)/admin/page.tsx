import React from 'react';
import { requireRole } from '@/lib/auth';
import { getAdminDashboardData } from '@/app/actions/admin-management';
import AddAdminManagedUserDialog from './_components/AddAdminManagedUserDialog';
import AdminManagedUsersTable from './_components/AdminManagedUsersTable';
import { ShieldCheck, Users, GitBranch, Building2, UserPlus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  await requireRole(['SUPER_ADMIN', 'ADMIN']);

  const { adminInfo, users, departments } = await getAdminDashboardData();

  const roleCounts = {
    HR: users.filter((u) => u.role === 'HR').length,
    MANAGER: users.filter((u) => u.role === 'MANAGER').length,
    EDITOR: users.filter((u) => u.role === 'EDITOR').length,
    EMPLOYEE: users.filter((u) => u.role === 'EMPLOYEE').length,
    FORM_VIEWER: users.filter((u) => u.role === 'FORM_VIEWER').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Admin Management Console</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, <strong className="text-foreground">{adminInfo.name}</strong> • Create and manage team members under your assigned branch.
                </p>
              </div>
            </div>

            {/* Admin Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="outline" className="font-bold border-primary text-primary px-3 py-1">
                Role: {adminInfo.role}
              </Badge>

              {adminInfo.branch ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 flex items-center gap-1.5 shadow-xs">
                  <GitBranch className="h-3.5 w-3.5" />
                  Branch: {adminInfo.branch.name} ({adminInfo.branch.code})
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-semibold px-3 py-1 flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" />
                  Branch: All / Unassigned
                </Badge>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <AddAdminManagedUserDialog departments={departments} adminBranch={adminInfo.branch} />
          </div>
        </div>
      </div>

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" /> Total Users
            </span>
            <div className="text-2xl font-black text-foreground">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">HR Users</span>
            <div className="text-2xl font-black text-primary">{roleCounts.HR}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Managers</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{roleCounts.MANAGER}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Editors</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{roleCounts.EDITOR}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Employees</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{roleCounts.EMPLOYEE}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Viewers</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{roleCounts.FORM_VIEWER}</div>
          </CardContent>
        </Card>
      </div>

      {/* Managed Users Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Branch Managed Users ({users.length})
          </h2>
        </div>

        <AdminManagedUsersTable users={users as any} />
      </div>
    </div>
  );
}
