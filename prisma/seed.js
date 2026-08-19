const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@tspl.group').trim().toLowerCase();
  const superAdminIdp = (process.env.SUPER_ADMIN_IDP || 'EMP001').trim();
  const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || 'DefaultPass123!';

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
    where: { clerkUserId: 'super_admin_seed' },
    update: {
      password: superAdminPass
    },
    create: {
      clerkUserId: 'super_admin_seed',
      employeeId: superAdminIdp,
      firstName: 'Tech',
      lastName: 'Admin',
      email: superAdminEmail,
      password: superAdminPass,
      phone: '1234567890',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      departmentId: dept.id,
      branchId: branch.id
    }
  });
  console.log('Super Admin created/found:', employee.firstName, employee.lastName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
