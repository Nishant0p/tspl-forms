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

  const db = prisma as any;
  const employees = await db.employee.findMany({
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    include: {
      department: true,
      branch: true,
      manager: true,
    },
  });

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