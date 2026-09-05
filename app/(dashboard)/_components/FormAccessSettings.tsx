'use client';

import { UpdateFormSettings } from '@/app/actions/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type AccessMode = 'PUBLIC' | 'AUTHENTICATED' | 'RESTRICTED';
type RoleValue = 'ADMIN' | 'EMPLOYEE';

type DepartmentOption = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

type BranchOption = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

type EmployeeOption = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleValue | 'SUPER_ADMIN';
  department?: { name: string | null } | null;
  branch?: { name: string | null } | null;
};

type FormAccessSettingsProps = {
  form: {
    id: number;
    accessMode?: AccessMode | null;
    loginRequired?: boolean | null;
    oneResponsePerUser?: boolean | null;
    startDate?: Date | null;
    endDate?: Date | null;
    responseLimit?: number | null;
    allowedRoles?: Array<{ role: RoleValue }>;
    allowedDepartments?: Array<{ departmentId: number }>;
    allowedBranches?: Array<{ branchId: number }>;
    allowedEmployees?: Array<{ employeeId: number }>;
  };
  departments: DepartmentOption[];
  branches: BranchOption[];
  employees: EmployeeOption[];
};

function toDateInputValue(value?: Date | null) {
  if (!value) return '';

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function FormAccessSettings({ form, departments, branches, employees, trigger }: FormAccessSettingsProps & { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, startTransition] = useTransition();

  const [accessMode, setAccessMode] = useState<AccessMode>(form.accessMode ?? 'PUBLIC');
  const [oneResponsePerUser, setOneResponsePerUser] = useState(Boolean(form.oneResponsePerUser));
  const [startDate, setStartDate] = useState(toDateInputValue(form.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(form.endDate));
  const [responseLimit, setResponseLimit] = useState(form.responseLimit?.toString() ?? '');
  const [selectedRoles, setSelectedRoles] = useState<RoleValue[]>(
    (form.allowedRoles ?? []).map((item) => item.role)
  );
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>(
    (form.allowedDepartments ?? []).map((item) => item.departmentId)
  );
  const [selectedBranches, setSelectedBranches] = useState<number[]>(
    (form.allowedBranches ?? []).map((item) => item.branchId)
  );
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>(
    (form.allowedEmployees ?? []).map((item) => item.employeeId)
  );

  const showingRestrictions = accessMode === 'RESTRICTED';
  const showingEmployeeControls = accessMode !== 'PUBLIC';

  useEffect(() => {
    setAccessMode(form.accessMode ?? 'PUBLIC');
    setOneResponsePerUser(Boolean(form.oneResponsePerUser));
    setStartDate(toDateInputValue(form.startDate));
    setEndDate(toDateInputValue(form.endDate));
    setResponseLimit(form.responseLimit?.toString() ?? '');
    setSelectedRoles((form.allowedRoles ?? []).map((item) => item.role));
    setSelectedDepartments((form.allowedDepartments ?? []).map((item) => item.departmentId));
    setSelectedBranches((form.allowedBranches ?? []).map((item) => item.branchId));
    setSelectedEmployees((form.allowedEmployees ?? []).map((item) => item.employeeId));
  }, [form]);

  const restrictedSummary = useMemo(() => {
    if (accessMode !== 'RESTRICTED') return 'Everyone with the link can submit.';

    const parts = [];
    if (selectedRoles.length > 0) parts.push(`${selectedRoles.length} role(s)`);
    if (selectedDepartments.length > 0) parts.push(`${selectedDepartments.length} department(s)`);
    if (selectedBranches.length > 0) parts.push(`${selectedBranches.length} branch(es)`);
    if (selectedEmployees.length > 0) parts.push(`${selectedEmployees.length} user(s)`);

    return parts.length > 0 ? parts.join(' • ') : 'No restrictions configured yet.';
  }, [accessMode, selectedBranches.length, selectedDepartments.length, selectedEmployees.length, selectedRoles.length]);

  async function saveSettings() {
    await UpdateFormSettings(form.id, {
      accessMode,
      loginRequired: accessMode === 'PUBLIC' ? false : true,
      oneResponsePerUser,
      startDate: startDate || null,
      endDate: endDate || null,
      responseLimit: responseLimit ? Number(responseLimit) : null,
      allowedRoles: selectedRoles,
      allowedDepartments: selectedDepartments,
      allowedBranches: selectedBranches,
      allowedEmployees: selectedEmployees,
    });
  }

  function toggleValue<T>(current: T[], next: T) {
    return current.includes(next) ? current.filter((item) => item !== next) : [...current, next];
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Who can respond?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form access settings</DialogTitle>
          <DialogDescription>
            Control who can open and submit this form without changing the builder content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessMode">Who can respond?</Label>
              <Select value={accessMode} onValueChange={(value) => setAccessMode(value as AccessMode)}>
                <SelectTrigger id="accessMode">
                  <SelectValue placeholder="Choose access mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Anyone</SelectItem>
                  <SelectItem value="AUTHENTICATED">Logged-in users</SelectItem>
                  <SelectItem value="RESTRICTED">Restricted users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showingEmployeeControls && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Require login</p>
                    <p className="text-xs text-muted-foreground">All authenticated and restricted forms require Clerk login.</p>
                  </div>
                  <Checkbox checked disabled />
                </div>
              </div>
            )}

            {showingEmployeeControls && (
              <div className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">One response per user</p>
                    <p className="text-xs text-muted-foreground">Prevents duplicate submissions for the same user.</p>
                  </div>
                  <Checkbox checked={oneResponsePerUser} onCheckedChange={(checked) => setOneResponsePerUser(Boolean(checked))} />
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseLimit">Response limit</Label>
              <Input
                id="responseLimit"
                type="number"
                min={0}
                placeholder="Unlimited"
                value={responseLimit}
                onChange={(event) => setResponseLimit(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {showingRestrictions && (
              <>
                <div className="space-y-2 rounded-xl border p-4">
                  <p className="font-medium">Roles</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['ADMIN', 'EMPLOYEE'] as RoleValue[]).map((role) => (
                      <label key={role} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={selectedRoles.includes(role)} onCheckedChange={() => setSelectedRoles((current) => toggleValue(current, role))} />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border p-4">
                  <p className="font-medium">Departments</p>
                  <ScrollArea className="h-40 pr-3">
                    <div className="space-y-3">
                      {departments.map((department) => (
                        <label key={department.id} className="flex items-start gap-2 text-sm">
                          <Checkbox
                            checked={selectedDepartments.includes(department.id)}
                            onCheckedChange={() => setSelectedDepartments((current) => toggleValue(current, department.id))}
                          />
                          <span>
                            {department.name}
                            <span className="ml-2 text-xs text-muted-foreground">{department.code}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-2 rounded-xl border p-4">
                  <p className="font-medium">Branches</p>
                  <ScrollArea className="h-40 pr-3">
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <label key={branch.id} className="flex items-start gap-2 text-sm">
                          <Checkbox
                            checked={selectedBranches.includes(branch.id)}
                            onCheckedChange={() => setSelectedBranches((current) => toggleValue(current, branch.id))}
                          />
                          <span>
                            {branch.name}
                            <span className="ml-2 text-xs text-muted-foreground">{branch.code}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-2 rounded-xl border p-4">
                  <p className="font-medium">Specific users</p>
                  <ScrollArea className="h-52 pr-3">
                    <div className="space-y-3">
                      {employees.map((employee) => (
                        <label key={employee.id} className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => setSelectedEmployees((current) => toggleValue(current, employee.id))}
                          />
                          <span className="flex flex-col">
                            <span className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {employee.employeeId} • {employee.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {employee.department?.name || 'No department'} • {employee.branch?.name || 'No branch'}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}

            {!showingRestrictions && (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                {restrictedSummary}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              startTransition(async () => {
                try {
                  await saveSettings();
                  toast({
                    title: 'Settings saved',
                    description: 'Form access rules were updated successfully.',
                  });
                  setOpen(false);
                  router.refresh();
                } catch {
                  toast({
                    title: 'Settings not saved',
                    description: 'Please try again.',
                    variant: 'destructive',
                  });
                }
              });
            }}
            disabled={saving}
            className="text-zinc-50">
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}