import { Store } from '@/lib/types';
import { getQueuePriority } from '@/lib/utils';

export interface DashboardFilterValues {
  searchTerm: string;
  regionFilter: string | null;
  waitingStatusFilter: string | null;
}

export function matchesDashboardFilters(
  store: Store,
  { searchTerm, regionFilter, waitingStatusFilter }: DashboardFilterValues
): boolean {
  const normalizedSearchTerm = searchTerm.toLowerCase();
  const matchesSearch =
    store.name.toLowerCase().includes(normalizedSearchTerm) ||
    store.nameEn.toLowerCase().includes(normalizedSearchTerm) ||
    store.region.toLowerCase().includes(normalizedSearchTerm) ||
    store.area.toLowerCase().includes(normalizedSearchTerm);
  const matchesRegion = !regionFilter || store.region === regionFilter;
  const matchesWaitingStatus =
    !waitingStatusFilter ||
    getQueuePriority(store.waitingGroup) === waitingStatusFilter;

  return matchesSearch && matchesRegion && matchesWaitingStatus;
}

export function filterDashboardStores(
  stores: Store[],
  filters: DashboardFilterValues
): Store[] {
  return stores.filter((store) => matchesDashboardFilters(store, filters));
}
