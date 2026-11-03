# TSPL Forms & Workflow Platform — Complete System Architecture, Features, Pages & Logic

> **Platform Version**: 0.1.0  
> **Repository Name**: `tspl-forms-workflow-platform`  
> **Tech Stack**: Next.js 14.2.35 (App Router), TypeScript 5, Prisma ORM 5.7.1, PostgreSQL, Tailwind CSS 3.3.0, Radix UI Primitives / shadcn/ui, Zustand 4.4.7, `@dnd-kit/core` 6.1.0, SheetJS (`xlsx` 0.20.3), `qrcode` 1.5.4, `date-fns` 3.0.6, `lucide-react`, Web Crypto / Node.js Native Crypto.  
> **Verification Status**: 100% verified against all project source files, Prisma schema, API routes, Server Actions, field definitions, and UI components.

---

## Table of Contents

1. [Project File Structure Map](#1-project-file-structure-map)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [Database Schema & Data Models (Prisma)](#3-database-schema--data-models-prisma)
4. [Authentication, Session Management & Cryptography](#4-authentication-session-management--cryptography)
5. [Role-Based Access Control (RBAC) & Multi-Tenant Hierarchy](#5-role-based-access-control-rbac--multi-tenant-hierarchy)
6. [Complete Application Pages & Routing Logic](#6-complete-application-pages--routing-logic)
7. [Shared & Global UI Components (`components/`)](#7-shared--global-ui-components-components)
8. [Drag-and-Drop Form Builder Engine (`@dnd-kit`)](#8-drag-and-drop-form-builder-engine-dnd-kit)
9. [Comprehensive Form Elements Catalog (All 40 Fields)](#9-comprehensive-form-elements-catalog-all-40-fields)
10. [Dynamic Conditional Logic & Decision Engine](#10-dynamic-conditional-logic--decision-engine)
11. [Form Submission, Validation & Intake Flow](#11-form-submission-validation--intake-flow)
12. [Responses Governance, Reporting & Excel Export](#12-responses-governance-reporting--excel-export)
13. [Form Requests & Workflow Ticketing](#13-form-requests--workflow-ticketing)
14. [Public Tokenized Response Viewer (`/responses/[shareUrl]`)](#14-public-tokenized-response-viewer-responsesshareurl)
15. [Branded QR Code Engine & Sharing System](#15-branded-qr-code-engine--sharing-system)
16. [Webhook Notification & Data Privacy Pipeline](#16-webhook-notification--data-privacy-pipeline)
17. [API Endpoints Specification](#17-api-endpoints-specification)
18. [Server Actions Complete Reference](#18-server-actions-complete-reference)
19. [State Management Architecture (Zustand & LocalStorage)](#19-state-management-architecture-zustand--localstorage)
20. [Environment Variables Reference](#20-environment-variables-reference)

---

## 1. Project File Structure Map

```
tspl-forms/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── sign-in/[[...sign-in]]/
│   │       ├── page.tsx
│   │       └── SignInForm.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── AddAdminManagedUserDialog.tsx
│   │   │       └── AdminManagedUsersTable.tsx
│   │   ├── builder/[id]/
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── form-requests/
│   │   │   └── page.tsx
│   │   ├── forms/[id]/
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── super-admin/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── AdminHierarchyDropdown.tsx
│   │   │       ├── AdminManagementTable.tsx
│   │   │       └── DepartmentAndBranchManagement.tsx
│   │   └── _components/
│   │       ├── CardStat.tsx
│   │       ├── CreateFormBtn.tsx
│   │       ├── CopyFormBtn.tsx
│   │       ├── DeleteFormBtn.tsx
│   │       ├── DesginerElementWrapper.tsx
│   │       ├── Designer.tsx
│   │       ├── DesignerSidebar.tsx
│   │       ├── DragOverlayWrapper.tsx
│   │       ├── EditableFormName.tsx
│   │       ├── ExportXlsxBtn.tsx
│   │       ├── FloatingRightCapsuleToolbar.tsx
│   │       ├── FormAccessSettings.tsx
│   │       ├── FormBuilder.tsx
│   │       ├── FormBuilderClientWrapper.tsx
│   │       ├── FormBuilderResponsesTab.tsx
│   │       ├── FormBuilderSettingsTab.tsx
│   │       ├── FormCard.tsx
│   │       ├── FormCards.tsx
│   │       ├── FormCardSkeleton.tsx
│   │       ├── FormElements.tsx
│   │       ├── FormElementsSidebar.tsx
│   │       ├── FormLinkShare.tsx
│   │       ├── FormShareDialog.tsx
│   │       ├── FormViewerManager.tsx
│   │       ├── PreviewDialogBtn.tsx
│   │       ├── PropertiesFormSidebar.tsx
│   │       ├── PublishFormBtn.tsx
│   │       ├── SaveFormBtn.tsx
│   │       ├── SidebarBtnElement.tsx
│   │       ├── StatsCard.tsx
│   │       └── VisitBtn.tsx
│   ├── (landingpage)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── platform/
│   │   │   └── page.tsx
│   │   └── _components/
│   │       ├── CallToAction.tsx
│   │       ├── Features.tsx
│   │       ├── Footer.tsx
│   │       └── Hero.tsx
│   ├── (submission)/
│   │   ├── f/[formUrl]/page.tsx
│   │   ├── form/[formUrl]/
│   │   │   ├── page.tsx
│   │   │   └── responses/page.tsx
│   │   ├── p/[formUrl]/page.tsx
│   │   ├── responses/[shareUrl]/
│   │   │   ├── page.tsx
│   │   │   └── _components/ResponsesViewerClient.tsx
│   │   ├── submit/[formUrl]/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── _components/
│   │       └── FormSubmitComponent.tsx
│   ├── access-denied/
│   │   └── page.tsx
│   ├── actions/
│   │   ├── admin-management.ts
│   │   ├── employee.ts
│   │   ├── form.ts
│   │   ├── formRequest.ts
│   │   ├── formViewer.ts
│   │   └── super-admin.ts
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── form/[formUrl]/
│   │   │   ├── route.ts
│   │   │   └── submit/route.ts
│   │   ├── forms/[formUrl]/
│   │   │   ├── route.ts
│   │   │   └── submit/route.ts
│   │   └── session-check/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── favicon.ico
├── components/
│   ├── fields/ (40 Form Element implementations)
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   ├── ui/ (shadcn/ui primitives)
│   ├── AddEmployeeDialog.tsx
│   ├── AssignFormAccessDialog.tsx
│   ├── FileViewerModal.tsx
│   ├── FloatingThemeToggle.tsx
│   ├── FormCollaboratorsModal.tsx
│   ├── FormRequestDialog.tsx
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   ├── NavbarNavLinks.tsx
│   ├── ThemeSwitcher.tsx
│   ├── UserMenu.tsx
│   └── UserProfileModal.tsx
├── lib/
│   ├── auth.ts
│   ├── condition-evaluator.ts
│   ├── csrf.ts
│   ├── fonts.ts
│   ├── form-access.ts
│   ├── form-themes.ts
│   ├── password.ts
│   ├── prisma.ts
│   ├── qr.ts
│   ├── response-token.ts
│   ├── session.ts
│   ├── site-config.ts
│   ├── url.ts
│   ├── utils.ts
│   └── webhook.ts
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── schemas/
│   └── form.ts
└── store/
    └── store.ts
```

---

## 2. System Architecture & Technology Stack

The **TSPL Forms & Workflow Platform** is an enterprise-grade form builder and organizational workflow solution developed specifically for the TSPL Group.

### Core Architectural Pillars
- **Framework**: Next.js 14 App Router utilizing Server Components for initial load speed and Client Components for dynamic canvas interaction.
- **Data Layer**: PostgreSQL connected via Prisma ORM with connection pooling, transactional security, and strict relational cascading.
- **State Management**: Zustand store (`useDesginerStore`) for client canvas manipulation combined with browser `localStorage` draft persistence for zero data loss during network drops or tab closures.
- **Styling & Themes**: Tailwind CSS 3.3.0 with custom CSS variables, custom Soria typography (`lib/fonts.ts`), 6 visual background theme presets (`lib/form-themes.ts`), and dark/light mode toggles via `next-themes`.
- **Zero-Dependency Security**: Native Node.js `crypto` (`scrypt`, `timingSafeEqual`) and Web Crypto API (`HMAC-SHA256`) with zero third-party auth services required.

---

## 3. Database Schema & Data Models (Prisma)

The schema is declared in `prisma/schema.prisma`.

### Enums
```prisma
enum EmployeeRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  HR
  MANAGER
  EMPLOYEE
  FORM_VIEWER
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum FormAccessMode {
  PUBLIC
  AUTHENTICATED
  RESTRICTED
}

enum FormStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

enum FormRequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  REJECTED
}
```

### Models & Relational Integrity

#### 1. `Department`
- Represents an organizational division (e.g. HR, IT, Operations, Finance).
- Fields: `id`, `name`, `code` (unique), `description`, `active`, `createdAt`, `updatedAt`.
- Relations: `employees` (1:N), `allowedFormAccesses` (1:N with `FormAllowedDepartment`).

#### 2. `Branch`
- Represents a physical office or geographic operating hub (e.g. Headquarters, Pune Hub).
- Fields: `id`, `name`, `code` (unique), `location`, `active`, `createdAt`, `updatedAt`.
- Relations: `employees` (1:N), `allowedFormAccesses` (1:N with `FormAllowedBranch`), `targetForms` (1:N with `Form`).

#### 3. `Employee`
- Represents any system user or staff member.
- Fields:
  - `id`: Autoincrement integer ID.
  - `clerkUserId`: Unique identifier string.
  - `employeeId`: Unique formatted string (e.g. `TSPL001`, `EMP000`).
  - `firstName`, `lastName`, `email`: Personal contact identity.
  - `password`: Salted `scrypt` hash string.
  - `phone`, `imageUrl`: Contact details and avatar.
  - `departmentId`, `branchId`: Scoping foreign keys.
  - `createdById`: Foreign key referencing creator Admin (`Employee`).
  - `managerId`: Foreign key referencing direct reporting Manager (`Employee`).
  - `role`: `EmployeeRole` (Default: `EMPLOYEE`).
  - `status`: `EmployeeStatus` (Default: `ACTIVE`).
- Relations: `responses` (`FormSubmissions`), `allowedForms` (`FormAllowedEmployee`), `formViewerAccesses` (`FormViewerAccess`), `formRequestsRaised`, `formRequestsAssigned`.

#### 4. `Form`
- Represents a form created in the system.
- Fields:
  - `id`: Autoincrement integer ID.
  - `userId`: String identifying the creator.
  - `published`: Boolean (Default: false).
  - `status`: `FormStatus` (Default: `DRAFT`).
  - `name`: Form title (auto-increments if duplicate, e.g. `Registration (1)`).
  - `description`: Sub-title or instructions text.
  - `content`: Long text JSON array representing `FormElementInstance[]`.
  - `accessMode`: `FormAccessMode` (`PUBLIC`, `AUTHENTICATED`, `RESTRICTED`).
  - `loginRequired`: Boolean toggle.
  - `oneResponsePerUser`: Single submission constraint per employee.
  - `startDate`, `endDate`: Optional activation and expiration date-time locks.
  - `responseLimit`: Optional maximum submissions counter.
  - `branchId`: Scoped branch foreign key.
  - `visits`: Integer visit counter (increments on every form view).
  - `submissions`: Integer submission counter.
  - `shareUrl`: Unique custom alphanumeric slug (e.g. `regform-k8a2b9`).
- Unique constraints: `@@unique([userId, name])`, `@@unique([shareUrl])`.

#### 5. `FormSubmissions`
- Stored response row.
- Fields: `id`, `createdAt`, `submittedAt`, `formId`, `employeeId` (nullable), `clerkUserId` (nullable), `content` (JSON text of key-value answers).
- Unique constraint: `@@unique([formId, employeeId])` prevents duplicate submissions per employee when enabled.

#### 6. Access Control Mapping Models
- `FormAllowedRole`: `@@unique([formId, role])`
- `FormAllowedDepartment`: `@@unique([formId, departmentId])`
- `FormAllowedBranch`: `@@unique([formId, branchId])`
- `FormAllowedEmployee`: `@@unique([formId, employeeId])` (Form Editors)
- `FormViewerAccess`: `@@unique([formId, employeeId])` (Form Read-only Viewers)

#### 7. `FormRequest`
- Workflow build ticketing model.
- Fields: `id`, `title`, `description`, `formType`, `priority`, `status`, `requestedById`, `assignedToId`, `completedFormId`, `notes`, `createdAt`, `updatedAt`.

---

## 4. Authentication, Session Management & Cryptography

### 1. Password Security (`lib/password.ts`)
- **Hashing**: Powered by Node.js native `crypto.scrypt` with a cryptographically secure 16-byte random salt and 64-byte key length.
- **Output Format**: `scrypt$<salt_hex>$<derived_key_hex>`.
- **Verification**: Timing-safe memory comparison via `crypto.timingSafeEqual` prevents side-channel timing analysis.
- **Transparent Migration**: Legacy plaintext, MD5, and SHA-256 passwords automatically upgrade to salted `scrypt` upon successful login.

### 2. Cryptographic Sessions (`lib/session.ts`)
- **Structure**: `payloadBase64Url.signatureHex`.
- **Signing**: HMAC-SHA256 signature generated using secret `SESSION_SECRET` (or `SUPER_ADMIN_PASSWORD`).
- **Edge Compatibility**: Uses the Web Crypto API (`crypto.subtle`) in Edge Middleware and Node's `crypto` module in Server Actions.
- **Integrity**: Any client tampering with the session payload invalidates the signature, causing middleware to wipe the cookie and redirect to sign-in.

### 3. Multi-Identifier Login Logic (`authenticateCredentials` in `lib/auth.ts`)
- Accepts Email (case-insensitive), Formatted Employee ID (`TSPL001`, `EMP000`), plain numeric digits (auto-matching `TSPL`/`EMP` prefixes), Phone number, or Clerk User ID.
- Fallback for `.env` Bootstrap Super Admin (`SUPER_ADMIN_IDP`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`).

### 4. Edge Middleware (`middleware.ts`)
- Evaluates every request outside of Next.js static assets and images.
- Whitelists public paths: `/`, `/platform`, `/sign-in`, `/access-denied`, `/form/*`, `/submit/*`, `/f/*`, `/p/*`, `/responses/*`, `/api/*`.
- Automatically preserves the destination URL in `?redirect=` query param when redirecting unauthenticated requests.

---

## 5. Role-Based Access Control (RBAC) & Multi-Tenant Hierarchy

### Roles & Responsibilities
1. **`SUPER_ADMIN`**: Global system architect. Can create branches, create/manage Branch Admins (hard limit of 3 Super Admins enforced), and access all forms.
2. **`ADMIN` (Branch Head)**: Strictly limited to 1 active Admin per branch. Full oversight of team members, users, and forms in their branch.
3. **`HR`**: Manages human resources, creates staff accounts, and submits form build requests.
4. **`MANAGER`**: Manages departments/teams and submits form build requests.
5. **`EDITOR`**: Specialized form builder. Picks up form requests, designs questions, and edits forms where assigned.
6. **`EMPLOYEE`**: Standard organizational staff. Submits internal forms and can create personal forms.
7. **`FORM_VIEWER`**: Read-only stakeholder role. Can view responses and analytics for specifically assigned forms without builder/edit access.

### Scoped Visibility Rules (`getAccessibleFormsWhere` in `lib/form-access.ts`)
- **Super Admin**: `{}` (No filter — views all organization forms).
- **Branch Admin**: Views forms created by themselves, forms assigned to them, forms targeted to their branch, or forms created by employees belonging to their branch.
- **All Other Roles**: Strictly views forms created by themselves or specifically assigned via `FormAllowedEmployee` (Editor) or `FormViewerAccess` (Viewer).

---

## 6. Complete Application Pages & Routing Logic

### 1. Landing Page (`app/(landingpage)/page.tsx`)
- **Route**: `/`
- **Components**: `Hero`, `Features`, `CallToAction`, `Footer`.
- **Purpose**: Showcase TSPL forms capabilities, drag-and-drop designer, enterprise security, and direct link to sign in or explore platform.

### 2. Platform Redirect (`app/(landingpage)/platform/page.tsx`)
- **Route**: `/platform`
- **Logic**: Automatically redirects authenticated users or visitors to `/form-requests`.

### 3. Sign-in Portal (`app/(auth)/sign-in/[[...sign-in]]/page.tsx`)
- **Route**: `/sign-in`
- **Client Component**: `SignInForm.tsx`
- **Logic**:
  - Universal login input: supports Email, TSPL Employee ID (`TSPL001`, `EMP000`), or Phone.
  - Dual submission pipeline: First attempts high-performance REST endpoint `/api/auth/login`. If unhandled, falls back to `loginUser` Server Action.
  - Automatically respects return URL via `?redirect=` or `?redirect_url=`.
  - Password visibility toggle (`Eye` / `EyeOff`).

### 4. Main Dashboard (`app/(dashboard)/dashboard/page.tsx`)
- **Route**: `/dashboard`
- **Protected by**: `requireEmployee()`
- **Features**:
  - **Stats Cards**: Displays aggregated Visits, Submissions, Submission Rate (%), and Bounce Rate (%) computed strictly for forms accessible to the user.
  - **Sparkline Charts**: 7-day daily activity trends generated by `GetDashboardSparklineData`.
  - **Role Specialization**: If the user is a `FORM_VIEWER` and has only 1 assigned form, automatically redirects directly to `/forms/[id]` for immediate work.
  - **Create Form Action**: Opens `CreateFormBtn` modal to scaffold a new form with auto-slug generation.
  - **Form Cards Grid (`FormCards.tsx`)**: Displays all accessible forms with real-time badges (Live/Draft, Access Mode, Branch), submission stats, and a **Live Scaled-Down Mini Preview (`FormMiniPreview`)**. Actions include Edit Form / View Details, Submissions, Make a Copy (`CopyFormBtn`), Collaborators (`FormCollaboratorsModal`), and Delete (`DeleteFormBtn`).

### 5. Form Builder (`app/(dashboard)/builder/[id]/page.tsx`)
- **Route**: `/builder/[id]`
- **Protected by**: `GetFormById(id)` with `perms.canEdit` check. (Read-only viewers are automatically redirected to `/forms/[id]`).
- **Google Forms Inspired 3-Tab Architecture**:
  1. **Questions Tab**: Drag-and-drop canvas with DndContext, droppable area, field insertion, properties editor sidebar, zoom controls (50% to 150%), and floating right capsule toolbar.
  2. **Responses Tab**: Embedded response table with live submission counter, search, file viewer, and Excel export.
  3. **Settings Tab**: Form name editing, Access Mode selection, login requirement toggle, single submission lock, start/end dates, response limits, and allowed roles/departments/branches/employees multi-select.
- **Top Bar Actions**:
  - Back to Dashboard.
  - Inline Editable Form Name (`EditableFormName`).
  - Form Live/Draft badge.
  - Preview Modal (`PreviewDialogBtn`).
  - Collaborators Modal (`FormCollaboratorsModal`).
  - Send/Share Dialog (`FormShareDialog`): Copies share link, generates custom QR code with embedded TSPL group logo, provides iframe embed snippet.
  - Save Form (`SaveFormBtn`).
  - Publish Form (`PublishFormBtn`).
  - Delete Form (`DeleteFormBtn`).

### 6. Form Analytics & Submissions (`app/(dashboard)/forms/[id]/page.tsx`)
- **Route**: `/forms/[id]`
- **Protected by**: `requireFormPermission(id, 'VIEW')`.
- **Features**:
  - Aggregate form metrics: Visits, Submissions, Conversion Rate, Bounce Rate.
  - Dynamic Submissions Table: Inspects the form's `content` JSON, automatically generates dynamic table columns matching all question types.
  - Custom cell formatters: Rating stars, Checkbox ticks, Date formatting, Canvas Signature modal, File Viewer modal (`FileViewerModal`).
  - Direct Excel Export (`ExportXlsxBtn`) utilizing SheetJS.
  - Toolbar Actions: Edit Form, Make a Copy (`CopyFormBtn`), Visit Form, Collaborator Management (`FormViewerManager`), Share Form (`FormShareDialog`), and Delete Form (`DeleteFormBtn`).

### 7. Employee Management Directory (`app/(dashboard)/employees/page.tsx` & `[id]/page.tsx`)
- **Routes**: `/employees` and `/employees/[id]`
- **Protected by**: `requireRole(['SUPER_ADMIN', 'ADMIN'])`.
- **Logic**:
  - Super Admin views all employees across the entire organization.
  - Branch Admin strictly views only employees assigned to their branch.
  - Detail page allows Super Admin and Branch Admins to Activate, Suspend, or Terminate employees (with safety checks preventing self-termination).

### 8. Form Build Requests (`app/(dashboard)/form-requests/page.tsx`)
- **Route**: `/form-requests`
- **Features**:
  - Requesters (`SUPER_ADMIN`, `ADMIN`, `HR`, `MANAGER`) submit requests for new business forms with title, description, form type, and priority (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
  - Editors (`SUPER_ADMIN`, `ADMIN`, `EDITOR`) pick up pending requests, changing status to `IN_PROGRESS` with assigned editor ID, and mark as `COMPLETED` or `REJECTED` with closing notes.

### 9. Branch Admin Management Console (`app/(dashboard)/admin/page.tsx`)
- **Route**: `/admin`
- **Protected by**: `requireRole(['SUPER_ADMIN', 'ADMIN'])`.
- **Features**:
  - Displays admin profile and assigned branch badge.
  - Stat cards breaking down team users by role (HR, Manager, Editor, Employee, Form Viewer).
  - Add User Dialog (`AddAdminManagedUserDialog`): Automatically locks newly created user to the Admin's branch.
  - User Management Table: Allows resetting passwords, updating roles/statuses, assigning specific forms as Editor or Viewer, and clean deletion with cascading foreign key unlink.

### 10. Super Admin Portal (`app/(dashboard)/super-admin/page.tsx`)
- **Route**: `/super-admin`
- **Protected by**: `requireSuperAdmin()`.
- **Features**:
  - **Branch Management**: Create and delete organizational branches.
  - **Admin Hierarchy Table**: Manage Super Admins (enforced maximum of 3) and Branch Admins (enforced strictly 1 Branch Head per branch).
  - **Admin Report Card**: Interactive modal displaying an admin's managed team members, created forms count, total submissions count, and full list of managed forms.

### 11. Public & Guest Form Submission (`app/(submission)/form/[formUrl]/page.tsx`)
- **Routes**: `/form/[formUrl]`, `/submit/[formUrl]`, `/f/[formUrl]`, `/p/[formUrl]`
- **Features**:
  - Evaluates form access criteria: draft status, start/end dates, response limit, login requirements, branch/role restrictions, duplicate submissions.
  - Automatically increments form visit count on load.
  - Mounts `FormSubmitComponent` with theme styling, progress bar, conditional logic evaluation, draft auto-saving, and celebratory submission screen.

### 12. Public Tokenized Response Viewer (`app/(submission)/responses/[shareUrl]/page.tsx`)
- **Route**: `/responses/[shareUrl]` (and redirect from `/form/[formUrl]/responses`)
- **Protected by**: Universal randomized 14-character cryptographic token (`generateResponseToken`).
- **Features**: Public stakeholders or executives can view real-time submissions table, search, filter, view attachments, and export to Excel without logging in.

### 13. Access Denied Fallback (`app/access-denied/page.tsx`)
- **Route**: `/access-denied`
- **Features**: Clean, accessible error page for unauthorized role/department/branch attempts, with links to sign in or return to dashboard.

---

## 7. Shared & Global UI Components (`components/`)

- `Navbar.tsx`: Sticky responsive header with corporate navy-blue gradient (`linear-gradient(135deg, #0f2744 0%, #1a3a6b 60%, #1e4480 100%)`).
- `NavbarNavLinks.tsx`: Role-based navigation links (Dashboard/My Form, Users, Requests, Branch Admin, Super Admin).
- `UserMenu.tsx`: User profile avatar dropdown with initials, role badges, branch indicator, and sign-out action.
- `UserProfileModal.tsx`: Personal profile modal permitting users to update their First Name, Last Name, and avatar Image (Base64 file upload up to 3MB).
- `FormCollaboratorsModal.tsx`: Comprehensive collaborator management dialog in builder header:
  - Tab 1: Existing Collaborators (assigns Editors and Viewers from team members created by the same admin).
  - Tab 2: Response Link Generator (creates and copies randomized 14-char token link).
- `FileViewerModal.tsx`: Submissions attachment preview modal supporting PNG/JPEG/WEBP/PDF previews, zoom, pan, and direct file download.
- `AddEmployeeDialog.tsx`: Super Admin dialog to create new employees with auto `TSPL` ID prefixing.
- `AssignFormAccessDialog.tsx`: Dialog to assign one or multiple forms to a specific employee as Editor or Viewer.
- `FormRequestDialog.tsx`: Dialog to create new form build requests.
- `ThemeSwitcher.tsx` & `FloatingThemeToggle.tsx`: Dark/Light theme toggles.
- `Logo.tsx`: TSPL logo with responsive brand text.

---

## 8. Drag-and-Drop Form Builder Engine (`@dnd-kit`)

### Drag-and-Drop Flow
1. **Sidebar to Canvas**: Dragging a field button from `FormElementsSidebar` onto the canvas drop area or between cards calculates insertion index and instantiates field using `FormElements[type].construct(idGenerator())`.
2. **Reordering Canvas Elements**: Dragging an existing element divides target cards into top-half and bottom-half zones for exact placement.
3. **Floating Right Capsule Toolbar (`FloatingRightCapsuleToolbar.tsx`)**: Anchored dynamically next to the currently selected card, providing fast 1-click additions (+ Question, Tt Title, Image/Banner, Drawer).
4. **Canvas Zoom & Viewport Controls**: Scales designer canvas from 50% to 150% with smooth CSS transforms.
5. **Autosave Engine**: Modifying questions, properties, or ordering instantly updates Zustand store (`store/store.ts`) and synchronizes with PostgreSQL via `UpdateFormContent`.

---

## 9. Comprehensive Form Elements Catalog (All 40 Fields)

Every form element implements the standardized `FormElement` contract:
- `construct(id)`: Instantiates default attributes.
- `designerBtnElement`: Icon and label for the sidebar palette.
- `designerComponent`: Visual preview rendered inside the canvas.
- `formComponent`: Interactive component rendered during live form submission.
- `propertiesComponent`: Form controls for adjusting properties (labels, placeholders, options, required toggle).
- `validate(element, value)`: Server and client validation rules.

---

### Category A: Standard Inputs
1. **`TextField`**: Single-line text input with label, placeholder, helper text, and min/max length validation.
2. **`TextAreaField`**: Multi-line expandable text area with configurable rows.
3. **`NumberField`**: Numeric-only input with min and max bounds enforcement.
4. **`DateField`**: Calendar date picker with popover.
5. **`TimeField`**: Time picker supporting 12-hour and 24-hour formats.
6. **`EmailField`**: Standard RFC email format validation.
7. **`PhoneField`**: General international phone number input.

---

### Category B: Selection Inputs
8. **`SelectField`**: Single-choice dropdown from a configurable list of options.
9. **`RadioField`**: Radio button group for single selection.
10. **`CheckboxField`**: Multi-select or single-select checkbox controls.
11. **`RatingField`**: Interactive star rating component (1 to 5 stars).
12. **`LinearScaleField`**: Likert rating scale (1-5 or 1-10) with customizable left and right anchor labels.

---

### Category C: Layout & Media Elements
13. **`TitleField`**: Large primary section header.
14. **`SubTitleField`**: Secondary section header.
15. **`ParagraphField`**: Rich instructional paragraph text.
16. **`SeperatorField`**: Horizontal dividing rule.
17. **`SpacerField`**: Customizable vertical spacing block (height in px).
18. **`SectionHeaderField`**: Structural card dividing sections with title and description.
19. **`BannerField`**: Top header hero banner with image URL, customizable height, aspect ratio, and object fit.
20. **`ImageField`**: Visual image block with caption.
21. **`VideoField`**: Embedded video container (YouTube, Vimeo, or direct MP4 URL).
22. **`ThemeField`**: Visual theme controller supporting 6 preset styles (TSPL Orange Waves, Royal Blue Curves, Duo Curves, Midnight Tech Grid, Aurora Waves, Amber Topographic) + custom primary color picker and texture blur slider.
23. **`ThankYouField`**: Custom post-submission screen with celebration confetti, title, message, custom button label, and external redirect URL.

---

### Category D: Advanced Interaction & Logic
24. **`FileUploadField`**: Attachment upload widget with accepted file formats, max size constraints, and base64 preview.
25. **`SignatureField`**: Canvas-based digital drawing pad with touch support, clear canvas button, and base64 PNG export.
26. **`ConditionField`**: Dynamic conditional branching engine controlling question visibility, dropdown option filtering, and automatic field editability.

---

### Category E: TSPL Enterprise Custom Suite
27. **`TsplFullNameField`**: Standardized full name input for Indian employees and applicants.
28. **`TsplEmailField`**: Strict corporate email input with `@tsplgroup.in` domain enforcement toggle.
29. **`TsplMobileField`**: Strict 10-digit Indian mobile number validation with permanent `+91` prefix.
30. **`TsplCurrentDateTimeField`**: Auto-stamped submission timestamp (locked by default, dynamically unlocked for editing when triggered by a `ConditionField`).
31. **`TsplDobAgeField`**: Date of Birth calendar picker with automatic real-time age calculation in years.
32. **`TsplGenderField`**: Standardized gender selection (Male, Female, Other, Prefer not to say).
33. **`TsplLocationField`**: Indian PIN code lookup with auto-detection of District, State, and Post Office names via Postal API (`https://api.postalpincode.in/pincode/{pincode}`).
34. **`TsplEducationField`**: Readymade qualification selector (10th, 12th, Graduate, Post Graduate, Doctorate, Diploma, etc.).
35. **`TsplRangeDropdownField`**: Year or numeric range selector.
36. **`TsplConsentField`**: Legal agreement declaration checkbox with customizable terms & conditions text.
37. **`TsplAadhaarField`**: Strict 12-digit UIDAI Aadhaar number input with live digit counter, automatic `4-4-4` spacing (`1234 5678 9012`), and optional PII masking.
38. **`TsplPanField`**: Standard 10-character alphanumeric Indian PAN format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) with auto-capitalization, regex validation, and entity category detection.
39. **`TsplBankIfscField`**: 11-character Indian Bank IFSC input with live auto-lookup using the Razorpay IFSC API (`https://ifsc.razorpay.com/{code}`), automatically displaying detected Bank Name, Branch, District, State, and supported payment modes (NEFT, RTGS, IMPS, UPI).
40. **`TsplBankAccountField`**: Bank account number input with re-enter confirmation validation to eliminate financial transfer typos.

---

## 10. Dynamic Conditional Logic & Decision Engine

Implemented in `lib/condition-evaluator.ts`:

- **Question Visibility (Show/Hide)**: Hides or reveals target fields dynamically based on selected choices in prior fields.
- **Validation Bypass**: Fields hidden by conditional logic are dynamically omitted from required validation checks.
- **Dynamic Dropdown Option Filtering**: Restricts visible options in downstream select fields based on parent field value.
- **Dynamic Field Editability**: Automatically unlocks auto-stamped fields (such as `TsplCurrentDateTimeField`) to become user-editable when conditions are satisfied.

---

## 11. Form Submission, Validation & Intake Flow

- **Draft Recovery**: Automatically saves user keystrokes to `localStorage.getItem('tspl_draft_' + formUrl)`. Restores answered fields and progress percentage on page refresh.
- **Progress Bar**: Live dynamic indicator `(answeredCount / totalQuestions) * 100%`.
- **Intake Pipeline (`SubmitForm`)**:
  - Validates access status (`DRAFT`, `CLOSED`, `ARCHIVED`, date windows, response limits).
  - Enforces `oneResponsePerUser` constraints.
  - Inserts into `FormSubmissions` table.
  - Increments form `submissions` counter.
  - Asynchronously fires Discord webhook notification.
  - Renders `ThankYouField` with confetti and clears the local draft.

---

## 12. Responses Governance, Reporting & Excel Export

- **Dynamic Columns**: Generated on the fly from the form's `content` JSON schema.
- **Field-Specific Formatters**:
  - Attachments: Clickable badge opening `FileViewerModal`.
  - Signatures: Thumbnail opening canvas signature modal.
  - Ratings: Rendered as yellow star icons.
  - Aadhaar: Formatted as `XXXX-XXXX-1234` when masked.
  - PAN: Rendered in uppercase monospace format.
  - IFSC & Location: Displays detected bank/branch and district/state.
- **SheetJS Export (`ExportXlsxBtn.tsx`)**: Converts submission data into `.xlsx` worksheets with clean formatted headers and initiates instant download.

---

## 13. Form Requests & Workflow Ticketing

Implemented in `app/(dashboard)/form-requests/page.tsx` and `app/actions/formRequest.ts`:
- Requesters (`SUPER_ADMIN`, `ADMIN`, `HR`, `MANAGER`) submit requests for new business forms with title, description, form type, and priority (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
- Editors (`SUPER_ADMIN`, `ADMIN`, `EDITOR`) pick up pending requests, changing status to `IN_PROGRESS` with assigned editor ID, and mark as `COMPLETED` or `REJECTED` with closing notes.

---

## 14. Public Tokenized Response Viewer (`/responses/[shareUrl]`)

Implemented in `app/(submission)/responses/[shareUrl]/page.tsx` and `lib/response-token.ts`:
- Generates 14-character Base62 randomized tokens (`generateResponseToken`) using Murmur3 32-bit hashing and random entropy.
- Allows external stakeholders or executives to review submissions, search across questions, inspect attachments and canvas signatures, and export to Excel without logging in.

---

## 15. Branded QR Code Engine & Sharing System

Implemented in `lib/qr.ts` and `app/(dashboard)/_components/FormShareDialog.tsx`:
- Generates high-resolution QR codes using `qrcode` with **Level 'H' error correction (30% recovery)**.
- Renders onto an HTML5 Canvas, calculates a center badge (24% of QR dimension), paints a rounded white container with a border, and centers the official **TSPL Logo** inside.
- 100% scannable by standard mobile cameras.
- Provides direct links, short URLs (`/f/[slug]`, `/p/[id]`), QR codes, and iframe embed snippets.

---

## 16. Webhook Notification & Data Privacy Pipeline

Implemented in `lib/webhook.ts`:
- Dispatches submission notifications to Discord webhook URL configured in `DISCORD_WEBHOOK_URL`.
- Transmits non-sensitive fields: Full Name, Email, Phone, DOB, Age, Education, Gender, Location, Form Name, Share URL, Submission ID.
- **Regulatory PII Exclusion**: Strictly excludes sensitive Indian identification and financial fields (`TsplAadhaarField`, `TsplPanField`, `TsplBankIfscField`, `TsplBankAccountField`) from webhook dispatches.

---

## 17. API Endpoints Specification

| Route | Methods | Description |
| :--- | :---: | :--- |
| `/api/auth/login` | `POST` | Authenticates credentials; issues signed HMAC HTTP-only cookie. |
| `/api/session-check` | `HEAD` | Checks cookie validity (returns 200 OK or 401 Unauthorized). |
| `/api/forms/[formUrl]` | `GET`, `POST` | REST endpoints to fetch form schema and submit response data. |
| `/api/forms/[formUrl]/submit`| `POST` | Alias endpoint for form submission. |
| `/api/form/[formUrl]` | `GET`, `POST` | Alias routes matching `/api/forms/*`. |
| `/api/form/[formUrl]/submit` | `POST` | Alias routes matching `/api/forms/*`. |

---

## 18. Server Actions Complete Reference

### Form Actions (`app/actions/form.ts`)
- `GetFormStats()`: Scoped aggregate visits, submissions, conversion and bounce rates.
- `GetDashboardSparklineData(days)`: 7-day daily submission counts and visit ratios.
- `GetActiveBranches()`: Retrieves all active branches.
- `CreateForm(data)`: Scaffolds form, generates unique custom slug, scopes to branch.
- `requireFormPermission(formId, level)`: Strictly enforces permissions (`VIEW`, `EDIT`, `DELETE`, `MANAGE`).
- `GetForm()`: Retrieves all forms accessible to caller based on RBAC rules.
- `GetFormById(id)`: Fetches form with permission verification.
- `UpdateFormName(id, name)`: Renames form.
- `UpdateFormContent(id, jsonContent)`: Saves questions schema.
- `UpdateFormSettings(id, settings)`: Updates access modes, time locks, limits, and permissions.
- `PublishForm(id)`: Transitions form to `PUBLISHED` state.
- `GetFormContentByUrl(formUrl)`: Increments visits and returns content for live intake.
- `SubmitForm(formUrl, content)`: Validates constraints, saves submission, triggers webhook.
- `GetFormSubmissions(id)`: Fetches all responses for builder/detail view.
- `GetFormSubmissionsByShareUrl(shareUrl)`: Fetches responses for tokenized responses viewer.
- `DeleteForm(id)`: Deletes form and related access records.
- `DuplicateForm(formId, customName?)`: Creates a new duplicate form copying only question elements (`content`), description, and metadata into a clean `DRAFT` state (`published: false`, 0 submissions, 0 visits). Sets default title to `Copy of {form_name}` (auto-increments `(1)`, `(2)` if name already exists), generates a unique custom URL slug, scopes to the branch, and revalidates dashboard paths.
- `deleteElementInstance(id, elementId)`: Removes specific element from form schema.

### Admin Management Actions (`app/actions/admin-management.ts`)
- `getAdminDashboardData()`: Retrieves branch stats, team members, and departments.
- `createAdminManagedUser(data)`: Creates team user automatically locked to Admin's branch.
- `updateAdminManagedUserRoleAndStatus(id, role, status)`: Modifies role and status.
- `updateAdminManagedUserPassword(id, newPassword)`: Updates user password.
- `getAvailableFormsForAssignment()`: Lists forms available for assignment.
- `getUserFormAssignments(employeeId)`: Retrieves form IDs assigned to a user.
- `updateUserFormAssignments(employeeId, formIds)`: Updates assigned forms as Editor or Viewer.
- `deleteAdminManagedUser(userId)`: Deletes user with full foreign key unlinking.

### Super Admin Actions (`app/actions/super-admin.ts`)
- `getAdminsList()`: Retrieves all Super Admins and Branch Admins with nested team counts.
- `getAdminReportCard(adminId)`: Generates detailed audit of an admin's forms and team.
- `createAdminUser(data)`: Enforces max 3 Super Admins and 1 Admin per branch.
- `updateAdminRoleAndStatus(id, role, status)`: Promotes/demotes admins with constraint checks.
- `updateAdminPassword(id, newPassword)`: Super admin password reset.
- `deleteAdminUser(id)`: Deletes admin account.
- `getAllDepartmentsAndBranches()`: Fetches all departments and branches.
- `createDepartment(data)`, `deleteDepartment(id)`: Department management.
- `createBranch(data)`, `deleteBranch(id)`: Branch management.

### Employee & Profile Actions (`app/actions/employee.ts`)
- `loginUser(emailOrEmpId, password)`: Server Action login fallback.
- `logoutUser()`: Deletes session cookie and redirects to `/sign-in`.
- `createEmployee(data)`: HR/Admin employee creation.
- `updateEmployeeStatus(id, status)`: Terminates, suspends, or activates employees.
- `getEmployeesList()`: Sorted employee roster.
- `updateMyProfile(data)`: Updates personal user details and refreshes session cookie.
- `getDepartmentsAndBranches()`: Fetches active departments and branches.

### Form Collaborators Actions (`app/actions/formViewer.ts`)
- `getFormCollaborators(formId)`: Fetches assigned Editors and Viewers.
- `assignFormCollaborator(formId, employeeId, accessType)`: Assigns user as Editor or Viewer.
- `removeFormCollaborator(formId, employeeId)`: Revokes user access.
- `createAndAssignNewCollaborator(data)`: Creates new team user and immediately assigns to form.
- `generateFormResponseToken(formId)`: Generates 14-character token for public response viewing.

### Form Request Actions (`app/actions/formRequest.ts`)
- `createFormRequest(data)`: Raises new form build request.
- `getFormRequests()`: Lists requests scoped to caller role.
- `assignFormRequest(requestId)`: Picks up request into `IN_PROGRESS`.
- `updateFormRequestStatus(requestId, status, notes)`: Resolves or rejects request.

---

## 19. State Management Architecture (Zustand & LocalStorage)

### 1. Zustand Canvas Store (`store/store.ts`)
- State: `elements: FormElementInstance[]`, `selectedElement: FormElementInstance | null`.
- Reducers:
  - `addElement(index, element)`: Splices element into canvas at specified position.
  - `removeElement(id)`: Filters out element.
  - `updateElement(id, element)`: Replaces element attributes.
  - `setSelectedElement(element)`: Binds active element to properties editor sidebar.
  - `setElements(elements)`: Hydrates canvas state from database JSON.

### 2. LocalStorage Form Resilience
- Draft auto-save key: `tspl_draft_[formUrl]`.
- Live input updates write to browser storage on each change.
- Form load restores answered fields and recalculates answered counts.
- Cleared upon successful submission.

---

## 20. Environment Variables Reference

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `SESSION_SECRET` | HMAC-SHA256 cryptographic signing secret for session tokens. |
| `SUPER_ADMIN_IDP` | Bootstrap Super Admin Employee ID (e.g. `TSPL000`, `EMP000`). |
| `SUPER_ADMIN_EMAIL` | Bootstrap Super Admin email address. |
| `SUPER_ADMIN_PASSWORD` | Bootstrap Super Admin password. |
| `SUPER_ADMIN_ROUTE` | Route destination for Super Admin portal (default: `/super-admin`). |
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` | Application root URL for generating shareable links and QR codes. |
| `DISCORD_WEBHOOK_URL` | Secure webhook URL for dispatching submission notifications. |
