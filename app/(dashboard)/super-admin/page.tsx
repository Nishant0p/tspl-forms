import { requireSuperAdmin } from '@/lib/auth';
import { getAdminsList } from '@/app/actions/super-admin';
import AdminManagementTable from './_components/AdminManagementTable';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Super Admin Management | TSPL Forms',
  description: 'Manage admin users, assign roles, and grant permissions.',
};

export default async function SuperAdminPage() {
  // Gate check: verify Super Admin rights
  const currentAdmin = await requireSuperAdmin();
  const admins = await getAdminsList();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Title & Banner Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-4 w-4" /> Super Admin Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mt-1">
            Admin & User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as Super Admin <span className="font-semibold text-foreground">{currentAdmin.email}</span>. Create admins, assign roles (HR, Manager, etc.), and control active/inactive permissions.
          </p>
        </div>
      </div>

      {/* Main Admin Management Table & Actions */}
      <AdminManagementTable initialAdmins={admins as any} />
    </div>
  );
}
