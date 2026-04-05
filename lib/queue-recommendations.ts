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

function getExpandedClusters(
  anchorCluster: RecommendationCluster
): RecommendationCluster[] {
  const visited = new Set<RecommendationCluster>([anchorCluster]);
  const orderedClusters: RecommendationCluster[] = [anchorCluster];
  let frontier: RecommendationCluster[] = [anchorCluster];

  while (frontier.length > 0) {
    const nextFrontier: RecommendationCluster[] = [];

    frontier.forEach((cluster) => {
      CLUSTER_ADJACENCY[cluster].forEach((adjacentCluster) => {
        if (visited.has(adjacentCluster)) {
          return;
        }

        visited.add(adjacentCluster);
        orderedClusters.push(adjacentCluster);
        nextFrontier.push(adjacentCluster);
      });
    });

    frontier = nextFrontier;
  }

  return orderedClusters;
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

function getScopedFallbackRecommendations(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  anchorCluster: RecommendationCluster,
  excludedShopIds: Set<number>
): QueueItem[] {
  const orderedClusters = getExpandedClusters(anchorCluster);
  const relevantClusters = new Set<RecommendationCluster>([
    anchorCluster,
    ...CLUSTER_ADJACENCY[anchorCluster],
  ]);

  for (const cluster of orderedClusters) {
    relevantClusters.add(cluster);

    const scopedCandidates = getCandidatesInClusters(
      candidates,
      relevantClusters,
      storesByShopId
    )
      .filter((item) => !excludedShopIds.has(item.shopId))
      .sort(compareQueueItems);

    if (scopedCandidates.length >= 3) {
      return scopedCandidates;
    }
  }

  return candidates
    .filter((item) => !excludedShopIds.has(item.shopId))
    .sort(compareQueueItems);
}

export function buildRecommendedQueues(
  data: QueueItem[],
  storesByShopId: Map<number, Store>,
  preferredCluster?: RecommendationCluster
): QueueItem[] {
  const eligibleCandidates = getEligibleCandidates(data, storesByShopId);

  if (preferredCluster) {
    const preferredCandidates = eligibleCandidates
      .filter(
        (item) => getClusterForItem(item, storesByShopId) === preferredCluster
      )
      .sort(compareQueueItems);

    const selectedPreferred = preferredCandidates.slice(0, 3);

    if (selectedPreferred.length === 3) {
      return selectedPreferred;
    }

    const selectedShopIds = new Set(
      selectedPreferred.map((item) => item.shopId)
    );
    const fallbackCandidates = getScopedFallbackRecommendations(
      eligibleCandidates,
      storesByShopId,
      preferredCluster,
      selectedShopIds
    );

    return [...selectedPreferred, ...fallbackCandidates].slice(0, 3);
  }

  const anchorCluster = getAnchorCluster(eligibleCandidates, storesByShopId);

  if (!anchorCluster) {
    return [];
  }

  return getScopedFallbackRecommendations(
    eligibleCandidates,
    storesByShopId,
    anchorCluster,
    new Set<number>()
  ).slice(0, 3);
}
