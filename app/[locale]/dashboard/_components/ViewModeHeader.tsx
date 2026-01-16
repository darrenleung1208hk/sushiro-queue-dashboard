import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { ViewToggle } from '@/components/ui/view-toggle';
import { ViewMode } from '@/lib/hooks/use-view-mode';
import { trackViewModeChanged } from '@/lib/analytics';

interface ViewModeHeaderProps {
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeHeader: React.FC<ViewModeHeaderProps> = ({
  filteredCount,
  viewMode,
  onViewModeChange,
}) => {
  const t = useTranslations();

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode !== viewMode) {
        trackViewModeChanged(mode, filteredCount);
        onViewModeChange(mode);
      }
    },
    [viewMode, filteredCount, onViewModeChange]
  );

  return (
    <div className="flex items-end justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('dashboard.viewMode.showingStores', {
            count: filteredCount,
          })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('dashboard.viewMode.inViewMode', {
            mode: t(`ui.${viewMode}`),
          })}
        </span>
      </div>
      <ViewToggle viewMode={viewMode} onViewChange={handleViewModeChange} />
    </div>
  );
};
