'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Clock, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const locale = useLocale();

  return (
    <div className="mb-6 pb-4 border-b border-border/50">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        {/* Left: Title Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'zh-HK'
              ? '壽司郎排隊儀表板'
              : 'Sushiro Queue Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'zh-HK'
              ? '實時監控壽司郎餐廳排隊狀況'
              : 'Real-time queue monitoring for Sushiro restaurants'}
          </p>
        </div>

        {/* Right: Controls Section */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Refresh Controls Group */}
          {(lastUpdated || onManualRefresh) && (
            <div className="flex items-center h-9 rounded-md bg-muted/50 border border-border/50">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 mx-2 text-xs text-muted-foreground">
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
                    onClick={onManualRefresh}
                    disabled={isLoading}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5"
                    aria-label={t('common.refresh')}
                  >
                    <RefreshCw
                      className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
                    />
                    <span className="hidden sm:inline text-xs">
                      {t('common.refresh')}
                    </span>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Language Switcher - Separate from refresh controls */}
          <div className="flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};
