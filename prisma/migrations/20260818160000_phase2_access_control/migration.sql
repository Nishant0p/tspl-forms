-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FormAccessMode" AS ENUM ('PUBLIC', 'AUTHENTICATED', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "departmentId" INTEGER,
    "branchId" INTEGER,
    "managerId" INTEGER,
    "role" "EmployeeRole" NOT NULL DEFAULT 'EMPLOYEE',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Form" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "accessMode" "FormAccessMode" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN "loginRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "oneResponsePerUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "responseLimit" INTEGER;

-- Backfill form status from existing publish flag.
UPDATE "Form"
SET "status" = CASE WHEN "published" = true THEN 'PUBLISHED'::"FormStatus" ELSE 'DRAFT'::"FormStatus" END;

-- AlterTable
ALTER TABLE "FormSubmissions" ADD COLUMN "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "employeeId" INTEGER,
ADD COLUMN "clerkUserId" TEXT;

-- CreateTable
CREATE TABLE "FormAllowedRole" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "role" "EmployeeRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAllowedDepartment" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAllowedBranch" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAllowedEmployee" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_active_idx" ON "Department"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_active_idx" ON "Branch"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_clerkUserId_key" ON "Employee"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");

-- CreateIndex
CREATE INDEX "Employee_clerkUserId_idx" ON "Employee"("clerkUserId");

-- CreateIndex
CREATE INDEX "Employee_employeeId_idx" ON "Employee"("employeeId");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");

-- CreateIndex
CREATE INDEX "Employee_managerId_idx" ON "Employee"("managerId");

-- CreateIndex
CREATE INDEX "Form_status_idx" ON "Form"("status");

-- CreateIndex
CREATE INDEX "Form_accessMode_idx" ON "Form"("accessMode");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmissions_formId_employeeId_key" ON "FormSubmissions"("formId", "employeeId");

-- CreateIndex
CREATE INDEX "FormSubmissions_formId_idx" ON "FormSubmissions"("formId");

-- CreateIndex
CREATE INDEX "FormSubmissions_employeeId_idx" ON "FormSubmissions"("employeeId");

-- CreateIndex
CREATE INDEX "FormSubmissions_clerkUserId_idx" ON "FormSubmissions"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAllowedRole_formId_role_key" ON "FormAllowedRole"("formId", "role");

-- CreateIndex
CREATE INDEX "FormAllowedRole_role_idx" ON "FormAllowedRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "FormAllowedDepartment_formId_departmentId_key" ON "FormAllowedDepartment"("formId", "departmentId");

-- CreateIndex
CREATE INDEX "FormAllowedDepartment_departmentId_idx" ON "FormAllowedDepartment"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAllowedBranch_formId_branchId_key" ON "FormAllowedBranch"("formId", "branchId");

-- CreateIndex
CREATE INDEX "FormAllowedBranch_branchId_idx" ON "FormAllowedBranch"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAllowedEmployee_formId_employeeId_key" ON "FormAllowedEmployee"("formId", "employeeId");

-- CreateIndex
CREATE INDEX "FormAllowedEmployee_employeeId_idx" ON "FormAllowedEmployee"("employeeId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmissions" ADD CONSTRAINT "FormSubmissions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedRole" ADD CONSTRAINT "FormAllowedRole_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedDepartment" ADD CONSTRAINT "FormAllowedDepartment_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedDepartment" ADD CONSTRAINT "FormAllowedDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedBranch" ADD CONSTRAINT "FormAllowedBranch_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedBranch" ADD CONSTRAINT "FormAllowedBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedEmployee" ADD CONSTRAINT "FormAllowedEmployee_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAllowedEmployee" ADD CONSTRAINT "FormAllowedEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
