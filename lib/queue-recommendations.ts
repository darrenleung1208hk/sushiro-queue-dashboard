import { compareQueueItems } from '@/lib/queue-items';
import { CLUSTER_ADJACENCY } from '@/lib/recommendation-clusters';
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

function getClusterForItem(
  item: QueueItem,
  storesByShopId: Map<number, Store>
): RecommendationCluster | null {
  return storesByShopId.get(item.shopId)?.recommendationCluster ?? null;
}

function getAnchorCluster(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>
): RecommendationCluster | null {
  const bestCandidate = [...candidates]
    .sort(compareQueueItems)
    .find((item) => getClusterForItem(item, storesByShopId) !== null);

  if (!bestCandidate) {
    return null;
  }

  return getClusterForItem(bestCandidate, storesByShopId);
}

function getEligibleCandidates(
  data: QueueItem[],
  storesByShopId: Map<number, Store>
): QueueItem[] {
  return data.filter(
    (item) =>
      isEligibleRecommendation(item) &&
      getClusterForItem(item, storesByShopId) !== null
  );
}

function getCandidatesInClusters(
  candidates: QueueItem[],
  relevantClusters: Set<RecommendationCluster>,
  storesByShopId: Map<number, Store>
): QueueItem[] {
  return candidates.filter((item) => {
    const cluster = getClusterForItem(item, storesByShopId);
    return cluster !== null && relevantClusters.has(cluster);
  });
}

function getEligibleItemsInCluster(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  cluster: RecommendationCluster
): QueueItem[] {
  return candidates
    .filter((item) => getClusterForItem(item, storesByShopId) === cluster)
    .sort(compareQueueItems);
}

function getScopedFallbackRecommendations(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  anchorCluster: RecommendationCluster,
  excludedShopIds: Set<number>
): QueueItem[] {
  const adjacentClusters = new Set<RecommendationCluster>(
    CLUSTER_ADJACENCY[anchorCluster]
  );
  return getCandidatesInClusters(
    candidates,
    adjacentClusters,
    storesByShopId
  )
    .filter((item) => !excludedShopIds.has(item.shopId))
    .sort(compareQueueItems);
}

function getGlobalFallbackRecommendations(
  candidates: QueueItem[],
  excludedShopIds: Set<number>
): QueueItem[] {
  return candidates
    .filter((item) => !excludedShopIds.has(item.shopId))
    .sort(compareQueueItems);
}

function buildPrimaryThenFallbackRecommendations(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  primaryCluster: RecommendationCluster
): QueueItem[] {
  const primaryCandidates = getEligibleItemsInCluster(
    candidates,
    storesByShopId,
    primaryCluster
  );
  const selectedPrimary = primaryCandidates.slice(0, 3);

  if (selectedPrimary.length === 3) {
    return selectedPrimary;
  }

  const selectedShopIds = new Set(selectedPrimary.map((item) => item.shopId));
  const fallbackCandidates = getScopedFallbackRecommendations(
    candidates,
    storesByShopId,
    primaryCluster,
    selectedShopIds
  );
  const selectedWithAdjacentFallback = [
    ...selectedPrimary,
    ...fallbackCandidates,
  ].slice(0, 3);

  if (selectedWithAdjacentFallback.length === 3) {
    return selectedWithAdjacentFallback;
  }

  const adjacentFallbackShopIds = new Set([
    ...Array.from(selectedShopIds),
    ...fallbackCandidates.map((item) => item.shopId),
  ]);
  const globalFallbackCandidates = getGlobalFallbackRecommendations(
    candidates,
    adjacentFallbackShopIds
  );

  return [...selectedWithAdjacentFallback, ...globalFallbackCandidates].slice(
    0,
    3
  );
}

export function buildRecommendedQueues(
  data: QueueItem[],
  storesByShopId: Map<number, Store>,
  preferredCluster?: RecommendationCluster
): QueueItem[] {
  const eligibleCandidates = getEligibleCandidates(data, storesByShopId);

  if (preferredCluster) {
    return buildPrimaryThenFallbackRecommendations(
      eligibleCandidates,
      storesByShopId,
      preferredCluster
    );
  }

  const anchorCluster = getAnchorCluster(eligibleCandidates, storesByShopId);

  if (!anchorCluster) {
    return [];
  }

  return buildPrimaryThenFallbackRecommendations(
    eligibleCandidates,
    storesByShopId,
    anchorCluster
  );
}
