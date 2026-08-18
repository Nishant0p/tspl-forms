import { GetFormStats } from '@/app/actions/form';
import { Separator } from '@/components/ui/separator';
import StatsCard from '../_components/StatsCard';
import { Suspense } from 'react';
import CreateFormBtn from '../_components/CreateFormBtn';
import FormCardSkeleton from '../_components/FormCardSkeleton';
import FormCards from '../_components/FormCards';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const moduleCards = [
  {
    title: 'Forms & Builder',
    description: 'Drag and drop creation, field validation, conditional logic, templates, and drafts.',
  },
  {
    title: 'Sharing & Access',
    description: 'Public links, employee-only forms, QR access, department/branch restrictions, and response limits.',
  },
  {
    title: 'Workflow & Approvals',
    description: 'Manager, HR, and admin approvals with notifications and audit trail support.',
  },
  {
    title: 'Reports & Insights',
    description: 'Department trends, response breakdowns, exports, dashboards, and scheduled reports.',
  },
];

const launchSignals = [
  'Employee login and role-based access',
  'Department and branch permissions',
  'One response per user and response limits',
  'Email, WhatsApp, and SMS notification hooks',
];

const rolloutSnapshot = [
  {
    label: 'Partially reflected',
    value: '12',
    note: 'Branding, landing content, dashboard shell, templates, and basic form flow',
  },
  {
    label: 'Still pending',
    value: '36',
    note: 'Enterprise access, approvals, advanced builder fields, and reporting workflows',
  },
];

const updateChecklist = [
  'File upload and digital signature fields',
  'Conditional logic and advanced validation',
  'Employee login with role-based access',
  'Department and branch restrictions',
  'Approval workflow with notifications',
  'QR code generation and embeddable forms',
  'Response editing, export, and audit trail',
  'Custom and scheduled reporting',
];

export default function DashboardPage() {
  return (
    <div className="container pt-4">
      <div className="mb-8 space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <Badge className="text-zinc-50">TSPL admin hub</Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">TSPL Forms & Workflow Platform</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Manage enterprise forms, employee workflows, approvals, and reporting from one internal system built for TSPL Group.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((card) => (
            <Card key={card.title} className="border-dashed">
              <CardHeader className="pb-2 text-base font-semibold">{card.title}</CardHeader>
              <CardContent className="text-sm text-muted-foreground">{card.description}</CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {launchSignals.map((signal) => (
            <div key={signal} className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
              {signal}
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {rolloutSnapshot.map((item) => (
            <Card key={item.label} className="border-dashed">
              <CardHeader className="pb-2 text-base font-semibold">{item.label}</CardHeader>
              <CardContent>
                <div className="mb-2 text-3xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CardStatsWrapper */}
      <Suspense fallback={<StatsCard loading={true} />}>
        <CardStatsWrapper />
      </Suspense>
      <h2 className="mt-10 text-4xl font-bold">Published Forms</h2>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CreateFormBtn />
        <Suspense
          fallback={[...Array(5)].map((_, i) => (
            <FormCardSkeleton key={i} />
          ))}>
          <FormCards />
        </Suspense>
      </div>

      <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="text-2xl font-bold">Pending TSPL updates</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          These are the main items that still need to be built or upgraded in the app.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {updateChecklist.map((item) => (
            <div key={item} className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function CardStatsWrapper() {
  const stats = await GetFormStats();
  return (
    <StatsCard
      loading={false}
      data={stats}
    />
  );
}