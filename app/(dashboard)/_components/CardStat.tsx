import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  title: string;
  icon: React.ReactNode;
  text: string;
  value: string;
  loading: boolean;
  className?: string;
}

export default function CardStat({
  title,
  icon,
  text,
  value,
  loading,
  className,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-3.5 pb-1 gap-1">
        <CardTitle className="text-[11px] sm:text-xs font-semibold text-muted-foreground truncate">
          {title}
        </CardTitle>
        <div className="shrink-0">{icon}</div>
      </CardHeader>
      <CardContent className="p-3 sm:p-3.5 pt-0">
        <div className="text-base sm:text-xl font-bold tracking-tight">
          {loading && (
            <Skeleton className="w-12 sm:w-14 h-5 sm:h-6">
              <span className="opacity-0">0</span>
            </Skeleton>
          )}
          {!loading && value}
        </div>
        <p className="pt-0.5 sm:pt-1 text-[10px] sm:text-[11px] font-medium text-muted-foreground line-clamp-1">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}
