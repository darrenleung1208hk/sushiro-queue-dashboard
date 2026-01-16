'use client';

import { useMemo, useRef } from 'react';
import Marquee from 'react-fast-marquee';
import { useLocale } from 'next-intl';
import { ArrowBigUp, ArrowBigDown, Users } from 'lucide-react';

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
        className="py-1.5"
      >
        {storesToDisplay.map((store) => {
          const storeName = locale === 'zh-HK' ? store.name : store.nameEn;
          const showDelta = !isInitialLoad && store.waitingGroupDelta !== 0;

          return (
            <div
              key={store.shopId}
              className="flex items-center mx-6 text-sm"
            >
              {/* Store name - like stock symbol */}
              <span className="font-semibold text-foreground tracking-tight">
                {storeName}
              </span>

              {/* Waiting count - like stock price */}
              <span className="ml-2 flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="tabular-nums font-medium">{store.waitingGroup}</span>
              </span>

              {/* Delta indicator - like price change */}
              {showDelta && (
                <span
                  className={cn(
                    'ml-1.5 flex items-center gap-0.5 text-sm font-bold text-white px-1 py-0.5 rounded-sm tabular-nums',
                    store.deltaDirection === 'up' && 'bg-destructive',
                    store.deltaDirection === 'down' && 'bg-green-600'
                  )}
                >
                  {store.deltaDirection === 'up' && (
                    <>
                      <ArrowBigUp className="h-4 w-4 shrink-0" />
                      <span className="w-4 text-center">{store.waitingGroupDelta}</span>
                    </>
                  )}
                  {store.deltaDirection === 'down' && (
                    <>
                      <ArrowBigDown className="h-4 w-4 shrink-0" />
                      <span className="w-4 text-center">{Math.abs(store.waitingGroupDelta)}</span>
                    </>
                  )}
                </span>
              )}

              {/* Vertical divider - stock ticker style */}
              <span className="ml-6 h-4 w-px bg-border" />
            </div>
          );
        })}
      </Marquee>
    </div>
  );
};
