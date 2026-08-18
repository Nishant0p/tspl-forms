/// <reference types="react" />
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const liveNow = [
  'TSPL branding and platform messaging',
  'Dedicated platform overview page',
  'Admin dashboard hub section',
  'Create form dialog and quick-start templates',
  'Core drag-and-drop builder shell',
  'Basic text, number, date, select, and checkbox fields',
  'Draft vs published form state',
  'Public share link flow',
  'Response collection and submission table',
  'Basic visits and submissions stats',
  'Published forms list and form actions',
  'Starter TSPL form templates',
];

const pendingGroups = [
  {
    title: 'Builder upgrades',
    items: [
      'File upload',
      'Digital signature',
      'Rating and scale questions',
      'Image, video, and section headers',
      'Conditional logic',
      'Duplicate form from existing',
      'Save as draft and advanced validation',
    ],
  },
  {
    title: 'Enterprise access',
    items: [
      'Employee login integration',
      'Role-based access control',
      'Department-wise restrictions',
      'Branch-wise restrictions',
      'One response per user enforcement',
      'Start and end dates',
      'Response limits',
      'Approval routing by form',
    ],
  },
  {
    title: 'Workflow and notifications',
    items: [
      'Manager approval',
      'HR approval',
      'Multi-level approval chain',
      'Pending approvals queue',
      'Notification engine',
      'Email integration',
      'WhatsApp integration',
      'SMS integration',
    ],
  },
  {
    title: 'Reporting and governance',
    items: [
      'Response search and filters',
      'Sort by any field',
      'Edit or delete response',
      'Excel, CSV, and PDF export',
      'Bulk download',
      'Audit trail',
      'Custom report builder',
      'Scheduled reports',
    ],
  },
];

const sections = [
  {
    title: '1. Form Builder',
    items: [
      'Drag and drop form creation',
      'Text, number, email, phone, dropdown, checkbox, radio, date, time, file upload',
      'Rating, scale, signature, image, video, and section headers',
      'Required fields, validation, conditional logic, preview, duplicate, and draft save',
    ],
  },
  {
    title: '2. Form Sharing',
    items: [
      'Public shareable links',
      'Login-required employee forms',
      'Department and branch restrictions',
      'QR codes, embeds, start/end dates, response limits, and one-response enforcement',
    ],
  },
  {
    title: '3. Response Management',
    items: [
      'Real-time response collection',
      'Search, filter, sort, edit, and delete responses',
      'Detail view, bulk download, Excel, CSV, and PDF export',
      'Response history and audit trail',
    ],
  },
  {
    title: '4. Company-Specific Features',
    items: [
      'Employee login integrated with company credentials',
      'Role-based access for Admin, HR, Manager, and Employee',
      'Department-wise and branch-wise access control',
      'Multi-level approvals, notifications, WhatsApp/SMS/email, and employee master-data autofill',
    ],
  },
  {
    title: '5. Dashboard & Reports',
    items: [
      'Total forms, total responses, and pending approvals',
      'Department-wise breakdown and response trends',
      'Charts, graphs, exportable reports, and custom report builder',
      'Scheduled and automated reports',
    ],
  },
];

const rollout = [
  'Phase 1: Core builder, sharing, responses, QR, and exports',
  'Phase 2: Employee login, access control, and master-data autofill',
  'Phase 3: Approval workflows, notifications, and audit trail',
  'Phase 4: Advanced analytics, report builder, and automation',
];

export default function PlatformPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="inline-flex rounded-full border bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          TSPL Group platform scope
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            TSPL Forms & Workflow Platform
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            This page captures the full product scope requested for TSPL Group: a secure internal platform for form creation, employee workflows, approvals, and reporting.
          </p>
        </div>

        <Card>
          <CardHeader className="text-xl font-semibold">Why this is different</CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>It is not only a Google Forms-style builder. It is designed for internal TSPL operations.</p>
            <p>It connects forms to employee data, departments, branches, and approval routing.</p>
            <p>It keeps data inside TSPL infrastructure instead of depending on external form tools.</p>
            <p>It supports management reporting, scheduled insights, and platform governance.</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="text-xl font-semibold">Live in the app now</CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {liveNow.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-xl font-semibold">What still needs product updates</CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-3">
                The remaining items are grouped below so the implementation work is visible and can be tracked by module.
              </p>
              <p>
                Current status: 12 items are partially reflected in the app, while the remaining capabilities still need real workflow, access, and reporting features.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="text-lg font-semibold">{section.title}</CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="grid gap-4 lg:grid-cols-2">
          {pendingGroups.map((group) => (
            <Card key={group.title}>
              <CardHeader className="text-lg font-semibold">{group.title}</CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="text-xl font-semibold">Recommended rollout plan</CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {rollout.map((phase) => (
              <div key={phase} className="rounded-lg border p-4">
                {phase}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}