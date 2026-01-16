'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Store } from '@/lib/types';
import { useDashboardFilters } from '@/lib/hooks/use-dashboard-filters';
import { useViewMode } from '@/lib/hooks/use-view-mode';

import { DashboardHeader } from './_components/DashboardHeader';
import { FiltersSection } from './_components/FiltersSection';
import { ViewModeHeader } from './_components/ViewModeHeader';
import { StoreDisplay } from './_components/StoreDisplay';
import { TickerTape } from './_components/TickerTape';

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL_MS = 60000; // 60 seconds

export default function DashboardPage() {
  const t = useTranslations();
  const [stores, setStores] = useState<Store[]>([]);
  const [previousStores, setPreviousStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isFetchingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const storesRef = useRef<Store[]>([]);

  // Data fetching function with deduplication
  const fetchStores = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) return;

    const isRefresh = !isInitialLoadRef.current;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Show toast only for auto-refresh, not initial load
      if (isRefresh) {
        toast.loading(t('common.refreshStarted'), { id: 'refresh-toast' });
      }

      const response = await fetch('/api/stores/live');

      if (!response.ok) {
        throw new Error(
          `${t('errors.apiRequestFailed')}: ${response.status} ${response.statusText}`
        );
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || t('errors.failedToLoadData'));
      }

      // Save current stores as previous before updating (for delta calculation)
      setPreviousStores(storesRef.current);
      setStores(apiResponse.data);
      storesRef.current = apiResponse.data;
      setLastUpdated(new Date());

      // Mark initial load as complete after first successful fetch
      if (isInitialLoadRef.current) {
        setIsInitialLoad(false);
      }

      // Show success toast only for refresh
      if (isRefresh) {
        toast.success(t('common.refreshComplete'), { id: 'refresh-toast' });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error(t('errors.unknownError'))
      );
      console.error('Error fetching stores:', err);

      // Dismiss loading toast on error
      if (isRefresh) {
        toast.error(t('errors.failedToLoadData'), { id: 'refresh-toast' });
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      isInitialLoadRef.current = false;
    }
  }, [t]);

  // Initial load
  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  // Polling logic - refresh every minute
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      void fetchStores();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchStores, autoRefreshEnabled]);

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Handle visibility changes if needed in the future
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const {
    searchTerm,
    setSearchTerm,
    regionFilter,
    setRegionFilter,
    waitingStatusFilter,
    setWaitingStatusFilter,
    filteredStores,
    uniqueRegions,
    waitingStatusOptions,
  } = useDashboardFilters(stores);
  const { viewMode, handleViewModeChange } = useViewMode();

  return (
    <div className="space-y-4 pb-14">
      <DashboardHeader
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onManualRefresh={() => {
          void fetchStores();
        }}
      />

      <TickerTape
        stores={stores}
        previousStores={previousStores}
        isInitialLoad={isInitialLoad}
      />

      <FiltersSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        waitingStatusFilter={waitingStatusFilter}
        onWaitingStatusFilterChange={setWaitingStatusFilter}
        uniqueRegions={uniqueRegions}
        waitingStatusOptions={waitingStatusOptions}
        filteredCount={filteredStores.length}
      />

      <ViewModeHeader
        filteredCount={filteredStores.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <StoreDisplay
        stores={filteredStores}
        viewMode={viewMode}
        isLoading={isLoading}
      />
    </div>
  );
}
