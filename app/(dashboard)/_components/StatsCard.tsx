import { GetFormStats, GetDashboardSparklineData } from '@/app/actions/form';
import { EyeIcon, LogOut, MousePointerClick, StickyNoteIcon } from 'lucide-react';
import CardStat from './CardStat';

interface Props {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

export default async function StatsCard({ data, loading }: Props) {
  // Fetch real sparkline data from DB (last 7 days)
  let sparkData: Awaited<ReturnType<typeof GetDashboardSparklineData>> = null;
  if (!loading) {
    try {
      sparkData = await GetDashboardSparklineData(7);
    } catch {
      sparkData = null;
    }
  }

  // Compute trend: compare last 2 days vs prior 2 days for submissions
  function computeTrend(points?: number[]): number | undefined {
    if (!points || points.length < 4) return undefined;
    const recent = points.slice(-2).reduce((a, b) => a + b, 0);
    const prior = points.slice(-4, -2).reduce((a, b) => a + b, 0);
    if (prior === 0 && recent === 0) return undefined;
    if (prior === 0) return recent > 0 ? 100 : 0;
    return parseFloat((((recent - prior) / prior) * 100).toFixed(1));
  }

  const subsTrend = computeTrend(sparkData?.submissionsPerDay);
  const visitsTrend = computeTrend(sparkData?.visitsPerDay);
  const convTrend = computeTrend(sparkData?.conversionPerDay);
  const bounceTrend = computeTrend(sparkData?.bouncePerDay);

  return (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <CardStat
        title="Form Views"
        icon={<EyeIcon className="h-4 w-4 text-sky-500" />}
        text="Total opens across the platform"
        value={data?.visits.toLocaleString() ?? '0'}
        loading={loading}
        trend={visitsTrend}
        sparkColor="#0ea5e9"
        iconBg="bg-sky-50 dark:bg-sky-950/60"
        sparkPoints={sparkData?.visitsPerDay}
        className="shadow-sky-500/10 dark:shadow-sky-500/5"
      />
      <CardStat
        title="Responses Received"
        icon={<StickyNoteIcon className="h-4 w-4 text-amber-500" />}
        text="All-time responses collected"
        value={data?.submissions.toLocaleString() ?? '0'}
        loading={loading}
        trend={subsTrend}
        sparkColor="#f59e0b"
        iconBg="bg-amber-50 dark:bg-amber-950/60"
        sparkPoints={sparkData?.submissionsPerDay}
        className="shadow-amber-500/10 dark:shadow-amber-500/5"
      />
      <CardStat
        title="Conversion Rate"
        icon={<MousePointerClick className="h-4 w-4 text-emerald-500" />}
        text="Views that resulted in a response"
        value={data ? `${data.submissionsRate.toFixed(1)}%` : '0%'}
        loading={loading}
        trend={convTrend}
        sparkColor="#10b981"
        iconBg="bg-emerald-50 dark:bg-emerald-950/60"
        sparkPoints={sparkData?.conversionPerDay}
        className="shadow-emerald-500/10 dark:shadow-emerald-500/5"
      />
      <CardStat
        title="Drop-off Rate"
        icon={<LogOut className="h-4 w-4 text-rose-500" />}
        text="Views that ended without a response"
        value={data ? `${data.bounceRate.toFixed(1)}%` : '0%'}
        loading={loading}
        trend={bounceTrend !== undefined ? -bounceTrend : undefined}
        sparkColor="#f43f5e"
        iconBg="bg-rose-50 dark:bg-rose-950/60"
        sparkPoints={sparkData?.bouncePerDay}
        className="shadow-rose-500/10 dark:shadow-rose-500/5"
      />
    </div>
  );
}
