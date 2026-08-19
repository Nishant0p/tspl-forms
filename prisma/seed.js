const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Create Department
  const dept = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Engineering and Development Department',
      active: true
    }
  });
  console.log('Department created/found:', dept.name);

  // 2. Create Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Headquarters',
      code: 'HQ',
      location: 'Main Office',
      active: true
    }
  });
  console.log('Branch created/found:', branch.name);

  // 3. Create Super Admin Employee
  const employee = await prisma.employee.upsert({
    where: { clerkUserId: 'mock_user_1' },
    update: {
      password: 'SecurePassword123'
    },
    create: {
      clerkUserId: 'mock_user_1',
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@tspl.group',
      password: 'SecurePassword123',
      phone: '1234567890',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      departmentId: dept.id,
      branchId: branch.id
    }
  });
  console.log('Employee created/found:', employee.firstName, employee.lastName);

  // 4. Create Admin Employee
  const admin = await prisma.employee.upsert({
    where: { clerkUserId: 'mock_admin_1' },
    update: {
      password: 'SecurePassword123'
    },
    create: {
      clerkUserId: 'mock_admin_1',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@tspl.group',
      password: 'SecurePassword123',
      phone: '0987654321',
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: dept.id,
      branchId: branch.id
    }
  });
  console.log('Admin created/found:', admin.firstName, admin.lastName);

  // 5. Create Editor Employee
  const editor = await prisma.employee.upsert({
    where: { clerkUserId: 'mock_editor_1' },
    update: {
      password: 'SecurePassword123'
    },
    create: {
      clerkUserId: 'mock_editor_1',
      employeeId: 'EMP003',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@tspl.group',
      password: 'SecurePassword123',
      phone: '5555555555',
      role: 'EDITOR',
      status: 'ACTIVE',
      departmentId: dept.id,
      branchId: branch.id
    }
  });
  console.log('Editor created/found:', editor.firstName, editor.lastName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
