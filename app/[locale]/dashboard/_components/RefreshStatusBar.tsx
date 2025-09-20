import React from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Pause, Play, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RefreshStatusBarProps {
  isLoading: boolean;
  lastUpdated?: Date | null;
  nextRefreshIn: number;
  autoRefreshEnabled: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
  onManualRefresh?: () => void;
}

export const RefreshStatusBar: React.FC<RefreshStatusBarProps> = ({
  isLoading,
  lastUpdated,
  nextRefreshIn,
  autoRefreshEnabled,
  onAutoRefreshToggle,
  onManualRefresh,
}) => {
  const t = useTranslations();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg px-4 py-3 flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'block w-2 h-2 rounded-full',
              isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            )}
          />
          <span
            className={cn(
              'text-xs font-semibold',
              isLoading ? 'text-yellow-500' : 'text-green-500'
            )}
          >
            {isLoading ? t('common.refreshing') : t('common.connected')}
          </span>
        </div>

        {lastUpdated && (
          <span className="hidden sm:inline text-muted-foreground w-max">
            {t('common.last')}: {lastUpdated.toLocaleTimeString()}
          </span>
        )}

        <div className="flex items-center gap-2 pr-2 sm:pr-0">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.max(0, Math.min(100, ((60 - nextRefreshIn) / 60) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAutoRefreshToggle && (
            <button
              onClick={() => onAutoRefreshToggle(!autoRefreshEnabled)}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              {autoRefreshEnabled ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.pause')}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.resume')}</span>
                </>
              )}
            </button>
          )}

          {onManualRefresh && (
            <button
              onClick={onManualRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
              <span className="hidden sm:inline">{t('common.refresh')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
