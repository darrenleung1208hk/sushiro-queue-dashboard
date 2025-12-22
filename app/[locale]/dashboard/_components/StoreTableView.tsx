import { useTranslations, useLocale } from 'next-intl';
import { Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';
import { QUEUE_PRIORITY } from '@/lib/constants';
import { cn, getQueuePriority } from '@/lib/utils';

interface StoreTableViewProps {
  stores: Store[];
  isLoading?: boolean;
}

export const StoreTableView = ({
  stores,
  isLoading = false,
}: StoreTableViewProps) => {
  const t = useTranslations();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.store')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.region')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.area')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('table.status')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('store.waiting')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('store.current')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('store.currentQueue')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-28" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                {t('table.store')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                {t('table.region')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                {t('table.area')}
              </th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                {t('table.status')}
              </th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                {t('store.waiting')}
              </th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                {t('store.current')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                {t('store.currentQueue')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stores.map((store) => {
              const isOpen = store.storeStatus === 'OPEN';
              const storeName = locale === 'zh-HK' ? store.name : store.nameEn;
              const waitTier = getQueuePriority(store.waitingGroup);
              const queueLength = store.storeQueue.length;

              return (
                <tr
                  key={store.shopId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {storeName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t(`common.regions.${store.region}`)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t(`common.areas.${store.area}`)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={isOpen ? 'default' : 'destructive'}
                      className="text-[10px] px-1.5 py-0.5 h-5"
                    >
                      {t(`store.status.${store.storeStatus.toLowerCase()}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
                        waitTier === QUEUE_PRIORITY.HIGH &&
                          'bg-destructive/10 text-destructive',
                        waitTier === QUEUE_PRIORITY.MEDIUM &&
                          'bg-warning/10 text-warning',
                        waitTier === QUEUE_PRIORITY.LOW &&
                          'bg-success/10 text-primary'
                      )}
                    >
                      <Users className="h-3 w-3" />
                      <span className="font-semibold">
                        {store.waitingGroup}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-foreground">
                    {queueLength > 0 ? `#${store.storeQueue[0]}` : '--'}
                  </td>
                  <td className="px-4 py-3">
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
                              {t('store.moreTickets', {
                                count: queueLength - 3,
                              })}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
