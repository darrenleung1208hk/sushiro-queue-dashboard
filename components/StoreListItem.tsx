import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from './StoreCard';

interface StoreListItemProps {
  store: Store;
  isCompact?: boolean;
}

export const StoreListItem = ({ store, isCompact = false }: StoreListItemProps) => {
  const isOpen = store.storeStatus === 'OPEN';
  const queueLength = store.storeQueue.length;
  const hasHighWait = store.waitingGroup >= 20;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-border shadow-sm bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {store.name}
              </h3>
              <Badge
                variant={isOpen ? 'default' : 'destructive'}
                className="shrink-0"
              >
                {store.storeStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {store.area}, {store.region}
            </p>
            {!isCompact && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {store.address}
              </p>
            )}
          </div>
          
          {/* Metrics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Waiting</p>
              </div>
              <p className={cn(
                'font-semibold',
                hasHighWait ? 'text-destructive' : 'text-foreground'
              )}>
                {store.waitingGroup}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Queue</p>
              </div>
              <p className="font-semibold text-foreground">
                {queueLength}
              </p>
            </div>
          </div>
        </div>

        {/* Queue Details - Show on hover or always for compact */}
        {queueLength > 0 && (
          <div className={cn(
            'mt-3 pt-3 border-t border-border',
            isCompact ? 'block' : 'group-hover:block hidden'
          )}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Current Queue:
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
