import { GetFormStats } from '@/app/actions/form';
import { EyeIcon, LogOut, MousePointerClick, StickyNoteIcon } from 'lucide-react';
import CardStat from './CardStat';

interface Props {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

export default function StatsCard({ data, loading }: Props) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-2 lg:grid-cols-4">
      <CardStat
        title="Form Views"
        icon={<EyeIcon className='h-6 w-6' />}
        text="Total form opens across the platform"
        value={data?.visits.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-sky-500 drop-shadow-md'
      />
      <CardStat
        title="Responses Received"
        icon={<StickyNoteIcon className='h-6 w-6' />}
        text="All-time responses collected"
        value={data?.submissions.toLocaleString() ?? '0'}
        loading={loading}
        className='shadow-amber-500 drop-shadow-md'
      />
      <CardStat
        title="Conversion Rate"
        icon={<MousePointerClick className='h-6 w-6' />}
        text="Views that resulted in a response"
        value={data?.submissionsRate.toLocaleString() + '%' ?? '0'}
        loading={loading}
        className='shadow-green-500 drop-shadow-md'
      />
      <CardStat
        title="Drop-off Rate"
        icon={<LogOut className='h-6 w-6' />}
        text="Views that ended without a response"
        value={data?.bounceRate.toLocaleString() + '%' ?? '0'}
        loading={loading}
        className='shadow-rose-500 drop-shadow-md'
      />
    </div>
  );
}
