import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Store {
  shopId: number;
  storeStatus: string;
  waitingGroup: number;
  storeQueue: string[];
  timestamp: string;
  name: string;
  nameEn: string;
  address: string;
  region: string;
  area: string;
}

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
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border shadow-sm bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight text-foreground">
              {store.name}
            </h3>
            <p className="text-sm text-muted-foreground">{store.nameEn}</p>
          </div>
          <Badge
            variant={isOpen ? 'default' : 'destructive'}
            className="shrink-0"
          >
            {store.storeStatus}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border',
                waitTier === 'high' &&
                  'bg-destructive/10 border-destructive/20',
                waitTier === 'medium' && 'bg-warning/10 border-warning/20',
                waitTier === 'low' && 'bg-success/10 border-success/20'
              )}
            >
              <Users
                className={cn(
                  'h-4 w-4',
                  waitTier === 'high' && 'text-destructive',
                  waitTier === 'medium' && 'text-warning',
                  waitTier === 'low' && 'text-primary'
                )}
              />
              <div>
                <p className="text-xs text-muted-foreground">Waiting</p>
                <p
                  className={cn(
                    'font-semibold',
                    waitTier === 'high' && 'text-destructive',
                    waitTier === 'medium' && 'text-warning',
                    waitTier === 'low' && 'text-foreground'
                  )}
                >
                  {waitingGroup}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/30 border border-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="font-semibold text-foreground">
                  {store.storeQueue.length > 0
                    ? `#${store.storeQueue[0]}`
                    : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Details */}
          {queueLength > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Current Queue
              </p>
              <div className="flex flex-wrap gap-1">
                {store.storeQueue.slice(0, 3).map((ticket, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{ticket}
                  </Badge>
                ))}
                {queueLength > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{queueLength - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-2 pt-4 border-t border-border">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {store.region} • {store.area}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {store.address}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
