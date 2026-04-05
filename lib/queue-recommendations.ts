import { compareQueueItems } from '@/lib/queue-items';
import {
  QueueItem,
  QueueRecommendationState,
  RecommendationCluster,
  Store,
} from '@/lib/types';

const ELIGIBLE_RECOMMENDATION_STATES: QueueRecommendationState[] = [
  'IMMEDIATE',
  'WAITING',
];

function isEligibleRecommendation(item: QueueItem): boolean {
  return ELIGIBLE_RECOMMENDATION_STATES.includes(item.recommendationState);
}

export function buildRecommendedQueues(
  data: QueueItem[],
  storesByShopId: Map<number, Store>
): QueueItem[] {
  const buckets = new Map<RecommendationCluster, QueueItem[]>();

  data.forEach((item) => {
    if (!isEligibleRecommendation(item)) {
      return;
    }

    const store = storesByShopId.get(item.shopId);

    if (!store) {
      return;
    }

    const existingBucket = buckets.get(store.recommendationCluster);

    if (existingBucket) {
      existingBucket.push(item);
      return;
    }

    buckets.set(store.recommendationCluster, [item]);
  });

  const regionWinners = Array.from(buckets.values())
    .map((bucket) => bucket.sort(compareQueueItems)[0])
    .sort(compareQueueItems)
    .slice(0, 3);

  if (regionWinners.length === 3) {
    return regionWinners;
  }

  const selectedShopIds = new Set(regionWinners.map((item) => item.shopId));
  const remainingCandidates = Array.from(buckets.values())
    .flatMap((bucket) => bucket)
    .filter((item) => !selectedShopIds.has(item.shopId))
    .sort(compareQueueItems);

  return [...regionWinners, ...remainingCandidates].slice(0, 3);
}
