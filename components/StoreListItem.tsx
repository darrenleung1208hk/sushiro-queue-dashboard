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
      <CardContent className="p-3 sm:p-4">
        {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                {store.name}
              </h3>
              <Badge
                variant={isOpen ? 'default' : 'destructive'}
                className="shrink-0 text-xs"
              >
                {store.storeStatus}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {store.area}, {store.region}
            </p>
            {!isCompact && (
              <p className="text-xs text-muted-foreground mt-1 truncate hidden sm:block">
                {store.address}
              </p>
            )}
          </div>
          
          {/* Metrics */}
          <div className="flex items-center justify-between sm:justify-end gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Waiting</p>
              </div>
              <p className={cn(
                'font-semibold text-sm',
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
              <p className="font-semibold text-sm text-foreground">
                {queueLength}
              </p>
            </div>
          </div>
        </div>

        {/* Queue Details - Show on hover (desktop) or always (mobile) */}
        {queueLength > 0 && (
          <div className={cn(
            'mt-3 pt-3 border-t border-border',
            isCompact ? 'block' : 'block sm:group-hover:block sm:hidden'
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
