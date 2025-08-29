import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from './StoreCard';

interface StoreListItemProps {
  store: Store;
}

export const StoreListItem = ({ store }: StoreListItemProps) => {
  const isOpen = store.storeStatus === 'OPEN';
  const queueLength = store.storeQueue.length;
  const hasHighWait = store.waitingGroup >= 20;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border shadow-sm bg-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-4 min-w-0 overflow-x-auto">
          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {store.name}
              </h3>
              <Badge
                variant={isOpen ? 'default' : 'destructive'}
                className="shrink-0 text-xs"
              >
                {store.storeStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {store.area}, {store.region}
            </p>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-6 text-sm shrink-0">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Waiting</p>
              </div>
              <p
                className={cn(
                  'font-semibold text-sm',
                  hasHighWait ? 'text-destructive' : 'text-foreground'
                )}
              >
                {store.waitingGroup}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <p className="font-semibold text-sm text-foreground">
                {queueLength > 0 ? `#${store.storeQueue[0]}` : '--'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
