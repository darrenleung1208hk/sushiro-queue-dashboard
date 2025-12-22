import { useTranslations, useLocale } from 'next-intl';
import { Clock, Users, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';
import { QUEUE_PRIORITY } from '@/lib/constants';
import { cn, getQueuePriority } from '@/lib/utils';

type StoreCardProps =
  | { store: Store; isLoading?: false }
  | { isLoading: true; store?: undefined };

export const StoreCard = ({ store, isLoading }: StoreCardProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const isOpen = store?.storeStatus === 'OPEN';
  const queueLength = store?.storeQueue.length ?? 0;
  const waitingGroup = store?.waitingGroup;

  // Get localized store name based on current locale
  const storeName = locale === 'zh-HK' ? store?.name : store?.nameEn;
  const waitTier = getQueuePriority(waitingGroup ?? 0);

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-border shadow-sm bg-card">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-4 w-28 my-1" />
            ) : (
              <h3 className="font-semibold text-foreground">{storeName}</h3>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-10" />
          ) : (
            <Badge
              variant={isOpen ? 'default' : 'destructive'}
              className="shrink-0 text-[10px] px-1.5 py-0.5 h-5"
            >
              {t(`store.status.${store.storeStatus.toLowerCase()}`)}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={cn(
                'flex items-center gap-2 p-1.5 rounded-md border',
                waitTier === QUEUE_PRIORITY.HIGH &&
                  'bg-destructive/10 border-destructive/20',
                waitTier === QUEUE_PRIORITY.MEDIUM &&
                  'bg-warning/10 border-warning/20',
                waitTier === QUEUE_PRIORITY.LOW &&
                  'bg-success/10 border-success/20'
              )}
            >
              <Users
                className={cn(
                  'h-3 w-3',
                  waitTier === QUEUE_PRIORITY.HIGH && 'text-destructive',
                  waitTier === QUEUE_PRIORITY.MEDIUM && 'text-warning',
                  waitTier === QUEUE_PRIORITY.LOW && 'text-primary'
                )}
              />
              <div>
                <p className="text-[10px] text-muted-foreground">
                  {t('store.waiting')}
                </p>
                <p
                  className={cn(
                    'font-semibold text-sm',
                    waitTier === QUEUE_PRIORITY.HIGH && 'text-destructive',
                    waitTier === QUEUE_PRIORITY.MEDIUM && 'text-warning',
                    waitTier === QUEUE_PRIORITY.LOW && 'text-foreground'
                  )}
                >
                  {isLoading ? '--' : waitingGroup}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-md bg-accent/30 border border-border">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">
                  {t('store.current')}
                </p>
                <p className="font-semibold text-sm text-foreground">
                  {!isLoading && store.storeQueue.length > 0
                    ? `#${store.storeQueue[0]}`
                    : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Details */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">
              {t('store.currentQueue')}
            </p>
            <div className="flex flex-wrap gap-1">
              {isLoading ? (
                <Skeleton className="h-[20px] w-28" />
              ) : queueLength > 0 ? (
                store.storeQueue.slice(0, 3).map((ticket, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 h-5"
                  >
                    #{ticket}
                  </Badge>
                ))
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

          {/* Location */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            {isLoading ? (
              <Skeleton className="h-[15px] w-40" />
            ) : (
              <div>
                <p className="text-[10px] text-muted-foreground">
                  {t(`common.regions.${store.region}`)} •{' '}
                  {t(`common.areas.${store.area}`)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
