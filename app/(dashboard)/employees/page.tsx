import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import AddEmployeeDialog from '@/components/AddEmployeeDialog';

export default async function EmployeesPage() {
  const caller = await requireRole(['SUPER_ADMIN', 'ADMIN', 'HR']);
  const isSuperAdmin = caller.role === 'SUPER_ADMIN';

  // Get caller's assigned branch
  const dbCaller = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: typeof caller.id === 'number' && caller.id < 1000000 ? caller.id : -1 },
        { employeeId: caller.employeeId },
        { email: caller.email?.toLowerCase() },
      ],
    },
    select: { branchId: true },
  });

  const callerBranchId = dbCaller?.branchId || caller.branchId || null;

  let whereClause: any = {};
  if (!isSuperAdmin) {
    if (callerBranchId) {
      whereClause = { branchId: callerBranchId };
    }
  }

  const db = prisma as any;
  const employees = await db.employee.findMany({
    where: whereClause,
    orderBy: { employeeId: 'asc' },
    include: {
      department: true,
      branch: true,
      manager: true,
    },
  });

  employees.sort((a: any, b: any) =>
    (a.employeeId || '').localeCompare(b.employeeId || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employees</CardTitle>
            {isSuperAdmin && <AddEmployeeDialog />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <Link href={`/employees/${employee.id}`} className="text-primary underline-offset-4 hover:underline">
                      {employee.employeeId}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell><Badge variant="secondary">{employee.role}</Badge></TableCell>
                  <TableCell>{employee.department?.name || '-'}</TableCell>
                  <TableCell>{employee.branch?.name || '-'}</TableCell>
                  <TableCell>{employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-'}</TableCell>
                  <TableCell><Badge>{employee.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}