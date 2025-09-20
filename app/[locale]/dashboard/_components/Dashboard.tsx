'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Store } from '@/lib/types';
import { useDashboardFilters } from '@/lib/hooks/use-dashboard-filters';
import { useViewMode } from '@/lib/hooks/use-view-mode';
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats';

import { StatsOverview } from './StatsOverview';
import { FiltersSection } from './FiltersSection';
import { ViewModeHeader } from './ViewModeHeader';
import { StoreDisplay } from './StoreDisplay';
import { RefreshStatusBar } from './RefreshStatusBar';

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL_MS = 60000; // 60 seconds
const AUTO_REFRESH_INTERVAL_SECONDS = AUTO_REFRESH_INTERVAL_MS / 1000;

export const Dashboard = () => {
  const t = useTranslations();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(
    AUTO_REFRESH_INTERVAL_SECONDS
  );
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
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
    fetchStores();
  }, [fetchStores]);

  // Polling logic - refresh every minute
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchStores();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchStores, autoRefreshEnabled]);

  // Countdown timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const countdown = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1) {
          return AUTO_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [autoRefreshEnabled]);

  // Tab visibility handling - pause countdown when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause countdown when tab is not visible
        setNextRefreshIn(AUTO_REFRESH_INTERVAL_SECONDS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const stats = useDashboardStats(stores);
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
      <StatsOverview
        stats={stats}
        filteredCount={filteredStores.length}
        isLoading={isLoading}
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

      <RefreshStatusBar
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        nextRefreshIn={nextRefreshIn}
        autoRefreshEnabled={autoRefreshEnabled}
        onAutoRefreshToggle={setAutoRefreshEnabled}
        onManualRefresh={fetchStores}
      />
    </div>
  );
};
