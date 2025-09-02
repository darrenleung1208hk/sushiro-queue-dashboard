import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Store } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';

interface StoreListItemProps {
  store: Store;
}

export const StoreListItem = ({ store }: StoreListItemProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const isOpen = store.storeStatus === 'OPEN';
  const queueLength = store.storeQueue.length;
  const waitingGroup = store.waitingGroup;

  // Get localized store name based on current locale
  const storeName = locale === 'zh-HK' ? store.name : store.nameEn;

  // 3-tier waiting system
  const getWaitTier = (waiting: number) => {
    if (waiting <= 15) return 'low';
    if (waiting <= 30) return 'medium';
    return 'high';
  };

  const waitTier = getWaitTier(waitingGroup);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border shadow-sm bg-card">
      <CardContent className="p-3">
        <div className="flex items-center gap-4 min-w-0 overflow-x-auto">
          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {storeName}
              </h3>
              <Badge
                variant={isOpen ? 'default' : 'destructive'}
                className="shrink-0 text-[10px] px-1.5 py-0.5 h-5"
              >
                {store.storeStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {t(`common.areas.${store.area}`)},{' '}
              {t(`common.regions.${store.region}`)}
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-1.5 rounded-md border text-center',
                waitTier === 'high' &&
                  'bg-destructive/10 border-destructive/20',
                waitTier === 'medium' && 'bg-warning/10 border-warning/20',
                waitTier === 'low' && 'bg-success/10 border-success/20'
              )}
            >
              <div className="flex items-center gap-1 text-center">
                <Users
                  className={cn(
                    'h-3 w-3',
                    waitTier === 'high' && 'text-destructive',
                    waitTier === 'medium' && 'text-warning',
                    waitTier === 'low' && 'text-primary'
                  )}
                />
                <p className="text-[10px] text-muted-foreground">
                  {t('store.waiting')}
                </p>
              </div>
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
            <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-md bg-accent/30 border border-border text-center">
              <div className="flex items-center gap-1 text-center">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">
                  {t('store.current')}
                </p>
              </div>
              <p className="font-semibold text-sm text-foreground">
                {queueLength > 0 ? `#${store.storeQueue[0]}` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Current Queue - Always show for consistent layout */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-muted-foreground">
              {t('store.currentQueue')}
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
                      {t('store.moreTickets', { count: queueLength - 3 })}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 h-5 text-muted-foreground"
                >
                  {t('store.noTickets')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
