'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Store,
  Timer,
} from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueApiResponse, QueueItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const AUTO_REFRESH_INTERVAL_MS = 30000;

interface QueueRowProps {
  index: number;
  item: QueueItem;
  queueLevelLabel: string;
  groupsLabel: string;
  invalidLabel: string;
  highlighted?: boolean;
}

function getQueueLevelBadgeVariant(level: QueueItem['level']) {
  switch (level) {
    case 'LOW':
      return 'default';
    case 'MEDIUM':
      return 'secondary';
    case 'HIGH':
      return 'destructive';
    default:
      return 'outline';
  }
}

function QueueRow({
  index,
  item,
  queueLevelLabel,
  groupsLabel,
  invalidLabel,
  highlighted = false,
}: QueueRowProps) {
  const hasValidQueueCount = item.queueCount !== null;

  return (
    <div
      className={cn(
        'group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition-all duration-300',
        highlighted &&
          'border-primary/30 bg-primary/5 shadow-[0_8px_30px_hsl(var(--primary)/0.08)]',
        !hasValidQueueCount && 'opacity-75'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
          highlighted
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border text-muted-foreground'
        )}
      >
        {index + 1}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground sm:text-base">
          {item.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-muted-foreground sm:text-sm">{queueLevelLabel}</p>
          <Badge
            variant={
              hasValidQueueCount ? getQueueLevelBadgeVariant(item.level) : 'outline'
            }
            className="rounded-md px-2 py-0 text-[10px] font-medium uppercase tracking-wide"
          >
            {hasValidQueueCount ? item.level : invalidLabel}
          </Badge>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground">{groupsLabel}</p>
        <div className="text-lg font-semibold text-foreground sm:text-xl">
          {hasValidQueueCount ? item.queueCount : '--'}
        </div>
      </div>
    </div>
  );
}

function QueueListSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="ml-auto h-3 w-12" />
            <Skeleton className="ml-auto h-6 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboardQueue');
  const [queues, setQueues] = useState<QueueItem[]>([]);
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

      if (!response.ok) {
        throw new Error(`Queue API error: ${response.status}`);
      }

      const payload = (await response.json()) as QueueApiResponse;

      setQueues(payload.data);
      hasDataRef.current = payload.data.length > 0;
      setUpdatedAt(payload.updatedAt ? new Date(payload.updatedAt) : null);
    } catch (error) {
      console.error('Error fetching queues:', error);
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

  const validQueues = useMemo(
    () => queues.filter((queue) => queue.queueCount !== null),
    [queues]
  );

  const topQueues = useMemo(() => {
    if (queues.length < 3) {
      return queues.slice(0, 3);
    }

    return validQueues.slice(0, 3);
  }, [queues, validQueues]);

  const totalWaitingGroups = useMemo(
    () => validQueues.reduce((sum, queue) => sum + (queue.queueCount ?? 0), 0),
    [validQueues]
  );

  const lowestQueue = useMemo(() => {
    if (validQueues.length === 0) {
      return null;
    }

    return validQueues[0];
  }, [validQueues]);

  const showBlockingError =
    errorMessage !== null && queues.length === 0 && !isLoading;
  const showInlineError = errorMessage !== null && queues.length > 0;

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 pb-10 pt-2 sm:gap-6 sm:pt-4">
      <div className="pointer-events-none absolute inset-x-6 top-0 -z-10 h-48 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl" />

      <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/90 shadow-[0_12px_40px_hsl(var(--foreground)/0.08)] backdrop-blur">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {t('liveMonitor')}
              </p>
              <h1 className="text-xl font-semibold leading-tight text-foreground sm:text-3xl">
                {t('title')}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:gap-3">
              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {t('updatedAtLabel')}: {updatedAt ? updatedAt.toLocaleTimeString() : t('loading')}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  void fetchQueues();
                }}
                disabled={isLoading || isRefreshing}
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border/70 bg-background/70"
              >
                <RefreshCw
                  className={cn(
                    'h-3.5 w-3.5',
                    (isLoading || isRefreshing) && 'animate-spin'
                  )}
                />
                  <span className="hidden sm:inline">
                  {isRefreshing ? t('refreshing') : t('refresh')}
                </span>
              </Button>

              <LanguageSwitcher />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('branches')}
                </p>
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold leading-none text-foreground">
                {queues.length}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('waitingGroups')}
                </p>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold leading-none text-foreground">
                {totalWaitingGroups}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('bestOptionNow')}
                </p>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {lowestQueue?.name ?? '--'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lowestQueue?.queueCount ?? '--'} {t('groupsWaiting')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showBlockingError ? (
        <Card className="rounded-2xl border border-border/60 bg-card/90">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">{t('error')}</p>
              <p className="text-sm text-muted-foreground">
                {t('retryHint')}
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
          {showInlineError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{t('error')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <section className="space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('topThree')}
                </h2>
                <p className="text-xs text-muted-foreground">{t('fastPick')}</p>
              </div>

              {isLoading ? (
                <QueueListSkeleton />
              ) : topQueues.length > 0 ? (
                <div className="space-y-2.5">
                  {topQueues.map((item, index) => (
                    <QueueRow
                      key={`top-${item.name}-${index}`}
                      index={index}
                      item={item}
                      queueLevelLabel={t('queueLevel')}
                      groupsLabel={t('groups')}
                      invalidLabel={t('invalid')}
                      highlighted
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                  {t('empty')}
                </div>
              )}
            </section>

            <section className="space-y-2 lg:col-span-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fullList')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {queues.length} {t('branches')}
                </p>
              </div>

              {isLoading ? (
                <QueueListSkeleton />
              ) : queues.length > 0 ? (
                <div className="space-y-2.5">
                  {queues.map((item, index) => (
                    <QueueRow
                      key={`${item.name}-${index}`}
                      index={index}
                      item={item}
                      queueLevelLabel={t('queueLevel')}
                      groupsLabel={t('groups')}
                      invalidLabel={t('invalid')}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                  {t('empty')}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
