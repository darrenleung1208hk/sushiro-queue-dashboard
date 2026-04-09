'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  QUEUE_SNAPSHOT_STATUS,
  QueueApiResponse,
  QueueGroups,
  QueueItem,
  QueueSnapshotMeta,
  QueueSnapshotStatus,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const AUTO_REFRESH_INTERVAL_MS = 30000;

interface QueueRowProps {
  item: QueueItem;
  statusText: string;
  tone: 'available' | 'low' | 'busy' | 'invalid';
  emphasized?: boolean;
}

interface QueueGroupProps {
  title: string;
  count: number;
  items: QueueItem[];
  emptyText: string;
  getStatusText: (item: QueueItem) => string;
}

function getRowTone(item: QueueItem): QueueRowProps['tone'] {
  if (item.queueCount === null) {
    return 'invalid';
  }

  if (item.queueCount === 0) {
    return 'available';
  }

  if (item.queueCount <= 15) {
    return 'low';
  }

  return 'busy';
}

function getRowClasses(tone: QueueRowProps['tone'], emphasized: boolean) {
  if (tone === 'available') {
    return cn(
      'border-success/25 bg-success/10',
      emphasized && 'border-success/35 bg-success/12'
    );
  }

  if (tone === 'invalid') {
    return 'border-border bg-background/60 opacity-70';
  }

  return cn(
    'border-border bg-background',
    emphasized && 'border-border/80 bg-background/90'
  );
}

function getValueText(item: QueueItem): string | null {
  if (item.queueCount === null) {
    return '--';
  }

  return item.queueCount.toString();
}

function QueueRow({
  item,
  statusText,
  tone,
  emphasized = false,
}: QueueRowProps) {
  const valueText = getValueText(item);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border px-4 py-3',
        getRowClasses(tone, emphasized)
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            tone === 'available' ? 'text-success' : 'text-foreground'
          )}
        >
          {item.name}
        </p>
        <p
          className={cn(
            'mt-1 text-sm',
            tone === 'available' ? 'text-success/90' : 'text-muted-foreground'
          )}
        >
          {statusText}
        </p>
      </div>

      {valueText !== null && (
        <div
          className={cn(
            'shrink-0 text-right text-lg font-semibold tabular-nums',
            tone === 'available' ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {valueText}
        </div>
      )}
    </div>
  );
}

function QueueGroup({
  title,
  count,
  items,
  emptyText,
  getStatusText,
}: QueueGroupProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <QueueRow
              key={`${title}-${item.name}-${index}`}
              item={item}
              statusText={getStatusText(item)}
              tone={getRowTone(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function QueueListSkeleton({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'rounded-xl border px-4 py-3',
            emphasized ? 'border-success/20 bg-success/5' : 'border-border bg-card'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function createEmptyGroups(): QueueGroups {
  return {
    available: [],
    low: [],
    busy: [],
    unavailable: [],
  };
}

function createEmptyMeta(): QueueSnapshotMeta {
  return {
    totalStores: 0,
    successfulQueueFetches: 0,
    failedQueueFetches: 0,
  };
}

export default function DashboardPage() {
  const t = useTranslations('dashboardQueue');
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [recommendedQueues, setRecommendedQueues] = useState<QueueItem[]>([]);
  const [queueGroups, setQueueGroups] = useState<QueueGroups>(createEmptyGroups);
  const [snapshotStatus, setSnapshotStatus] = useState<QueueSnapshotStatus>(
    QUEUE_SNAPSHOT_STATUS.SUCCESS
  );
  const [meta, setMeta] = useState<QueueSnapshotMeta>(createEmptyMeta);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const hasDataRef = useRef(false);

  const fetchQueues = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    const hasExistingData = hasDataRef.current;

    try {
      isFetchingRef.current = true;
      setErrorMessage(null);

      if (hasExistingData) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch('/api/queues', { cache: 'no-store' });
      const payload = (await response.json()) as QueueApiResponse;

      setQueues(payload.data);
      setRecommendedQueues(payload.recommended);
      setQueueGroups(payload.groups);
      setSnapshotStatus(payload.status);
      setMeta(payload.meta);
      hasDataRef.current = payload.data.length > 0;
      setUpdatedAt(payload.updatedAt ? new Date(payload.updatedAt) : null);

      if (!response.ok && payload.status !== QUEUE_SNAPSHOT_STATUS.UNAVAILABLE) {
        throw new Error(`Queue API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching queues:', error);
      setSnapshotStatus(QUEUE_SNAPSHOT_STATUS.UNAVAILABLE);
      setMeta(createEmptyMeta());
      setErrorMessage(t('error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    void fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchQueues();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchQueues]);

  const eligibleCount =
    queueGroups.available.length +
    queueGroups.low.length +
    queueGroups.busy.length;
  const recommendedImmediateCount = recommendedQueues.filter(
    (queue) => queue.queueCount === 0
  ).length;
  const additionalImmediateCount = Math.max(
    0,
    queueGroups.available.length - recommendedImmediateCount
  );
  const hasImmediateRecommendations = recommendedImmediateCount > 0;
  const hasRecommendedQueues = recommendedQueues.length > 0;
  const recommendationCountLabel =
    eligibleCount > 0
      ? `${recommendedQueues.length}/${eligibleCount}`
      : '0';

  const showBlockingUnavailable =
    !isLoading && snapshotStatus === QUEUE_SNAPSHOT_STATUS.UNAVAILABLE;
  const showPartialNotice =
    snapshotStatus === QUEUE_SNAPSHOT_STATUS.PARTIAL &&
    meta.failedQueueFetches > 0 &&
    !showBlockingUnavailable;
  const showInlineError =
    errorMessage !== null &&
    queues.length > 0 &&
    snapshotStatus !== QUEUE_SNAPSHOT_STATUS.PARTIAL;

  const getStatusText = useCallback(
    (item: QueueItem) => {
      if (item.recommendationState === 'UNAVAILABLE') {
        return t('queueUnavailableStatus');
      }

      if (item.storeStatus === 'CLOSED') {
        return t('closedStatus');
      }

      if (item.storeStatus === 'MAINTENANCE') {
        return t('maintenanceStatus');
      }

      if (item.queueCount === null) {
        return t('invalid');
      }

      if (item.queueCount === 0) {
        return t('availableNowStatus');
      }

      if (item.queueCount <= 15) {
        return t('lowStatus');
      }

      return t('busyStatus');
    },
    [t]
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-10 pt-4 sm:pt-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('liveMonitor')}
          </p>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t('title')}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {t('updatedAtLabel')}:{' '}
              {updatedAt ? updatedAt.toLocaleTimeString() : t('loading')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              onClick={() => {
                void fetchQueues();
              }}
              disabled={isLoading || isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  (isLoading || isRefreshing) && 'animate-spin'
                )}
              />
              <span>{isRefreshing ? t('refreshing') : t('refresh')}</span>
            </Button>

            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {showBlockingUnavailable ? (
        <Card className="border border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {t('unavailableTitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {errorMessage ?? t('unavailableHint')}
              </p>
            </div>
            <Button
              onClick={() => {
                void fetchQueues();
              }}
            >
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {showPartialNotice && (
            <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">{t('partialDataTitle')}</p>
              <p className="mt-1">
                {t('partialDataMessage', {
                  count: meta.failedQueueFetches,
                })}
              </p>
            </div>
          )}

          {showInlineError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <section className="space-y-3 rounded-2xl border border-success/20 bg-success/5 p-4 sm:p-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-success">
                  {hasImmediateRecommendations
                    ? t('availableNow')
                    : t('bestOptions')}
                </h2>
                <span className="text-xs text-success/80">
                  {recommendationCountLabel}
                </span>
              </div>
              <p className="text-sm text-success/90">
                {hasImmediateRecommendations
                  ? t('availableNowHint')
                  : t('bestOptionsHint')}
              </p>
              {showPartialNotice && (
                <p className="text-xs text-success/80">
                  {t('recommendationsPartialHint')}
                </p>
              )}
              {hasImmediateRecommendations && additionalImmediateCount > 0 && (
                <p className="text-xs text-success/80">
                  {t('moreAvailableHint', { count: additionalImmediateCount })}
                </p>
              )}
            </div>

            {isLoading ? (
              <QueueListSkeleton emphasized />
            ) : hasRecommendedQueues ? (
              <div className="space-y-2">
                {recommendedQueues.map((item, index) => (
                  <QueueRow
                    key={`recommended-${item.name}-${index}`}
                    item={item}
                    statusText={getStatusText(item)}
                    tone={getRowTone(item)}
                    emphasized
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-success/30 px-4 py-5 text-sm text-success/90">
                {t('noRecommendedStores')}
              </div>
            )}
          </section>

          <div className="space-y-4">
            {isLoading ? (
              <>
                <QueueListSkeleton />
                <QueueListSkeleton />
                <QueueListSkeleton />
              </>
            ) : (
              <>
                <QueueGroup
                  title={t('availableGroup')}
                  count={queueGroups.available.length}
                  items={queueGroups.available}
                  emptyText={t('emptyGroup')}
                  getStatusText={getStatusText}
                />
                <QueueGroup
                  title={t('lowGroup')}
                  count={queueGroups.low.length}
                  items={queueGroups.low}
                  emptyText={t('emptyGroup')}
                  getStatusText={getStatusText}
                />
                <QueueGroup
                  title={t('busyGroup')}
                  count={queueGroups.busy.length}
                  items={queueGroups.busy}
                  emptyText={t('emptyGroup')}
                  getStatusText={getStatusText}
                />
                {queueGroups.unavailable.length > 0 && (
                  <QueueGroup
                    title={t('unavailableGroup')}
                    count={queueGroups.unavailable.length}
                    items={queueGroups.unavailable}
                    emptyText={t('emptyGroup')}
                    getStatusText={getStatusText}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
