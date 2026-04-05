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
    name: '?箄?',
    nameEn: 'Mong Kok',
    address: 'Example Address',
    region: '銋?',
    area: '瘝孵??箏?',
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
        searchTerm: '瘝孵?',
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

  it('handles empty strings, mixed casing, and partial matches in searchable fields', () => {
    const store = createStore({
      name: '',
      nameEn: 'MONG KOK',
      region: '',
      area: 'Jordan District',
    });

    expect(
      matchesDashboardFilters(store, {
        searchTerm: 'mong',
        regionFilter: null,
        waitingStatusFilter: null,
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: 'jord',
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
      region: '?啁?',
      waitingGroup: 20,
    });

    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '?啁?',
        waitingStatusFilter: 'MEDIUM',
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '銋?',
        waitingStatusFilter: 'MEDIUM',
      })
    ).toBe(false);
    expect(
      matchesDashboardFilters(store, {
        searchTerm: '',
        regionFilter: '?啁?',
        waitingStatusFilter: 'LOW',
      })
    ).toBe(false);
  });

  it('filters a store list without changing order', () => {
    const stores = [
      createStore({ shopId: 1, nameEn: 'Mong Kok', waitingGroup: 0 }),
      createStore({
        shopId: 2,
        name: '瘝',
        nameEn: 'Sha Tin',
        region: '?啁?',
        area: '瘝?',
        waitingGroup: 18,
      }),
      createStore({
        shopId: 3,
        name: '???',
        nameEn: 'Causeway Bay',
        region: '擐葛撜?',
        area: '????',
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

  it('documents current wait-status behavior for invalid waitingGroup values', () => {
    const nanStore = createStore({ shopId: 1, waitingGroup: Number.NaN });
    const negativeStore = createStore({ shopId: 2, waitingGroup: -1 });
    const infiniteStore = createStore({
      shopId: 3,
      waitingGroup: Number.POSITIVE_INFINITY,
    });

    expect(
      matchesDashboardFilters(nanStore, {
        searchTerm: '',
        regionFilter: null,
        waitingStatusFilter: 'HIGH',
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(negativeStore, {
        searchTerm: '',
        regionFilter: null,
        waitingStatusFilter: 'LOW',
      })
    ).toBe(true);
    expect(
      matchesDashboardFilters(infiniteStore, {
        searchTerm: '',
        regionFilter: null,
        waitingStatusFilter: 'HIGH',
      })
    ).toBe(true);
  });
});
