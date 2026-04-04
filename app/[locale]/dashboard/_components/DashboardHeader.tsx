'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, RefreshCw } from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { trackManualRefresh } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  isLoading: boolean;
  lastUpdated?: Date | null;
  onManualRefresh?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLoading,
  lastUpdated,
  onManualRefresh,
}) => {
  const t = useTranslations();

  const handleManualRefresh = useCallback(() => {
    const timeSinceLastRefresh = lastUpdated
      ? Math.round((Date.now() - lastUpdated.getTime()) / 1000)
      : null;

    trackManualRefresh(timeSinceLastRefresh);
    onManualRefresh?.();
  }, [lastUpdated, onManualRefresh]);

  return (
    <div className="mb-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t('dashboardQueue.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboardQueue.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(lastUpdated || onManualRefresh) && (
            <div className="flex h-9 items-center rounded-md border border-border/50 bg-muted/50">
              {lastUpdated && (
                <div className="mx-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="whitespace-nowrap">
                    {t('common.last')}: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}

              {onManualRefresh && (
                <>
                  {lastUpdated && (
                    <div className="h-4 w-px bg-border" aria-hidden="true" />
                  )}
                  <Button
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5"
                    aria-label={t('common.refresh')}
                  >
                    <RefreshCw
                      className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
                    />
                    <span className="hidden text-xs sm:inline">
                      {t('common.refresh')}
                    </span>
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="shrink-0">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};
