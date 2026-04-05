import { describe, expect, it } from 'vitest';

import { buildRecommendedQueues } from '@/lib/queue-recommendations';
import {
  QueueItem,
  RECOMMENDATION_CLUSTERS,
  RecommendationCluster,
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

describe('queue recommendations', () => {
  it('anchors to the globally best eligible item when no preferred cluster exists', () => {
    const islandWest = createQueueItem(1, 'Central', 1);
    const islandEast = createQueueItem(2, 'North Point', 4);
    const westKowloon = createQueueItem(3, 'Mong Kok', 2);
    const eastKowloon = createQueueItem(4, 'Kwun Tong', 3);

    const recommended = buildRecommendedQueues(
      [eastKowloon, westKowloon, islandEast, islandWest],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.HK_ISLAND_EAST),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(4, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([islandWest, westKowloon, islandEast]);
  });

  it('returns only preferred-cluster items when 3 or more eligible items exist there', () => {
    const jordan = createQueueItem(1, 'Jordan', 2);
    const mongKok = createQueueItem(2, 'Mong Kok', 2);
    const tsimShaTsui = createQueueItem(3, 'Tsim Sha Tsui', 3);
    const tsuenWan = createQueueItem(4, 'Tsuen Wan', 1);

    const recommended = buildRecommendedQueues(
      [tsimShaTsui, tsuenWan, mongKok, jordan],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(4, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
      ]),
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );

    expect(recommended).toEqual([jordan, mongKok, tsimShaTsui]);
  });

  it('keeps preferred-cluster items ahead of fallback candidates with slightly lower queues', () => {
    const jordan = createQueueItem(1, 'Jordan', 2);
    const mongKok = createQueueItem(2, 'Mong Kok', 2);
    const tsuenWan = createQueueItem(3, 'Tsuen Wan', 1);

    const recommended = buildRecommendedQueues(
      [tsuenWan, mongKok, jordan],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(3, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
      ]),
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );

    expect(recommended).toEqual([jordan, mongKok, tsuenWan]);
  });

  it('fills remaining slots from fallback scope after preferred-cluster candidates are exhausted', () => {
    const jordan = createQueueItem(1, 'Jordan', 2);
    const tsuenWan = createQueueItem(2, 'Tsuen Wan', 1);
    const kwaiFong = createQueueItem(3, 'Kwai Fong', 3);

    const recommended = buildRecommendedQueues(
      [kwaiFong, tsuenWan, jordan],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
        createStore(3, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
      ]),
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );

    expect(recommended).toEqual([jordan, tsuenWan, kwaiFong]);
  });

  it('falls back from the preferred anchor scope when the preferred cluster has no eligible items', () => {
    const tsuenWan = createQueueItem(1, 'Tsuen Wan', 1);
    const kwaiFong = createQueueItem(2, 'Kwai Fong', 2);
    const shaTin = createQueueItem(3, 'Sha Tin', 3);

    const recommended = buildRecommendedQueues(
      [shaTin, kwaiFong, tsuenWan],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST),
        createStore(3, RECOMMENDATION_CLUSTERS.SHA_TIN_BELT),
      ]),
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );

    expect(recommended).toEqual([tsuenWan, kwaiFong, shaTin]);
  });

  it('expands to second-ring clusters when the initial scope has fewer than 3 candidates', () => {
    const anchor = createQueueItem(1, 'Tseung Kwan O', 1);
    const eastKowloon = createQueueItem(2, 'Kwun Tong', 2);
    const westKowloon = createQueueItem(3, 'Jordan', 3);

    const recommended = buildRecommendedQueues(
      [westKowloon, eastKowloon, anchor],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.TSEUNG_KWAN_O),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([anchor, eastKowloon, westKowloon]);
  });

  it('falls back to the remaining global eligible pool after exhausting adjacency expansion', () => {
    const unknown = createQueueItem(1, 'Unknown', 1);
    const islandWest = createQueueItem(2, 'Central', 2);
    const westKowloon = createQueueItem(3, 'Jordan', 3);

    const recommended = buildRecommendedQueues(
      [westKowloon, islandWest, unknown],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.UNKNOWN),
        createStore(2, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([unknown, islandWest, westKowloon]);
  });

  it('returns all eligible branches when fewer than 3 exist', () => {
    const first = createQueueItem(1, 'Central', 0, 'IMMEDIATE');
    const second = createQueueItem(2, 'Jordan', 2);

    const recommended = buildRecommendedQueues(
      [first, second],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([first, second]);
  });

  it('excludes non-eligible normalized queue items', () => {
    const eligible = createQueueItem(1, 'Central', 1);
    const unavailable = createQueueItem(2, 'Tai Po', null, 'UNAVAILABLE');
    const closed = createQueueItem(3, 'Closed', null, 'INELIGIBLE');

    const recommended = buildRecommendedQueues(
      [eligible, unavailable, closed],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.NORTH_NT),
        createStore(3, RECOMMENDATION_CLUSTERS.UNKNOWN),
      ])
    );

    expect(recommended).toEqual([eligible]);
  });

  it('pairs queue items to stores by shopId instead of array order', () => {
    const islandWest = createQueueItem(1, 'Central', 2);
    const eastKowloon = createQueueItem(2, 'Kwun Tong', 1);
    const islandEast = createQueueItem(3, 'North Point', 3);

    const recommended = buildRecommendedQueues(
      [islandWest, eastKowloon, islandEast],
      createStoreMap([
        createStore(3, RECOMMENDATION_CLUSTERS.HK_ISLAND_EAST),
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND_WEST),
        createStore(2, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([eastKowloon, islandWest, islandEast]);
  });
});
