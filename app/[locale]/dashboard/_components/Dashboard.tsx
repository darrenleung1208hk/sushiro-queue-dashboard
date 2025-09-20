'use client';

import React from 'react';
import { Store } from '@/lib/types';
import { useDashboardFilters } from '@/lib/hooks/use-dashboard-filters';
import { useViewMode } from '@/lib/hooks/use-view-mode';
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats';

import { StatsOverview } from './StatsOverview';
import { FiltersSection } from './FiltersSection';
import { ViewModeHeader } from './ViewModeHeader';
import { StoreDisplay } from './StoreDisplay';
import { RefreshStatusBar } from './RefreshStatusBar';

interface DashboardProps {
  stores: Store[];
  isLoading?: boolean;
  lastUpdated?: Date | null;
  nextRefreshIn?: number;
  autoRefreshEnabled?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
  onManualRefresh?: () => void;
}

export const Dashboard = ({
  stores,
  isLoading = false,
  lastUpdated,
  nextRefreshIn = 60,
  autoRefreshEnabled = true,
  onAutoRefreshToggle,
  onManualRefresh,
}: DashboardProps) => {
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
        onAutoRefreshToggle={onAutoRefreshToggle}
        onManualRefresh={onManualRefresh}
      />
    </div>
  );
};
