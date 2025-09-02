'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  StoreIcon,
  Users,
  Clock,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StoreCard } from './StoreCard';
import { StoreListItem } from './StoreListItem';
import { ViewToggle } from './ui/view-toggle';
import { Store, getQueuePriority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  const t = useTranslations();
  const locale = useLocale();

  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [waitingStatusFilter, setWaitingStatusFilter] = useState<string | null>(
    null
  );
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
      console.warn(t('errors.unableToLoadData'), error);
    }
  }, [t]);

  // Save view mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-view-mode', viewMode);
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn(t('errors.unableToLoadData'), error);
    }
  }, [viewMode, t]);

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

      const matchesRegion = !regionFilter || store.region === regionFilter;

      const matchesWaitingStatus =
        !waitingStatusFilter ||
        getQueuePriority(store.waitingGroup) === waitingStatusFilter;

      return matchesSearch && matchesRegion && matchesWaitingStatus;
    });
  }, [stores, searchTerm, regionFilter, waitingStatusFilter]);

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

  const uniqueRegions = Array.from(
    new Set(stores.map((store) => store.region))
  );

  const waitingStatusOptions = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {t('dashboard.title')}
              </h1>
              <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <StoreIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.totalStores')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.totalStores}
                  </p>
                  <p className="text-[10px] text-success">
                    {stats.openStores} {t('dashboard.stats.openStores')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-warning/10 rounded-md">
                  <Users className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.totalWaiting')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.totalWaiting}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('dashboard.stats.acrossAllStores')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-success/10 rounded-md">
                  <Clock className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.currentQueue')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stats.totalCurrentQueue}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.activeTickets')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-destructive/10 rounded-md">
                  <Search className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.filteredResults')}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {filteredStores.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.showing')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 bg-card rounded-lg p-3 border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/* Region Filters */}
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={regionFilter === null ? 'primary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setRegionFilter(null)}
              >
                {t('dashboard.filters.allRegions')}
              </Badge>
              {uniqueRegions.map((region) => (
                <Badge
                  key={region}
                  variant={regionFilter === region ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() =>
                    setRegionFilter(regionFilter === region ? null : region)
                  }
                >
                  {region}
                </Badge>
              ))}
            </div>

            {/* Waiting Status Filters */}
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={waitingStatusFilter === null ? 'primary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setWaitingStatusFilter(null)}
              >
                {t('dashboard.filters.allWaitTimes')}
              </Badge>
              {waitingStatusOptions.map((status) => (
                <Badge
                  key={status}
                  variant={
                    waitingStatusFilter === status
                      ? status === 'LOW'
                        ? 'default'
                        : status === 'MEDIUM'
                          ? 'secondary'
                          : status === 'HIGH'
                            ? 'destructive'
                            : 'destructive'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    setWaitingStatusFilter(
                      waitingStatusFilter === status ? null : status
                    )
                  }
                >
                  {t(`dashboard.filters.${status.toLowerCase()}Wait`)}
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
                {t('dashboard.viewMode.showingStores', {
                  count: filteredStores.length,
                })}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('dashboard.viewMode.inViewMode', {
                  mode: t(`ui.${viewMode}`),
                })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
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
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-base font-semibold text-foreground mb-1">
              {t('dashboard.noResults.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('dashboard.noResults.message')}
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
              {isLoading ? t('common.refreshing') : t('common.connected')}
            </span>
          </div>

          {lastUpdated && (
            <span className="hidden sm:inline text-muted-foreground w-max">
              {t('common.last')}: {lastUpdated.toLocaleTimeString()}
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
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('common.pause')}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('common.resume')}
                    </span>
                  </>
                )}
              </button>
            )}

            {onManualRefresh && (
              <button
                onClick={onManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={cn('h-4 w-4', isLoading && 'animate-spin')}
                />
                <span className="hidden sm:inline">{t('common.refresh')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
