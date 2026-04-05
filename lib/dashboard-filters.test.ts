import { describe, expect, it } from 'vitest';

import {
  filterDashboardStores,
  matchesDashboardFilters,
} from '@/lib/dashboard-filters';
import { Store } from '@/lib/types';

function createStore(overrides: Partial<Store> = {}): Store {
  return {
    shopId: 1,
    storeStatus: 'OPEN',
    waitingGroup: 0,
    storeQueue: [],
    timestamp: new Date('2026-04-05T00:00:00.000Z'),
    name: '旺角',
    nameEn: 'Mong Kok',
    address: 'Example Address',
    region: '九龍',
    area: '油尖旺區',
    latitude: 22.3193,
    longitude: 114.1694,
    ...overrides,
  };
}

describe('dashboard filter helpers', () => {
  it('matches stores by localized search text', () => {
    const store = createStore();

    expect(
      matchesDashboardFilters(store, {
        searchTerm: 'mong',
        regionFilter: null,
        waitingStatusFilter: null,
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: '油尖',
        regionFilter: null,
        waitingStatusFilter: null,
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: 'central',
        regionFilter: null,
        waitingStatusFilter: null,
      })
    ).toBe(false);
  });

  it('applies region and wait-status filters together', () => {
    const store = createStore({
      region: '新界',
      waitingGroup: 20,
    });

    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '新界',
        waitingStatusFilter: 'MEDIUM',
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '九龍',
        waitingStatusFilter: 'MEDIUM',
      })
    ).toBe(false);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '新界',
        waitingStatusFilter: 'LOW',
      })
    ).toBe(false);
  });

  it('filters a store list without changing order', () => {
    const stores = [
      createStore({ shopId: 1, nameEn: 'Mong Kok', waitingGroup: 0 }),
      createStore({
        shopId: 2,
        name: '沙田',
        nameEn: 'Sha Tin',
        region: '新界',
        area: '沙田區',
        waitingGroup: 18,
      }),
      createStore({
        shopId: 3,
        name: '銅鑼灣',
        nameEn: 'Causeway Bay',
        region: '香港島',
        area: '灣仔區',
        waitingGroup: 35,
      }),
    ];

    const filteredStores = filterDashboardStores(stores, {
      searchTerm: '',
      regionFilter: null,
      waitingStatusFilter: 'MEDIUM',
    });

    expect(filteredStores.map((store) => store.shopId)).toEqual([2]);
  });
});
