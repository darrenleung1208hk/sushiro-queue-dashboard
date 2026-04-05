import { useState, useMemo } from 'react';

import {
  filterDashboardStores,
  type DashboardFilterValues,
} from '@/lib/dashboard-filters';
import { Store } from '@/lib/types';

export const useDashboardFilters = (stores: Store[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [waitingStatusFilter, setWaitingStatusFilter] = useState<string | null>(
    null
  );

  const filteredStores = useMemo(() => {
    const filters: DashboardFilterValues = {
      searchTerm,
      regionFilter,
      waitingStatusFilter,
    };

    return filterDashboardStores(stores, filters);
  }, [stores, searchTerm, regionFilter, waitingStatusFilter]);

  const uniqueRegions = useMemo(
    () => Array.from(new Set(stores.map((store) => store.region))),
    [stores]
  );

  const waitingStatusOptions = ['LOW', 'MEDIUM', 'HIGH'];

  return {
    searchTerm,
    setSearchTerm,
    regionFilter,
    setRegionFilter,
    waitingStatusFilter,
    setWaitingStatusFilter,
    filteredStores,
    uniqueRegions,
    waitingStatusOptions,
  };
};
