# Form Request Workflow

## Overview
HR/Admin employees can submit "Form Build Requests" to Editors/Super Admins. Editors then pick up the request and build the form. The full lifecycle is tracked: Pending → In Progress → Completed / Rejected.

## Proposed Changes

---

### 1. Database — New `FormRequest` model

#### [MODIFY] `prisma/schema.prisma`
Add a new `FormRequestStatus` enum and `FormRequest` model:
```
enum FormRequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  REJECTED
}

model FormRequest {
  id            Int               @id @default(autoincrement()
  title         String
  description   String            @db.Text
  formType      String            // e.g. "HR Form", "Feedback", "Leave Request"
  priority      String            @default("NORMAL") // LOW, NORMAL, HIGH, URGENT
  status        FormRequestStatus @default(PENDING)
  requestedById Int               // Employee who raised the request (HR/Admin)
  assignedToId  Int?              // Editor/Super Admin who picked it up
  completedFormId Int?            // Linked form once built
  notes         String?           @db.Text
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  requestedBy   Employee @relation("RequestedBy", ...)
  assignedTo    Employee? @relation("AssignedTo", ...)
}
```

#### [NEW] Migration SQL file

---

### 2. Server Actions

#### [NEW] `app/actions/formRequest.ts`
- `createFormRequest(data)` — HR / Admin only
- `getFormRequests()` — filtered by role (requester sees own, Editor/Admin sees all)
- `updateFormRequestStatus(id, status, notes)` — Editor/Super Admin only
- `assignFormRequest(id)` — Editor claims a request

---

### 3. UI Pages

#### [NEW] `app/(dashboard)/form-requests/page.tsx`
Dashboard page listing form requests, visible to all employees but filtered by role:
- **HR/Admin view**: "My Requests" table + "New Request" button
- **Editor/Super Admin view**: All pending requests + ability to claim/update

#### [NEW] `components/FormRequestDialog.tsx`
Modal to submit a new form request with fields:
- Title (what the form is called)
- Form Type (dropdown: HR Form, Feedback, Leave Request, Survey, Operations, Other)
- Priority (Low / Normal / High / Urgent)
- Description (what fields, purpose, who fills it)

#### [MODIFY] `app/(landingpage)/platform/page.tsx`
Add a "Form Request Workflow" section with:
- A live "Submit a Form Request" CTA card linking to `/form-requests`
- Description of how the workflow works

---

### 4. Navigation

#### [MODIFY] `components/Navbar.tsx`
Add "Requests" link visible to logged-in users.

---

## Workflow
```
HR/Admin clicks "Request a Form"
   → fills title, type, priority, description
   → status = PENDING

Editor opens /form-requests dashboard
   → sees all PENDING requests
   → clicks "Pick Up" → status = IN_PROGRESS, assigned to editor

Editor builds the form in the builder
   → links the completed form to the request
   → status = COMPLETED

Requester can see status update on their requests list
```

## Verification
- HR/Admin can submit request; cannot change status
- Editor/Super Admin can claim and complete requests
- Completed requests link to the actual form

## Open Questions
None — proceeding to implement.
