import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  title: string;
  icon: React.ReactNode;
  text: string;
  value: string;
  loading: boolean;
  className?: string;
  trend?: number;
  sparkColor?: string;
  iconBg?: string;
  /** Real data points for sparkline — passed from server */
  sparkPoints?: number[];
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;
  const W = 120;
  const H = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const toY = (v: number) => H - ((v - min) / range) * (H - 4) - 2;
  const stepX = W / (points.length - 1);
  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-9"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CardStat({
  title,
  icon,
  text,
  value,
  loading,
  className,
  trend,
  sparkColor = '#3b82f6',
  iconBg = 'bg-blue-50',
  sparkPoints,
}: Props) {
  const isUp = trend === undefined ? true : trend >= 0;
  const trendLabel =
    trend !== undefined ? `${isUp ? '▲' : '▼'} ${Math.abs(trend).toFixed(1)}%` : null;

  return (
    <Card
      className={`overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow ${className ?? ''}`}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col gap-2">
        {/* Top row: icon + trend badge */}
        <div className="flex items-start justify-between">
          <div
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full ${iconBg}`}
          >
            {icon}
          </div>
          {trendLabel && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isUp
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {trendLabel}
            </span>
          )}
        </div>

        {/* Value + title */}
        <div>
          {loading ? (
            <Skeleton className="w-16 h-5 mb-1" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {value}
            </div>
          )}
          <div className="mt-0.5 text-xs font-semibold text-foreground/80">{title}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{text}</div>
        </div>

        {/* Sparkline */}
        <div className="mt-auto -mx-1 min-h-[28px]">
          {loading ? (
            <Skeleton className="w-full h-7" />
          ) : sparkPoints && sparkPoints.length >= 2 ? (
            <Sparkline points={sparkPoints} color={sparkColor} />
          ) : (
            <svg viewBox="0 0 120 28" className="w-full h-7" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 0 14 L 120 14" fill="none" stroke={sparkColor} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
            </svg>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
