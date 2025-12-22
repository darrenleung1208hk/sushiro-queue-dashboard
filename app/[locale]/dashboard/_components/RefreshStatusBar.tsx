import React from 'react';
import { useTranslations } from 'next-intl';
import { Clock, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RefreshStatusBarProps {
  isLoading: boolean;
  lastUpdated?: Date | null;
  onManualRefresh?: () => void;
}

export const RefreshStatusBar: React.FC<RefreshStatusBarProps> = ({
  isLoading,
  lastUpdated,
  onManualRefresh,
}) => {
  const t = useTranslations();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg px-4 py-2.5 flex items-center gap-4">
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {t('common.last')}: {lastUpdated.toLocaleTimeString()}
            </span>
            <span className="sm:hidden">
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}

        {onManualRefresh && (
          <button
            onClick={onManualRefresh}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors text-sm font-medium'
            )}
          >
            <RefreshCw
              className={cn('h-4 w-4', isLoading && 'animate-spin')}
            />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
