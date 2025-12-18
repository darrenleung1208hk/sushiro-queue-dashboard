'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Store } from '@/lib/types';
import { useDashboardFilters } from '@/lib/hooks/use-dashboard-filters';
import { useViewMode } from '@/lib/hooks/use-view-mode';

import { DashboardHeader } from './_components/DashboardHeader';
import { FiltersSection } from './_components/FiltersSection';
import { ViewModeHeader } from './_components/ViewModeHeader';
import { StoreDisplay } from './_components/StoreDisplay';

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL_MS = 60000; // 60 seconds

export default function DashboardPage() {
  const t = useTranslations();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled] = useState(true);
  const isFetchingRef = useRef(false);

  // Data fetching function with deduplication
  const fetchStores = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

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

      setStores(apiResponse.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error(t('errors.unknownError'))
      );
      console.error('Error fetching stores:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
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
    <div className="space-y-4">
      <DashboardHeader
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onManualRefresh={() => {
          void fetchStores();
        }}
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
