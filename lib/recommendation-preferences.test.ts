import { describe, expect, it } from 'vitest';

import {
  parseRecommendationPreference,
  resolveRecommendationPreference,
} from '@/lib/recommendation-preferences';
import {
  QueueItem,
  RECOMMENDATION_CLUSTERS,
  RECOMMENDATION_FALLBACK_REASON_CODES,
  RECOMMENDATION_MODES,
  Store,
} from '@/lib/types';

function createQueueItem(
  shopId: number,
  recommendationState: QueueItem['recommendationState'] = 'WAITING'
): QueueItem {
  return {
    shopId,
    name: `Store ${shopId}`,
    storeStatus: recommendationState === 'INELIGIBLE' ? 'CLOSED' : 'OPEN',
    queueCount: recommendationState === 'UNAVAILABLE' ? null : 2,
    level: 'LOW',
    recommendationState,
  };
}

function createStore(shopId: number, cluster = RECOMMENDATION_CLUSTERS.WEST_KOWLOON): Store {
  return {
    shopId,
    name: `Store ${shopId}`,
    nameEn: `Store ${shopId}`,
    address: '',
    region: '',
    area: '',
    recommendationCluster: cluster,
    storeStatus: 'OPEN',
    waitingGroup: 2,
    storeQueue: [],
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function createStoreMap(stores: Store[]): Map<number, Store> {
  return new Map(stores.map((store) => [store.shopId, store] as const));
}

describe('recommendation preferences', () => {
  it('parses valid branch and cluster params from the URL', () => {
    const params = new URLSearchParams(
      'preferredBranch=12&preferredCluster=WEST_KOWLOON'
    );

    expect(parseRecommendationPreference(params)).toEqual({
      preferredBranchShopId: 12,
      preferredCluster: RECOMMENDATION_CLUSTERS.WEST_KOWLOON,
    });
  });

  it('ignores missing or invalid query-param values during parsing', () => {
    const invalidBranchParams = new URLSearchParams(
      'preferredBranch=abc&preferredCluster=NOT_A_CLUSTER'
    );
    const missingBranchParams = new URLSearchParams(
      'preferredCluster=EAST_KOWLOON'
    );

    expect(parseRecommendationPreference(invalidBranchParams)).toEqual({
      preferredBranchShopId: undefined,
      preferredCluster: undefined,
    });
    expect(parseRecommendationPreference(missingBranchParams)).toEqual({
      preferredBranchShopId: undefined,
      preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
    });
  });

  it('activates branch mode when the preferred branch is eligible', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(1), createQueueItem(2)],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.BRANCH);
    expect(preference.activeBranchShopId).toBe(1);
    expect(preference.activeCluster).toBe(RECOMMENDATION_CLUSTERS.WEST_KOWLOON);
  });

  it('falls back from an ineligible preferred branch to cluster mode when a valid cluster exists', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(1, 'INELIGIBLE'), createQueueItem(2)],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.CLUSTER);
    expect(preference.activeCluster).toBe(RECOMMENDATION_CLUSTERS.EAST_KOWLOON);
    expect(preference.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_INELIGIBLE
    );
  });

  it('falls back from a missing preferred branch to cluster mode when a valid cluster exists', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredBranchShopId: 99,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(2)],
      createStoreMap([createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON)])
    );

    expect(preference.requestedBranchShopId).toBe(99);
    expect(preference.requestedCluster).toBe(RECOMMENDATION_CLUSTERS.EAST_KOWLOON);
    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.CLUSTER);
    expect(preference.activeCluster).toBe(RECOMMENDATION_CLUSTERS.EAST_KOWLOON);
    expect(preference.activeBranchShopId).toBeUndefined();
    expect(preference.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_NOT_FOUND
    );
  });

  it('falls back to auto mode when preferred scope has no eligible candidates', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(1, 'INELIGIBLE'), createQueueItem(2, 'UNAVAILABLE')],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.AUTO);
    expect(preference.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_INELIGIBLE
    );
  });

  it('falls back from an unavailable cluster to auto mode when no eligible cluster candidates exist', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(2, 'UNAVAILABLE')],
      createStoreMap([createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON)])
    );

    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.AUTO);
    expect(preference.activeCluster).toBeUndefined();
    expect(preference.fallbackReasonCode).toBe(
      RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_CLUSTER_UNAVAILABLE
    );
  });

  it('keeps backend resolution authoritative when branch and cluster URL inputs conflict', () => {
    const preference = resolveRecommendationPreference(
      {
        preferredBranchShopId: 1,
        preferredCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      },
      [createQueueItem(1), createQueueItem(2)],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(preference.requestedBranchShopId).toBe(1);
    expect(preference.requestedCluster).toBe(RECOMMENDATION_CLUSTERS.EAST_KOWLOON);
    expect(preference.activeMode).toBe(RECOMMENDATION_MODES.BRANCH);
    expect(preference.activeBranchShopId).toBe(1);
    expect(preference.activeCluster).toBe(RECOMMENDATION_CLUSTERS.WEST_KOWLOON);
    expect(preference.fallbackReasonCode).toBeUndefined();
  });
});
