import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MapPin } from 'lucide-react';

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
  const hasHighWait = store.waitingGroup > 50;

  const getStatusVariant = () => {
    if (!isOpen) return 'destructive';
    if (hasHighWait) return 'secondary';
    return 'default';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight text-foreground">
              {store.name}
            </h3>
            <p className="text-sm text-muted-foreground">{store.nameEn}</p>
          </div>
          <Badge variant={getStatusVariant()} className="shrink-0">
            {store.storeStatus}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Waiting</p>
                <p className="font-semibold text-foreground">
                  {store.waitingGroup}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Queue</p>
                <p className="font-semibold text-foreground">{queueLength}</p>
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
          <div className="flex items-start gap-2 pt-2 border-t border-border">
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

          {/* Timestamp */}
          <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
            <span>Last updated: {formatTime(store.timestamp)}</span>
            <span>ID: {store.shopId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
