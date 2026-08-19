-- TSPL Forms & Workflow Platform - Database Schema for Self-Hosted VPS (PostgreSQL)
-- Execute this SQL file directly on your VPS database using:
-- psql -U <username> -d <database_name> -f schema.sql

-- Create Enums
CREATE TYPE "EmployeeRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'HR', 'MANAGER', 'EMPLOYEE');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "FormAccessMode" AS ENUM ('PUBLIC', 'AUTHENTICATED', 'RESTRICTED');
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
CREATE TYPE "FormRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- Create Tables

-- 1. Department
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

-- 2. Branch
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

-- 3. Employee
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
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

-- 4. Form
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "accessMode" "FormAccessMode" NOT NULL DEFAULT 'PUBLIC',
    "loginRequired" BOOLEAN NOT NULL DEFAULT false,
    "oneResponsePerUser" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "responseLimit" INTEGER,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "shareUrl" TEXT NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- 5. FormSubmissions
CREATE TABLE "FormSubmissions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "clerkUserId" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "FormSubmissions_pkey" PRIMARY KEY ("id")
);

-- 6. FormAllowedRole
CREATE TABLE "FormAllowedRole" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "role" "EmployeeRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedRole_pkey" PRIMARY KEY ("id")
);

-- 7. FormAllowedDepartment
CREATE TABLE "FormAllowedDepartment" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedDepartment_pkey" PRIMARY KEY ("id")
);

-- 8. FormAllowedBranch
CREATE TABLE "FormAllowedBranch" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedBranch_pkey" PRIMARY KEY ("id")
);

-- 9. FormAllowedEmployee
CREATE TABLE "FormAllowedEmployee" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAllowedEmployee_pkey" PRIMARY KEY ("id")
);

-- 10. FormRequest
CREATE TABLE "FormRequest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "formType" TEXT NOT NULL DEFAULT 'Other',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" "FormRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "completedFormId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormRequest_pkey" PRIMARY KEY ("id")
);

-- Create Indexes & Unique Constraints
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
CREATE INDEX "Department_active_idx" ON "Department"("active");

CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");
CREATE INDEX "Branch_active_idx" ON "Branch"("active");

CREATE UNIQUE INDEX "Employee_clerkUserId_key" ON "Employee"("clerkUserId");
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE INDEX "Employee_clerkUserId_idx" ON "Employee"("clerkUserId");
CREATE INDEX "Employee_employeeId_idx" ON "Employee"("employeeId");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");
CREATE INDEX "Employee_managerId_idx" ON "Employee"("managerId");

CREATE UNIQUE INDEX "Form_shareUrl_key" ON "Form"("shareUrl");
CREATE INDEX "Form_status_idx" ON "Form"("status");
CREATE INDEX "Form_accessMode_idx" ON "Form"("accessMode");
CREATE UNIQUE INDEX "Form_userId_name_key" ON "Form"("userId", "name");

CREATE INDEX "FormSubmissions_formId_idx" ON "FormSubmissions"("formId");
CREATE INDEX "FormSubmissions_employeeId_idx" ON "FormSubmissions"("employeeId");
CREATE INDEX "FormSubmissions_clerkUserId_idx" ON "FormSubmissions"("clerkUserId");
CREATE UNIQUE INDEX "FormSubmissions_formId_employeeId_key" ON "FormSubmissions"("formId", "employeeId");

CREATE INDEX "FormAllowedRole_role_idx" ON "FormAllowedRole"("role");
CREATE UNIQUE INDEX "FormAllowedRole_formId_role_key" ON "FormAllowedRole"("formId", "role");

CREATE INDEX "FormAllowedDepartment_departmentId_idx" ON "FormAllowedDepartment"("departmentId");
CREATE UNIQUE INDEX "FormAllowedDepartment_formId_departmentId_key" ON "FormAllowedDepartment"("formId", "departmentId");

CREATE INDEX "FormAllowedBranch_branchId_idx" ON "FormAllowedBranch"("branchId");
CREATE UNIQUE INDEX "FormAllowedBranch_formId_branchId_key" ON "FormAllowedBranch"("formId", "branchId");

CREATE INDEX "FormAllowedEmployee_employeeId_idx" ON "FormAllowedEmployee"("employeeId");
CREATE UNIQUE INDEX "FormAllowedEmployee_formId_employeeId_key" ON "FormAllowedEmployee"("formId", "employeeId");

CREATE INDEX "FormRequest_requestedById_idx" ON "FormRequest"("requestedById");
CREATE INDEX "FormRequest_assignedToId_idx" ON "FormRequest"("assignedToId");
CREATE INDEX "FormRequest_status_idx" ON "FormRequest"("status");

-- Foreign Key Constraints
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FormSubmissions" ADD CONSTRAINT "FormSubmissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormSubmissions" ADD CONSTRAINT "FormSubmissions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FormAllowedRole" ADD CONSTRAINT "FormAllowedRole_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FormAllowedDepartment" ADD CONSTRAINT "FormAllowedDepartment_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormAllowedDepartment" ADD CONSTRAINT "FormAllowedDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FormAllowedBranch" ADD CONSTRAINT "FormAllowedBranch_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormAllowedBranch" ADD CONSTRAINT "FormAllowedBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FormAllowedEmployee" ADD CONSTRAINT "FormAllowedEmployee_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormAllowedEmployee" ADD CONSTRAINT "FormAllowedEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FormRequest" ADD CONSTRAINT "FormRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormRequest" ADD CONSTRAINT "FormRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Initial Seed Data
INSERT INTO "Department" ("id", "name", "code", "description", "active") VALUES (1, 'Engineering', 'ENG', 'Engineering and Development Department', true) ON CONFLICT DO NOTHING;
INSERT INTO "Branch" ("id", "name", "code", "location", "active") VALUES (1, 'Headquarters', 'HQ', 'Main Office', true) ON CONFLICT DO NOTHING;
