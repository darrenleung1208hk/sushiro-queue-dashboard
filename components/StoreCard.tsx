import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from '@/lib/types';

interface StoreCardProps {
  store: Store;
}

export const StoreCard = ({ store }: StoreCardProps) => {
  const isOpen = store.storeStatus === 'OPEN';
  const queueLength = store.storeQueue.length;
  const waitingGroup = store.waitingGroup;

  // 3-tier waiting system
  const getWaitTier = (waiting: number) => {
    if (waiting <= 15) return 'low';
    if (waiting <= 30) return 'medium';
    return 'high';
  };

  const waitTier = getWaitTier(waitingGroup);

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-border shadow-sm bg-card">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-1">
          <div className="space-y-1">
            <h3 className="font-semibold leading-tight text-foreground">
              {store.name}
            </h3>
            <p className="text-xs text-muted-foreground">{store.nameEn}</p>
          </div>
          <Badge
            variant={isOpen ? 'default' : 'destructive'}
            className="shrink-0 text-[10px] px-1.5 py-0.5 h-5"
          >
            {store.storeStatus}
          </Badge>
        </div>

        <div className="space-y-2">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={cn(
                'flex items-center gap-2 p-1.5 rounded-md border',
                waitTier === 'high' &&
                  'bg-destructive/10 border-destructive/20',
                waitTier === 'medium' && 'bg-warning/10 border-warning/20',
                waitTier === 'low' && 'bg-success/10 border-success/20'
              )}
            >
              <Users
                className={cn(
                  'h-3 w-3',
                  waitTier === 'high' && 'text-destructive',
                  waitTier === 'medium' && 'text-warning',
                  waitTier === 'low' && 'text-primary'
                )}
              />
              <div>
                <p className="text-[10px] text-muted-foreground">Waiting</p>
                <p
                  className={cn(
                    'font-semibold text-sm',
                    waitTier === 'high' && 'text-destructive',
                    waitTier === 'medium' && 'text-warning',
                    waitTier === 'low' && 'text-foreground'
                  )}
                >
                  {waitingGroup}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-md bg-accent/30 border border-border">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Current</p>
                <p className="font-semibold text-sm text-foreground">
                  {store.storeQueue.length > 0
                    ? `#${store.storeQueue[0]}`
                    : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Details - Always show for consistent layout */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              Current Queue
            </p>
            <div className="flex flex-wrap gap-1">
              {queueLength > 0 ? (
                <>
                  {store.storeQueue.slice(0, 3).map((ticket, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-5"
                    >
                      #{ticket}
                    </Badge>
                  ))}
                  {queueLength > 3 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-5"
                    >
                      +{queueLength - 3} more
                    </Badge>
                  )}
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 h-5 text-muted-foreground"
                >
                  No tickets
                </Badge>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 pt-2 border-t border-border">
            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">
                {store.region} • {store.area}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
