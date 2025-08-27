'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Store } from '@/components/StoreCard';
import {
  DashboardLoading,
  DashboardError,
} from '@/app/(ui)/dashboard/_components';

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(60);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Data fetching function
  const fetchStores = useCallback(async () => {
    try {
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
    } finally {
      setIsLoading(false);
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
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchStores, autoRefreshEnabled]);

  // Countdown timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const countdown = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          return 60;
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
        setNextRefreshIn(60);
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
