import { describe, expect, it } from 'vitest';

import type { LiveStoresResult } from '@/lib/live-stores';
import {
  buildQueueSnapshot,
  buildUnavailableQueueSnapshot,
} from '@/lib/queue-snapshot';
import {
  RECOMMENDATION_CLUSTERS,
  RECOMMENDATION_FALLBACK_REASON_CODES,
  RECOMMENDATION_MODES,
  RECOMMENDATION_REASON_CODES,
  Store,
} from '@/lib/types';

function createStore(
  shopId: number,
  waitingGroup: number,
  storeStatus = 'OPEN'
): Store {
  return {
    shopId,
    name: `Store ${shopId}`,
    nameEn: `Store ${shopId}`,
    address: '',
    region: '',
    area: '',
    recommendationCluster: RECOMMENDATION_CLUSTERS.WEST_KOWLOON,
    storeStatus,
    waitingGroup,
    storeQueue: [],
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function createLiveStoresResult(
  overrides: Partial<LiveStoresResult> = {}
): LiveStoresResult {
  return {
    stores: [],
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    totalStores: 0,
    successfulQueueFetches: 0,
    failedQueueFetches: 0,
    queueErrors: [],
    ...overrides,
  };
}

describe('queue snapshot builder', () => {
  it('returns success when all queue fetches succeed', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [createStore(1, 0), createStore(2, 5)],
        totalStores: 2,
        successfulQueueFetches: 2,
      })
    );

    expect(snapshot.status).toBe('success');
    expect(snapshot.partialData).toBe(false);
    expect(snapshot.errorCode).toBeUndefined();
    expect(snapshot.meta.failedQueueFetches).toBe(0);
    expect(snapshot.recommended).toHaveLength(2);
    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.AUTO);
  });

  it('returns partial when store metadata exists but some queue fetches fail', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [createStore(1, 0), createStore(2, Number.NaN)],
        totalStores: 2,
        successfulQueueFetches: 1,
        failedQueueFetches: 1,
      })
    );

    expect(snapshot.status).toBe('partial');
    expect(snapshot.partialData).toBe(true);
    expect(snapshot.errorCode).toBe('QUEUE_DATA_PARTIAL');
    expect(snapshot.warnings[0]).toContain('1 branches');
    expect(snapshot.meta.successfulQueueFetches).toBe(1);
  });

  it('returns partial when all queue fetches fail but stores are still available', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [createStore(1, Number.NaN)],
        totalStores: 1,
        successfulQueueFetches: 0,
        failedQueueFetches: 1,
      })
    );

    expect(snapshot.status).toBe('partial');
    expect(snapshot.errorCode).toBe('QUEUE_DATA_UNAVAILABLE');
    expect(snapshot.recommended).toEqual([]);
    expect(snapshot.groups.unavailable).toHaveLength(1);
  });

  it('returns branch preference meta and explainability when a preferred branch is requested', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [
          createStore(1, 4),
          createStore(2, 1),
          createStore(3, 2),
        ],
        totalStores: 3,
        successfulQueueFetches: 3,
      }),
      {
        preferredBranchShopId: 1,
      }
    );

    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.BRANCH);
    expect(snapshot.preferences.activeBranchShopId).toBe(1);
    expect(snapshot.recommended[0].shopId).toBe(1);
    expect(snapshot.recommended[0].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.PREFERRED_BRANCH
    );
  });

  it('returns explicit response preference metadata when branch input falls back to cluster', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [
          createStore(1, Number.NaN),
          {
            ...createStore(2, 1),
            recommendationCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
          },
        ],
        totalStores: 2,
        successfulQueueFetches: 1,
        failedQueueFetches: 1,
      }),
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      }
    );

    expect(snapshot.preferences.requestedBranchShopId).toBe(1);
    expect(snapshot.preferences.requestedCluster).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.CLUSTER);
    expect(snapshot.preferences.activeBranchShopId).toBeUndefined();
    expect(snapshot.preferences.activeCluster).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
    expect(snapshot.preferences.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_INELIGIBLE
    );
  });

  it('falls back to auto in response metadata when the requested cluster has no eligible branches', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [
          {
            ...createStore(1, Number.NaN),
            recommendationCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
          },
          createStore(2, 1),
        ],
        totalStores: 2,
        successfulQueueFetches: 1,
        failedQueueFetches: 1,
      }),
      {
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      }
    );

    expect(snapshot.preferences.requestedCluster).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.AUTO);
    expect(snapshot.preferences.activeCluster).toBe(RECOMMENDATION_CLUSTERS.WEST_KOWLOON);
    expect(snapshot.preferences.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_CLUSTER_UNAVAILABLE
    );
  });

  it('keeps backend preference resolution authoritative when URL inputs conflict', () => {
    const snapshot = buildQueueSnapshot(
      createLiveStoresResult({
        stores: [
          createStore(1, 1),
          {
            ...createStore(2, 0),
            recommendationCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
          },
        ],
        totalStores: 2,
        successfulQueueFetches: 2,
      }),
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      }
    );

    expect(snapshot.preferences.requestedBranchShopId).toBe(1);
    expect(snapshot.preferences.requestedCluster).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.BRANCH);
    expect(snapshot.preferences.activeBranchShopId).toBe(1);
    expect(snapshot.preferences.activeCluster).toBe(RECOMMENDATION_CLUSTERS.WEST_KOWLOON);
    expect(snapshot.recommended[0].shopId).toBe(1);
    expect(snapshot.recommended[0].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.PREFERRED_BRANCH
    );
  });

  it('returns unavailable when no stores are available', () => {
    const snapshot = buildQueueSnapshot(createLiveStoresResult());

    expect(snapshot.status).toBe('unavailable');
    expect(snapshot.errorCode).toBe('STORE_DATA_UNAVAILABLE');
    expect(snapshot.data).toEqual([]);
    expect(snapshot.preferences.activeMode).toBe(RECOMMENDATION_MODES.AUTO);
  });

  it('builds an explicit unavailable snapshot for route failures', () => {
    const snapshot = buildUnavailableQueueSnapshot(
      new Date('2026-01-01T00:00:00.000Z')
    );

    expect(snapshot.status).toBe('unavailable');
    expect(snapshot.partialData).toBe(false);
    expect(snapshot.groups.available).toEqual([]);
  });
});
