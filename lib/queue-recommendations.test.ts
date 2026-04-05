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
  it('picks one winner per cluster before taking second-place branches', () => {
    const hongKongIslandA = createQueueItem(1, 'Central', 1);
    const hongKongIslandB = createQueueItem(2, 'Admiralty', 2);
    const westKowloon = createQueueItem(3, 'Mong Kok', 4);
    const shaTin = createQueueItem(4, 'Sha Tin', 3);

    const recommended = buildRecommendedQueues(
      [hongKongIslandB, westKowloon, hongKongIslandA, shaTin],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(2, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
        createStore(4, RECOMMENDATION_CLUSTERS.SHA_TIN_BELT),
      ])
    );

    expect(recommended).toEqual([hongKongIslandA, shaTin, westKowloon]);
  });

  it('fills remaining slots from next best eligible branches', () => {
    const winner = createQueueItem(1, 'Central', 1);
    const second = createQueueItem(2, 'Admiralty', 2);
    const third = createQueueItem(3, 'Wan Chai', 3);

    const recommended = buildRecommendedQueues(
      [third, second, winner],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(2, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(3, RECOMMENDATION_CLUSTERS.HK_ISLAND),
      ])
    );

    expect(recommended).toEqual([winner, second, third]);
  });

  it('treats UNKNOWN as a normal bucket', () => {
    const unknown = createQueueItem(1, 'Unknown', 1);
    const island = createQueueItem(2, 'Central', 2);
    const kowloon = createQueueItem(3, 'Jordan', 3);

    const recommended = buildRecommendedQueues(
      [kowloon, island, unknown],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.UNKNOWN),
        createStore(2, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(3, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([unknown, island, kowloon]);
  });

  it('returns all eligible branches when fewer than 3 exist', () => {
    const first = createQueueItem(1, 'Central', 0, 'IMMEDIATE');
    const second = createQueueItem(2, 'Jordan', 2);

    const recommended = buildRecommendedQueues(
      [first, second],
      createStoreMap([
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND),
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
        createStore(1, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(2, RECOMMENDATION_CLUSTERS.NORTH_NT),
        createStore(3, RECOMMENDATION_CLUSTERS.UNKNOWN),
      ])
    );

    expect(recommended).toEqual([eligible]);
  });

  it('pairs queue items to stores by shopId instead of array order', () => {
    const east = createQueueItem(1, 'Kwun Tong', 3);
    const west = createQueueItem(2, 'Jordan', 1);
    const island = createQueueItem(3, 'Central', 2);

    const recommended = buildRecommendedQueues(
      [east, west, island],
      createStoreMap([
        createStore(3, RECOMMENDATION_CLUSTERS.HK_ISLAND),
        createStore(1, RECOMMENDATION_CLUSTERS.EAST_KOWLOON),
        createStore(2, RECOMMENDATION_CLUSTERS.WEST_KOWLOON),
      ])
    );

    expect(recommended).toEqual([west, island, east]);
  });
});
