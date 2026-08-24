import { GetFormStats } from '@/app/actions/form';
import { EyeIcon, LogOut, MousePointerClick, StickyNoteIcon } from 'lucide-react';
import CardStat from './CardStat';

interface Props {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

export default function StatsCard({ data, loading }: Props) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
      <CardStat
        title="Form Views"
        icon={<EyeIcon className='h-4 w-4 text-sky-500' />}
        text="Total form opens across the platform"
        value={data?.visits.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-sky-500/20 drop-shadow-sm'
      />
      <CardStat
        title="Responses Received"
        icon={<StickyNoteIcon className='h-4 w-4 text-amber-500' />}
        text="All-time responses collected"
        value={data?.submissions.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-amber-500/20 drop-shadow-sm'
      />
      <CardStat
        title="Conversion Rate"
        icon={<MousePointerClick className='h-4 w-4 text-emerald-500' />}
        text="Views that resulted in a response"
        value={data ? `${data.submissionsRate.toLocaleString()}%` : '0%'}
        loading={loading}
        className='shadow-emerald-500/20 drop-shadow-sm'
      />
      <CardStat
        title="Drop-off Rate"
        icon={<LogOut className='h-4 w-4 text-rose-500' />}
        text="Views that ended without a response"
        value={data ? `${data.bounceRate.toLocaleString()}%` : '0%'}
        loading={loading}
        className='shadow-rose-500/20 drop-shadow-sm'
      />
    </div>
  );
}
