import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  const handleToggle = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    onViewChange(newMode);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="flex rounded-md border border-border bg-muted p-0.5 cursor-pointer"
      role="tab"
      aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
      aria-selected={false}
      tabIndex={0}
    >
      <div
        className={cn(
          'flex items-center gap-1 px-1.5 py-1 rounded-sm text-xs transition-all duration-200',
          viewMode === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        <Grid3X3 className="h-3 w-3" />
        <span className="hidden sm:inline">Grid</span>
      </div>
      <div
        className={cn(
          'flex items-center gap-1 px-1.5 py-1 rounded-sm text-xs transition-all duration-200',
          viewMode === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        <List className="h-3 w-3" />
        <span className="hidden sm:inline">List</span>
      </div>
    </button>
  );
};
