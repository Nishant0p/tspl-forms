import { GetForm, GetFormStats } from '@/app/actions/form';
import { getCurrentEmployee } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import StatsCard from '../_components/StatsCard';
import { Suspense } from 'react';
import CreateFormBtn from '../_components/CreateFormBtn';
import FormCardSkeleton from '../_components/FormCardSkeleton';
import FormCards from '../_components/FormCards';

export default async function DashboardPage() {
  const employee = await getCurrentEmployee();
  const isFormViewer = employee?.role === 'FORM_VIEWER';

  if (isFormViewer) {
    const userForms = await GetForm();
    if (userForms.length === 1) {
      redirect(`/forms/${userForms[0].id}`);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
      {/* CardStatsWrapper */}
      <Suspense fallback={<StatsCard loading={true} />}>
        <CardStatsWrapper />
      </Suspense>

      {/* Header and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1 sm:pt-2">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            {isFormViewer ? 'My Assigned Forms' : 'Published Forms'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isFormViewer
              ? 'Forms assigned to your account for response review'
              : 'Create, manage, and analyze all operational forms'}
          </p>
        </div>
        {!isFormViewer && (
          <div className="w-full sm:w-auto">
            <CreateFormBtn />
          </div>
        )}
      </div>

      <Separator className="my-2 sm:my-4" />

      {/* Forms Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Suspense
          fallback={[...Array(4)].map((_, i) => (
            <FormCardSkeleton key={i} />
          ))}>
          <FormCards />
        </Suspense>
      </div>
    </div>
  );
}

async function CardStatsWrapper() {
  try {
    const stats = await GetFormStats();
    return (
      <StatsCard
        loading={false}
        data={stats}
      />
    );
  } catch (error) {
    console.error('Failed to load dashboard stats', error);
  }

  return (
    <StatsCard
      loading={false}
      data={{
        visits: 0,
        submissions: 0,
        submissionsRate: 0,
        bounceRate: 0,
      }}
    />
  );
}