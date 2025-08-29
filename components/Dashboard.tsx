'use client';

import { useState, useMemo, useEffect } from 'react';
import { StoreCard, type Store } from './StoreCard';
import { StoreListItem } from './StoreListItem';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ViewToggle } from '@/components/ui/view-toggle';
import {
  Search,
  Store as StoreIcon,
  Users,
  Clock,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('dashboard-view-mode');
      if (savedView === 'grid' || savedView === 'list') {
        setViewMode(savedView);
      }
    } catch (error) {
      // Fallback to default grid view if localStorage is unavailable
      console.warn('Unable to load view mode preference:', error);
    }
  }, []);

  // Save view mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-view-mode', viewMode);
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn('Unable to save view mode preference:', error);
    }
  }, [viewMode]);

  // Handle view mode change with transition state
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (mode !== viewMode) {
      setIsViewTransitioning(true);
      setViewMode(mode);
      // Reset transition state after animation completes
      setTimeout(() => setIsViewTransitioning(false), 300);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.area.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || store.storeStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalWaiting = stores.reduce(
      (sum, store) => sum + store.waitingGroup,
      0
    );
    const totalCurrentQueue = stores.reduce(
      (sum, store) => sum + store.storeQueue.length,
      0
    );
    const openStores = stores.filter(
      (store) => store.storeStatus === 'OPEN'
    ).length;

    return {
      totalWaiting,
      totalCurrentQueue,
      openStores,
      totalStores: stores.length,
    };
  }, [stores]);

  const uniqueStatuses = Array.from(
    new Set(stores.map((store) => store.storeStatus))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Store Queue Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor store queues and wait times in real-time
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <StoreIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stores</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalStores}
                </p>
                <p className="text-xs text-success">{stats.openStores} Open</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Waiting</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalWaiting}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across all stores
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Queue</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalCurrentQueue}
                </p>
                <p className="text-xs text-muted-foreground">Active tickets</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Search className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredStores.length}
                </p>
                <p className="text-xs text-muted-foreground">Showing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card rounded-lg p-4 border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores by name, region, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={statusFilter === null ? 'primary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter(null)}
              >
                All
              </Badge>
              {uniqueStatuses.map((status) => (
                <Badge
                  key={status}
                  variant={
                    statusFilter === status
                      ? status === 'OPEN'
                        ? 'default'
                        : 'destructive'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? null : status)
                  }
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Indicator and Toggle */}
        {filteredStores.length > 0 && (
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredStores.length} stores
              </span>
              <span className="text-xs text-muted-foreground">
                in {viewMode === 'grid' ? 'grid' : 'list'} view
              </span>
            </div>
            <ViewToggle
              viewMode={viewMode}
              onViewChange={handleViewModeChange}
            />
          </div>
        )}

        {/* Store Display */}
        {filteredStores.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {filteredStores.map((store) => (
                  <StoreCard key={store.shopId} store={store} />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {filteredStores.map((store) => (
                  <StoreListItem key={store.shopId} store={store} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No stores found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Floating Refresh Status Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg px-4 py-3 flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'block w-2 h-2 rounded-full',
                isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              )}
            />
            <span
              className={cn(
                'text-xs font-semibold',
                isLoading ? 'text-yellow-500' : 'text-green-500'
              )}
            >
              {isLoading ? 'Refreshing...' : 'Connected'}
            </span>
          </div>

          {lastUpdated && (
            <span className="hidden sm:inline text-sm text-muted-foreground w-max">
              Last: {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <div className="flex items-center gap-2 pr-2 sm:pr-0">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(100, ((60 - nextRefreshIn) / 60) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAutoRefreshToggle && (
              <button
                onClick={() => onAutoRefreshToggle(!autoRefreshEnabled)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">Resume</span>
                  </>
                )}
              </button>
            )}

            {onManualRefresh && (
              <button
                onClick={onManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={cn('h-4 w-4', isLoading && 'animate-spin')}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
