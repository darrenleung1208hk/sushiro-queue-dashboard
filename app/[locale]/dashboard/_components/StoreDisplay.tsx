import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Store } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/lib/hooks/use-view-mode';
import { StoreCard } from './StoreCard';
import { StoreListItem } from './StoreListItem';
import { StoreTableView } from './StoreTableView';

interface StoreDisplayProps {
  stores: Store[];
  viewMode: ViewMode;
  isLoading?: boolean;
}

export const StoreDisplay: React.FC<StoreDisplayProps> = ({
  stores,
  viewMode,
  isLoading = false,
}) => {
  const t = useTranslations();
  const [delaysReady, setDelaysReady] = useState(false);

  // Generate random delays only on client after mount to avoid hydration mismatch
  // Only on initial load (when stores are empty), no staggered animation on refresh
  const isInitialLoad = stores.length === 0;
  const [gridDelays, setGridDelays] = useState<number[]>([]);
  const [listDelays, setListDelays] = useState<number[]>([]);

  useEffect(() => {
    if (isInitialLoad) {
      // Generate delays only on client side
      setGridDelays(
        Array.from({ length: 24 }).map(() => Math.random() * 200 + 100)
      );
      setListDelays(
        Array.from({ length: 12 }).map(() => Math.random() * 200 + 100)
      );
      // Mark delays as ready so skeletons can appear with animation
      setDelaysReady(true);
    } else {
      // If not initial load, show immediately without animation
      setDelaysReady(true);
    }
  }, [isInitialLoad]);

  // Only show skeletons on initial load, not during refresh when we have existing data
  const showSkeletons = isLoading && isInitialLoad;

  if (showSkeletons) {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                isInitialLoad && delaysReady && gridDelays[index]
                  ? 'animate-fade-in-up'
                  : '',
                !delaysReady ? 'opacity-0' : ''
              )}
              style={
                isInitialLoad && delaysReady && gridDelays[index]
                  ? {
                      animationDelay: `${gridDelays[index]}ms`,
                    }
                  : {}
              }
            >
              <StoreCard isLoading={isLoading} />
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === 'table') {
      return <StoreTableView stores={[]} isLoading={true} />;
    }

    // List view skeleton
    return (
      <div className="space-y-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              isInitialLoad && delaysReady && listDelays[index]
                ? 'animate-fade-in-up'
                : '',
              !delaysReady ? 'opacity-0' : ''
            )}
            style={
              isInitialLoad && delaysReady && listDelays[index]
                ? {
                    animationDelay: `${listDelays[index]}ms`,
                  }
                : {}
            }
          >
            <StoreListItem isLoading={isLoading} />
          </div>
        ))}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {t('dashboard.noResults.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('dashboard.noResults.message')}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {stores.map((store) => (
          <StoreCard key={store.shopId} store={store} />
        ))}
      </div>
    );
  }

  if (viewMode === 'table') {
    return <StoreTableView stores={stores} isLoading={isLoading} />;
  }

  // TypeScript type narrowing: viewMode must be 'list' here (already checked 'grid' and 'table' above)
  return (
    <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {stores.map((store) => (
        <StoreListItem key={store.shopId} store={store} />
      ))}
    </div>
  );
};
