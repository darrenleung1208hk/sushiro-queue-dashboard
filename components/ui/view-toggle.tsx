import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  const handleKeyDown = (event: React.KeyboardEvent, mode: 'grid' | 'list') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewChange(mode);
    }
  };

  return (
    <div 
      className="flex rounded-lg border border-border bg-muted p-1"
      role="tablist"
      aria-label="View mode selection"
    >
      <button
        onClick={() => onViewChange('grid')}
        onKeyDown={(e) => handleKeyDown(e, 'grid')}
        className={cn(
          'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          viewMode === 'grid' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Grid view"
        aria-selected={viewMode === 'grid'}
        role="tab"
        tabIndex={0}
      >
        <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        onKeyDown={(e) => handleKeyDown(e, 'list')}
        className={cn(
          'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          viewMode === 'list' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="List view"
        aria-selected={viewMode === 'list'}
        role="tab"
        tabIndex={0}
      >
        <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
};
