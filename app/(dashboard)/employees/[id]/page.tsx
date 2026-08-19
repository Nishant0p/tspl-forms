import prisma from '@/lib/prisma';
import { requireRole, requireEmployee } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateEmployeeStatus } from '@/app/actions/employee';
import Link from 'next/link';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN', 'ADMIN', 'HR']);
  const caller = await requireEmployee();

  const db = prisma as any;
  const employee = await db.employee.findUnique({
    where: {
      id: Number(params.id),
    },
    include: {
      department: true,
      branch: true,
      manager: true,
    },
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Enforce termination constraints:
  // 1. Cannot terminate yourself
  // 2. Only Super Admin can terminate Admins
  // 3. Admin can terminate standard Employees and Editors
  const canManage = employee.id !== caller.id && (
    caller.role === 'SUPER_ADMIN' || 
    (caller.role === 'ADMIN' && employee.role !== 'ADMIN' && employee.role !== 'SUPER_ADMIN')
  );

  async function handleTerminate() {
    'use server';
    await updateEmployeeStatus(employee.id, 'INACTIVE');
  }

  async function handleSuspend() {
    'use server';
    await updateEmployeeStatus(employee.id, 'SUSPENDED');
  }

  async function handleActivate() {
    'use server';
    await updateEmployeeStatus(employee.id, 'ACTIVE');
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{employee.firstName} {employee.lastName}</span>
            <Badge className={
              employee.status === 'ACTIVE' ? 'bg-green-600 text-white' : 
              employee.status === 'SUSPENDED' ? 'bg-amber-500 text-white' : 
              'bg-rose-600 text-white'
            }>
              {employee.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <p><span className="font-medium">Employee ID:</span> {employee.employeeId}</p>
          <p><span className="font-medium">Email:</span> {employee.email}</p>
          <p><span className="font-medium">Phone:</span> {employee.phone || '-'}</p>
          <p><span className="font-medium">Role:</span> {employee.role}</p>
          <p><span className="font-medium">Department:</span> {employee.department?.name || '-'}</p>
          <p><span className="font-medium">Branch:</span> {employee.branch?.name || '-'}</p>
          <p><span className="font-medium">Manager:</span> {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-'}</p>
          <p><span className="font-medium">Clerk User ID:</span> {employee.clerkUserId}</p>
          
          {/* Action buttons based on status & permissions */}
          {canManage && (
            <div className="md:col-span-2 border-t pt-6 mt-2 flex flex-wrap gap-3">
              {employee.status === 'ACTIVE' ? (
                <>
                  <form action={handleTerminate}>
                    <Button variant="destructive" type="submit">
                      Terminate Employee
                    </Button>
                  </form>
                  <form action={handleSuspend}>
                    <Button variant="outline" type="submit" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                      Suspend Employee
                    </Button>
                  </form>
                </>
              ) : (
                <form action={handleActivate}>
                  <Button variant="outline" type="submit" className="border-green-600 text-green-600 hover:bg-green-50">
                    Re-activate Employee
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="md:col-span-2 border-t pt-4">
            <Link href="/employees" className="text-primary underline-offset-4 hover:underline">Back to employees</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}