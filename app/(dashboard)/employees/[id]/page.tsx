import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN', 'ADMIN', 'HR']);

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

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{employee.firstName} {employee.lastName}</span>
            <Badge>{employee.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-medium">Employee ID:</span> {employee.employeeId}</p>
          <p><span className="font-medium">Email:</span> {employee.email}</p>
          <p><span className="font-medium">Phone:</span> {employee.phone || '-'}</p>
          <p><span className="font-medium">Role:</span> {employee.role}</p>
          <p><span className="font-medium">Department:</span> {employee.department?.name || '-'}</p>
          <p><span className="font-medium">Branch:</span> {employee.branch?.name || '-'}</p>
          <p><span className="font-medium">Manager:</span> {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-'}</p>
          <p><span className="font-medium">Clerk User ID:</span> {employee.clerkUserId}</p>
          <div className="md:col-span-2">
            <Link href="/employees" className="text-primary underline-offset-4 hover:underline">Back to employees</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}