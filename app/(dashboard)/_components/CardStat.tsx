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
      <CardHeader className="flex flex-row items-center justify-between p-3.5 pb-1">
        <CardTitle className="text-xs font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-3.5 pt-0">
        <div className="text-lg font-bold">
          {loading && (
            <Skeleton className="w-14">
              <span className="opacity-0">0</span>
            </Skeleton>
          )}
          {!loading && value}
        </div>
        <p className="pt-1 text-[11px] font-medium text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
