import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Store } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StoreCard } from './StoreCard';
import { StoreListItem } from './StoreListItem';

interface StoreDisplayProps {
  stores: Store[];
  viewMode: 'grid' | 'list';
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
  // Only on initial visit (when stores are empty), no staggered animation on refresh
  const isInitialVisit = stores.length === 0;
  const [gridDelays, setGridDelays] = useState<number[]>([]);
  const [listDelays, setListDelays] = useState<number[]>([]);

  useEffect(() => {
    if (isInitialVisit) {
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
      // If not initial visit, show immediately without animation
      setDelaysReady(true);
    }
  }, [isInitialVisit]);

  if (isLoading) {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                isInitialVisit && delaysReady && gridDelays[index]
                  ? 'animate-fade-in-up'
                  : '',
                !delaysReady ? 'opacity-0' : ''
              )}
              style={
                isInitialVisit && delaysReady && gridDelays[index]
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

    // List view skeleton
    return (
      <div className="space-y-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              isInitialVisit && delaysReady && listDelays[index]
                ? 'animate-fade-in-up'
                : '',
              !delaysReady ? 'opacity-0' : ''
            )}
            style={
              isInitialVisit && delaysReady && listDelays[index]
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
        <h3 className="text-base font-semibold text-foreground mb-1">
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
          <StoreCard key={store.shopId} store={store} isLoading={isLoading} />
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {stores.map((store) => (
          <StoreListItem key={store.shopId} store={store} />
        ))}
      </div>
    );
  }
};
