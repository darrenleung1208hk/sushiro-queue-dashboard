import { Grid3X3, List, Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ViewMode } from '@/lib/hooks/use-view-mode';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  const t = useTranslations();

  const viewModes: {
    mode: ViewMode;
    icon: typeof Grid3X3;
    labelKey: string;
  }[] = [
    { mode: 'grid', icon: Grid3X3, labelKey: 'ui.grid' },
    { mode: 'list', icon: List, labelKey: 'ui.list' },
    { mode: 'table', icon: Table, labelKey: 'ui.table' },
  ];

  return (
    <div
      className="flex rounded-md border border-border bg-muted p-0.5"
      role="tablist"
      aria-label={t('ui.viewModeSelector')}
    >
      {viewModes.map(({ mode, icon: Icon, labelKey }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={cn(
            'flex items-center gap-1 px-1.5 py-1 rounded-sm text-xs transition-all duration-200 cursor-pointer',
            viewMode === mode
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          role="tab"
          aria-selected={viewMode === mode}
          aria-label={t('ui.switchToView', { view: t(labelKey) })}
          tabIndex={viewMode === mode ? 0 : -1}
        >
          <Icon className="h-3 w-3" />
          <span className="hidden sm:inline">{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
};
