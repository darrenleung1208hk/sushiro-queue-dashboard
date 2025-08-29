'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Store } from '@/components/StoreCard';
import {
  DashboardLoading,
  DashboardError,
} from '@/app/(ui)/dashboard/_components';

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL_MS = 60000; // 60 seconds
const AUTO_REFRESH_INTERVAL_SECONDS = AUTO_REFRESH_INTERVAL_MS / 1000;

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(AUTO_REFRESH_INTERVAL_SECONDS);
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
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch store data');
      }

      setStores(apiResponse.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching stores:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

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
      setNextRefreshIn(prev => {
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

  if (error && stores.length === 0) {
    return <DashboardError error={error} />;
  }

  if (isLoading && stores.length === 0) {
    return <DashboardLoading />;
  }

  return (
    <Dashboard
      stores={stores}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
      nextRefreshIn={nextRefreshIn}
      autoRefreshEnabled={autoRefreshEnabled}
      onAutoRefreshToggle={setAutoRefreshEnabled}
      onManualRefresh={fetchStores}
    />
  );
}
