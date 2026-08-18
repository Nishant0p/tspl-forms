# TSPL Forms & Workflow Platform Features

This document provides a comprehensive list of features, supported field types, enterprise controls, and the development roadmap for the TSPL Forms & Workflow Platform.

## 1. Drag & Drop Form Builder

Build complex layouts with a drag-and-drop designer. Create, edit, preview, duplicate, and publish forms.

### Form Fields & Elements

The builder supports the following fields:

#### Standard Inputs
- **Text Field**: Single-line text input for short answers.
- **Textarea Field**: Multi-line text input for paragraph descriptions.
- **Number Field**: Numeric-only input with min/max validation.
- **Email Field**: Email-validated input box.
- **Phone Field**: Contact number input.
- **Date Field**: Calendar selector for date inputs.
- **Time Field**: 12/24-hour time selector.

#### Selection Inputs
- **Dropdown (Select) Field**: Single-select dropdown from a list of options.
- **Radio Field**: Radio buttons for single-option selection.
- **Checkbox Field**: Multi-select or single-state checkboxes.
- **Linear Scale Field**: Likert scale (e.g., 1-5 or 1-10) for ratings.
- **Rating Field**: Interactive star rating component.

#### Layout & Media Elements
- **Title Field**: Header text block.
- **SubTitle Field**: Sub-header text block.
- **Paragraph Field**: Read-only rich informational text blocks.
- **Separator Field**: Horizontal line divider.
- **Spacer Field**: Customizable vertical whitespace separator.
- **Image Field**: Visual image presentation block.
- **Video Field**: Embedded video display block.

#### Advanced Capabilities
- **File Upload Field**: Attachment upload widget.
- **Signature Field**: Canvas-based digital signature widget.

---

## 2. Access Control & Distribution

Ensure secure form distribution across the TSPL Group organization.

- **Public & Private Options**: Forms can be public (shared via link/QR code) or private (requiring authentication).
- **Employee Login**: Single Sign-On (SSO) integration using company credentials via Clerk.
- **Autofill Employee Data**: Automatically populate employee fields (name, branch, department) on load.
- **One Response Limit**: Option to enforce a single submission per employee.
- **Branch & Department Scoping**: Restrict form viewing and submission privileges to specific branches or departments.

---

## 3. Enterprise Workflow & Approvals

Move beyond data collection to full business process management.

- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, HR, Managers, and Employees.
- **Multi-Level Approval Chains**: Define sequential approvals (e.g., Manager -> HR -> Exec) per form type.
- **Pending Approvals Queue**: A dedicated dashboard for managers to review, approve, or reject submissions.
- **Notification Engine**: Real-time notifications via Email, WhatsApp, and SMS for pending actions.

---

## 4. Response Governance & Reporting

- **Real-Time Submissions**: Monitor visits, submissions, and completion rates in real time.
- **Data Tables**: Search, filter, and sort responses by any field.
- **Exports**: Export raw form data to Excel, CSV, and PDF formats.
- **Audit Trail**: Track the complete lifecycle of every form submission (creation, edits, approval actions).
- **Custom Report Builder**: Construct bespoke reports and graphs.
- **Automated Delivery**: Schedule reports to be sent to management automatically.

---

## Rollout Roadmap

### Phase 1: Core Platform (Completed & Live)
- Drag-and-drop builder shell
- Basic field types (Text, Number, Select, Date, Checkbox)
- Dashboard hub, visits/submissions stats, and draft/published states
- Public shareable links and QR codes
- Response capture and basic tables

### Phase 2: Enterprise Controls (Under Development)
- Employee authentication & SSO
- Department-wise and branch-wise restrictions
- Employee master-data autofill on forms
- One-response-per-user enforcement

### Phase 3: Workflow & Approvals
- Manager and HR multi-level approval chains
- Actionable pending queues
- Real-time Email, SMS, and WhatsApp notifications
- Full audit logs for approvals

### Phase 4: Reporting & Governance
- Advanced search and column filtering
- Scheduled management reports
- Custom report builder with charts and graphs
