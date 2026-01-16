'use client';

import { useMemo, useRef } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslations, useLocale } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StoreWithDelta extends Store {
  waitingGroupDelta: number;
  deltaDirection: 'up' | 'down' | 'unchanged';
}

interface TickerTapeProps {
  stores: Store[];
  previousStores: Store[];
  isInitialLoad: boolean;
}

export const TickerTape = ({
  stores,
  previousStores,
  isInitialLoad,
}: TickerTapeProps) => {
  const t = useTranslations();
  const locale = useLocale();

  // Keep track of last displayed stores with changes
  const lastDisplayedStoresRef = useRef<StoreWithDelta[]>([]);

  // Compute deltas by comparing current stores with previous stores
  const storesWithDeltas = useMemo((): StoreWithDelta[] => {
    return stores.map((store) => {
      const previous = previousStores.find((p) => p.shopId === store.shopId);
      const delta = previous ? store.waitingGroup - previous.waitingGroup : 0;

      return {
        ...store,
        waitingGroupDelta: delta,
        deltaDirection: delta > 0 ? 'up' : delta < 0 ? 'down' : 'unchanged',
      };
    });
  }, [stores, previousStores]);

  // Filter to only show open stores with changes (after initial load)
  // If no changes, keep showing the last displayed stores
  const storesToDisplay = useMemo(() => {
    const openStores = storesWithDeltas.filter(
      (store) => store.storeStatus === 'OPEN'
    );

    // On initial load, show all open stores
    if (isInitialLoad) {
      lastDisplayedStoresRef.current = openStores;
      return openStores;
    }

    // After initial load, only show stores with changes
    const storesWithChanges = openStores.filter(
      (store) => store.waitingGroupDelta !== 0
    );

    // If there are changes, update the ref and return the new list
    if (storesWithChanges.length > 0) {
      lastDisplayedStoresRef.current = storesWithChanges;
      return storesWithChanges;
    }

    // No changes - keep showing the last displayed stores
    return lastDisplayedStoresRef.current;
  }, [storesWithDeltas, isInitialLoad]);

  // Don't show ticker if no stores to display
  if (storesToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-screen overflow-hidden border-t border-border bg-background/95 backdrop-blur-sm">
      <Marquee
        speed={40}
        pauseOnHover
        gradient
        gradientColor="hsl(var(--background))"
        gradientWidth={50}
        className="py-2"
      >
        {storesToDisplay.map((store) => {
          const storeName = locale === 'zh-HK' ? store.name : store.nameEn;
          const showDelta = !isInitialLoad && store.waitingGroupDelta !== 0;

          return (
            <div
              key={store.shopId}
              className="flex items-center gap-1.5 mx-4 text-sm"
            >
              <span className="font-medium text-foreground">{storeName}</span>
              <span className="text-muted-foreground">:</span>
              <span className="font-semibold text-foreground">
                {store.waitingGroup} {t('store.waiting')}
              </span>

              {/* Delta indicator */}
              {showDelta && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-sm font-semibold text-white px-1.5 py-0.5 rounded',
                    store.deltaDirection === 'up' && 'bg-destructive',
                    store.deltaDirection === 'down' && 'bg-green-600'
                  )}
                >
                  {store.deltaDirection === 'up' && (
                    <>
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+{store.waitingGroupDelta}</span>
                    </>
                  )}
                  {store.deltaDirection === 'down' && (
                    <>
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span>{store.waitingGroupDelta}</span>
                    </>
                  )}
                </span>
              )}

              <span className="text-muted-foreground/50 ml-2">•</span>
            </div>
          );
        })}
      </Marquee>
    </div>
  );
};
