import { GetFormStats } from '@/app/actions/form';
import { EyeIcon, LogOut, MousePointerClick, StickyNoteIcon } from 'lucide-react';
import CardStat from './CardStat';

interface Props {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

export default function StatsCard({ data, loading }: Props) {
  return (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <CardStat
        title="Form Views"
        icon={<EyeIcon className='h-4 w-4 text-sky-500' />}
        text="Total form opens"
        value={data?.visits.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-sky-500/10 dark:shadow-sky-500/5'
      />
      <CardStat
        title="Responses"
        icon={<StickyNoteIcon className='h-4 w-4 text-amber-500' />}
        text="All-time responses"
        value={data?.submissions.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-amber-500/10 dark:shadow-amber-500/5'
      />
      <CardStat
        title="Conversion"
        icon={<MousePointerClick className='h-4 w-4 text-emerald-500' />}
        text="Submitted rate"
        value={data ? `${data.submissionsRate.toLocaleString()}%` : '0%'}
        loading={loading}
        className='shadow-emerald-500/10 dark:shadow-emerald-500/5'
      />
      <CardStat
        title="Drop-off"
        icon={<LogOut className='h-4 w-4 text-rose-500' />}
        text="Bounce rate"
        value={data ? `${data.bounceRate.toLocaleString()}%` : '0%'}
        loading={loading}
        className='shadow-rose-500/10 dark:shadow-rose-500/5'
      />
    </div>
  );
}
