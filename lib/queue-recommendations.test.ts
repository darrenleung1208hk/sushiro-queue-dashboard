import { describe, expect, it } from 'vitest';

import { buildRecommendedQueues } from '@/lib/queue-recommendations';
import {
  QueueItem,
  RECOMMENDATION_CLUSTERS,
  RECOMMENDATION_MODES,
  RECOMMENDATION_REASON_CODES,
  RecommendationCluster,
  RecommendationPreferenceMeta,
  Store,
} from '@/lib/types';

function createQueueItem(
  shopId: number,
  name: string,
  queueCount: number | null,
  recommendationState: QueueItem['recommendationState'] = 'WAITING'
): QueueItem {
  return {
    shopId,
    name,
    storeStatus: recommendationState === 'INELIGIBLE' ? 'CLOSED' : 'OPEN',
    queueCount,
    level: 'LOW',
    recommendationState,
  };
}

function createStore(
  shopId: number,
  recommendationCluster: RecommendationCluster
): Store {
  return {
    shopId,
    name: `Store ${shopId}`,
    nameEn: `Store ${shopId}`,
    address: '',
    region: '',
    area: '',
    recommendationCluster,
    storeStatus: 'OPEN',
    waitingGroup: 0,
    storeQueue: [],
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function createStoreMap(stores: Store[]): Map<number, Store> {
  return new Map(stores.map((store) => [store.shopId, store] as const));
}

function createPreference(
  overrides: Partial<RecommendationPreferenceMeta> = {}
): RecommendationPreferenceMeta {
  return {
    activeMode: RECOMMENDATION_MODES.AUTO,
    branchOptions: [],
    clusterOptions: [],
    ...overrides,
  };
}

describe('queue recommendations', () => {
  it('keeps the preferred branch first and explains same-cluster follow-ups', () => {
    const preferredBranch = createQueueItem(1, 'Jordan', 5);
    const sameCluster = createQueueItem(2, 'Mong Kok', 1);
    const adjacent = createQueueItem(3, 'Tsuen Wan', 2);

    const recommended = buildRecommendedQueues(
      [adjacent, sameCluster, preferredBranch],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(3, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
      ]),
      createPreference({
        activeMode: RECOMMENDATION_MODES.BRANCH,
        activeBranchShopId: 1,
        activeCluster: RECOMMENDATION_CLUSTERS.WEST_KOWLOON,
      })
    );

    expect(recommended.items.map((item) => item.shopId)).toEqual([1, 2, 3]);
    expect(recommended.items[0].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.PREFERRED_BRANCH
    );
    expect(recommended.items[1].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.SAME_CLUSTER_AS_PREFERRED_BRANCH
    );
    expect(recommended.items[2].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.NEARBY_FALLBACK
    );
  });

  it('anchors cluster mode to the selected cluster before adjacent fallback', () => {
    const selectedClusterBest = createQueueItem(1, 'Kwun Tong', 2);
    const selectedClusterSecond = createQueueItem(2, 'Wong Tai Sin', 3);
    const nearbyFallback = createQueueItem(3, 'Sha Tin', 1);

    const recommended = buildRecommendedQueues(
      [nearbyFallback, selectedClusterSecond, selectedClusterBest],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
        createStore(3, RECOMMENDATION_CLUSTERS.SHA_TIN_BELT),
      ]),
      createPreference({
        activeMode: RECOMMENDATION_MODES.CLUSTER,
        activeCluster: RECOMMENDATION_CLUSTERS.EAST_KOWLOON,
      })
    );

    expect(recommended.items.map((item) => item.shopId)).toEqual([1, 2, 3]);
    expect(recommended.items[0].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.IN_SELECTED_CLUSTER
    );
    expect(recommended.items[2].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.NEARBY_FALLBACK
    );
  });

  it('returns deterministic auto recommendations with an active cluster', () => {
    const first = createQueueItem(1, 'Central', 0, 'IMMEDIATE');
    const second = createQueueItem(2, 'Jordan', 2);

    const recommended = buildRecommendedQueues(
      [first, second],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ]),
      createPreference()
    );

    expect(recommended.activeCluster).toBe(
      RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST
    );
    expect(recommended.items[0].reasonCodes).toContain(
      RECOMMENDATION_REASON_CODES.OPEN_NOW
    );
  });
});
