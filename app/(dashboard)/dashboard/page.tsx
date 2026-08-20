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
    <div className="container pt-4">
      {/* CardStatsWrapper */}
      <Suspense fallback={<StatsCard loading={true} />}>
        <CardStatsWrapper />
      </Suspense>
      <h2 className="mt-10 text-4xl font-bold">
        {isFormViewer ? 'My Assigned Forms' : 'Published Forms'}
      </h2>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!isFormViewer && <CreateFormBtn />}
        <Suspense
          fallback={[...Array(5)].map((_, i) => (
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