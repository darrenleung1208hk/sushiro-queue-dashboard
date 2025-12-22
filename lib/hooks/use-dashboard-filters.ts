import { useState, useMemo } from 'react';
import { Store } from '@/lib/types';
import { getQueuePriority } from '@/lib/utils';

export const useDashboardFilters = (stores: Store[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [waitingStatusFilter, setWaitingStatusFilter] = useState<string | null>(
    null
  );

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
