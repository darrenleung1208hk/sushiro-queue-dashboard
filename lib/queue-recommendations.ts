import { compareQueueItems } from '@/lib/queue-items';
import { CLUSTER_ADJACENCY } from '@/lib/recommendation-clusters';
import {
  QueueItem,
  RECOMMENDATION_MODES,
  RECOMMENDATION_REASON_CODES,
  RecommendedQueueItem,
  RecommendationCluster,
  RecommendationPreferenceMeta,
  RecommendationReasonCode,
  Store,
} from '@/lib/types';

type RecommendationScope =
  | 'preferred-branch'
  | 'same-cluster'
  | 'selected-cluster'
  | 'adjacent'
  | 'global'
  | 'auto';

interface RecommendationBuildResult {
  items: RecommendedQueueItem[];
  activeCluster?: RecommendationCluster;
}

function isEligibleRecommendation(item: QueueItem): boolean {
  return (
    item.recommendationState === 'IMMEDIATE' ||
    item.recommendationState === 'WAITING'
  );
}

function getClusterForItem(
  item: QueueItem,
  storesByShopId: Map<number, Store>
): RecommendationCluster | null {
  return storesByShopId.get(item.shopId)?.recommendationCluster ?? null;
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

function getCandidatesInCluster(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  cluster: RecommendationCluster
): QueueItem[] {
  return candidates
    .filter((item) => getClusterForItem(item, storesByShopId) === cluster)
    .sort(compareQueueItems);
}

function getCandidatesInClusters(
  candidates: QueueItem[],
  relevantClusters: Set<RecommendationCluster>,
  storesByShopId: Map<number, Store>
): QueueItem[] {
  return candidates
    .filter((item) => {
      const cluster = getClusterForItem(item, storesByShopId);
      return cluster !== null && relevantClusters.has(cluster);
    })
    .sort(compareQueueItems);
}

function buildReasonCodes(
  item: QueueItem,
  storesByShopId: Map<number, Store>,
  preference: RecommendationPreferenceMeta,
  scope: RecommendationScope
): RecommendationReasonCode[] {
  const reasonCodes: RecommendationReasonCode[] = [];
  const itemCluster = getClusterForItem(item, storesByShopId);

  if (
    preference.activeMode === RECOMMENDATION_MODES.BRANCH &&
    preference.activeBranchShopId === item.shopId
  ) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.PREFERRED_BRANCH);
  } else if (
    preference.activeMode === RECOMMENDATION_MODES.BRANCH &&
    scope === 'same-cluster'
  ) {
    reasonCodes.push(
      RECOMMENDATION_REASON_CODES.SAME_CLUSTER_AS_PREFERRED_BRANCH
    );
  } else if (
    preference.activeMode === RECOMMENDATION_MODES.CLUSTER &&
    itemCluster === preference.activeCluster
  ) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.IN_SELECTED_CLUSTER);
  } else if (
    scope === 'adjacent' &&
    preference.activeCluster !== undefined &&
    itemCluster !== null
  ) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.NEARBY_FALLBACK);
  } else if (scope === 'global') {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.BEST_FALLBACK);
  }

  if (item.queueCount === 0) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.OPEN_NOW);
  } else if (item.queueCount !== null && item.queueCount <= 15) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.SHORT_WAIT);
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push(RECOMMENDATION_REASON_CODES.BEST_FALLBACK);
  }

  return reasonCodes;
}

function toRecommendedItem(
  item: QueueItem,
  storesByShopId: Map<number, Store>,
  preference: RecommendationPreferenceMeta,
  scope: RecommendationScope
): RecommendedQueueItem {
  return {
    ...item,
    reasonCodes: buildReasonCodes(item, storesByShopId, preference, scope),
  };
}

function appendCandidates(
  selected: Array<{ item: QueueItem; scope: RecommendationScope }>,
  candidates: QueueItem[],
  scope: RecommendationScope
): Array<{ item: QueueItem; scope: RecommendationScope }> {
  const selectedShopIds = new Set(selected.map((entry) => entry.item.shopId));

  candidates.forEach((candidate) => {
    if (!selectedShopIds.has(candidate.shopId) && selected.length < 3) {
      selected.push({ item: candidate, scope });
      selectedShopIds.add(candidate.shopId);
    }
  });

  return selected;
}

function buildClusterRecommendations(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  preference: RecommendationPreferenceMeta,
  primaryCluster: RecommendationCluster,
  primaryScope: RecommendationScope
): RecommendationBuildResult {
  const selected: Array<{ item: QueueItem; scope: RecommendationScope }> = [];
  const primaryCandidates = getCandidatesInCluster(
    candidates,
    storesByShopId,
    primaryCluster
  );
  appendCandidates(selected, primaryCandidates, primaryScope);

  if (selected.length < 3) {
    const adjacentClusters = new Set<RecommendationCluster>(
      CLUSTER_ADJACENCY[primaryCluster]
    );
    const adjacentCandidates = getCandidatesInClusters(
      candidates,
      adjacentClusters,
      storesByShopId
    );
    appendCandidates(selected, adjacentCandidates, 'adjacent');
  }

  if (selected.length < 3) {
    appendCandidates(selected, [...candidates].sort(compareQueueItems), 'global');
  }

  return {
    activeCluster: primaryCluster,
    items: selected.map(({ item, scope }) =>
      toRecommendedItem(item, storesByShopId, preference, scope)
    ),
  };
}

function buildBranchRecommendations(
  candidates: QueueItem[],
  storesByShopId: Map<number, Store>,
  preference: RecommendationPreferenceMeta
): RecommendationBuildResult {
  const selected: Array<{ item: QueueItem; scope: RecommendationScope }> = [];
  const preferredBranch = candidates.find(
    (item) => item.shopId === preference.activeBranchShopId
  );

  if (preferredBranch) {
    selected.push({ item: preferredBranch, scope: 'preferred-branch' });
  }

  if (preference.activeCluster !== undefined) {
    const sameClusterCandidates = getCandidatesInCluster(
      candidates,
      storesByShopId,
      preference.activeCluster
    );
    appendCandidates(selected, sameClusterCandidates, 'same-cluster');

    if (selected.length < 3) {
      const adjacentClusters = new Set<RecommendationCluster>(
        CLUSTER_ADJACENCY[preference.activeCluster]
      );
      const adjacentCandidates = getCandidatesInClusters(
        candidates,
        adjacentClusters,
        storesByShopId
      );
      appendCandidates(selected, adjacentCandidates, 'adjacent');
    }
  }

  if (selected.length < 3) {
    appendCandidates(selected, [...candidates].sort(compareQueueItems), 'global');
  }

  return {
    activeCluster: preference.activeCluster,
    items: selected.map(({ item, scope }) =>
      toRecommendedItem(item, storesByShopId, preference, scope)
    ),
  };
}

export function buildRecommendedQueues(
  data: QueueItem[],
  storesByShopId: Map<number, Store>,
  preference: RecommendationPreferenceMeta
): RecommendationBuildResult {
  const eligibleCandidates = getEligibleCandidates(data, storesByShopId);

  if (preference.activeMode === RECOMMENDATION_MODES.BRANCH) {
    return buildBranchRecommendations(
      eligibleCandidates,
      storesByShopId,
      preference
    );
  }

  if (
    preference.activeMode === RECOMMENDATION_MODES.CLUSTER &&
    preference.activeCluster !== undefined
  ) {
    return buildClusterRecommendations(
      eligibleCandidates,
      storesByShopId,
      preference,
      preference.activeCluster,
      'selected-cluster'
    );
  }

  const anchorCluster = getAnchorCluster(eligibleCandidates, storesByShopId);

  if (!anchorCluster) {
    return { items: [] };
  }

  return buildClusterRecommendations(
    eligibleCandidates,
    storesByShopId,
    preference,
    anchorCluster,
    'auto'
  );
}
