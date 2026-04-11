import {
  QueueItem,
  RECOMMENDATION_CLUSTERS,
  RECOMMENDATION_FALLBACK_REASON_CODES,
  RECOMMENDATION_MODES,
  RecommendationBranchOption,
  RecommendationCluster,
  RecommendationFallbackReasonCode,
  RecommendationMode,
  RecommendationPreferenceInput,
  RecommendationPreferenceMeta,
  Store,
} from '@/lib/types';

function isEligibleRecommendation(item: QueueItem): boolean {
  return (
    item.recommendationState === 'IMMEDIATE' ||
    item.recommendationState === 'WAITING'
  );
}

function isRecommendationCluster(
  value: string
): value is RecommendationCluster {
  return Object.values(RECOMMENDATION_CLUSTERS).includes(
    value as RecommendationCluster
  );
}

export function parseRecommendationPreference(
  searchParams: URLSearchParams
): RecommendationPreferenceInput {
  const preferredBranchValue = searchParams.get('preferredBranch');
  const preferredClusterValue = searchParams.get('preferredCluster');

  const preferredBranchShopId =
    preferredBranchValue !== null &&
    /^\d+$/.test(preferredBranchValue) &&
    Number(preferredBranchValue) > 0
      ? Number(preferredBranchValue)
      : undefined;

  const preferredCluster =
    preferredClusterValue !== null &&
    isRecommendationCluster(preferredClusterValue)
      ? preferredClusterValue
      : undefined;

  return {
    preferredBranchShopId,
    preferredCluster,
  };
}

function buildBranchOptions(
  storesByShopId: Map<number, Store>
): RecommendationBranchOption[] {
  return Array.from(storesByShopId.values())
    .map((store) => ({
      shopId: store.shopId,
      name: store.name,
      cluster: store.recommendationCluster,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-HK'));
}

function buildClusterOptions(
  storesByShopId: Map<number, Store>
): RecommendationCluster[] {
  const clusterSet = new Set<RecommendationCluster>();

  storesByShopId.forEach((store) => {
    if (store.recommendationCluster !== RECOMMENDATION_CLUSTERS.UNKNOWN) {
      clusterSet.add(store.recommendationCluster);
    }
  });

  return Object.values(RECOMMENDATION_CLUSTERS).filter(
    (cluster) =>
      cluster !== RECOMMENDATION_CLUSTERS.UNKNOWN && clusterSet.has(cluster)
  );
}

function getEligibleClusterCandidates(
  data: QueueItem[],
  storesByShopId: Map<number, Store>,
  cluster: RecommendationCluster
): QueueItem[] {
  return data.filter(
    (item) =>
      isEligibleRecommendation(item) &&
      storesByShopId.get(item.shopId)?.recommendationCluster === cluster
  );
}

function createPreferenceMeta(
  input: RecommendationPreferenceInput,
  activeMode: RecommendationMode,
  storesByShopId: Map<number, Store>,
  overrides: Partial<
    Pick<
      RecommendationPreferenceMeta,
      'activeBranchShopId' | 'activeCluster' | 'fallbackReasonCode'
    >
  > = {}
): RecommendationPreferenceMeta {
  return {
    requestedBranchShopId: input.preferredBranchShopId,
    requestedCluster: input.preferredCluster,
    activeMode,
    activeBranchShopId: overrides.activeBranchShopId,
    activeCluster: overrides.activeCluster,
    fallbackReasonCode: overrides.fallbackReasonCode,
    branchOptions: buildBranchOptions(storesByShopId),
    clusterOptions: buildClusterOptions(storesByShopId),
  };
}

export function resolveRecommendationPreference(
  input: RecommendationPreferenceInput,
  data: QueueItem[],
  storesByShopId: Map<number, Store>
): RecommendationPreferenceMeta {
  const preferredBranch =
    input.preferredBranchShopId !== undefined
      ? data.find((item) => item.shopId === input.preferredBranchShopId)
      : undefined;
  const preferredBranchStore =
    input.preferredBranchShopId !== undefined
      ? storesByShopId.get(input.preferredBranchShopId)
      : undefined;
  const preferredBranchEligible =
    preferredBranch !== undefined &&
    preferredBranchStore !== undefined &&
    isEligibleRecommendation(preferredBranch);

  if (preferredBranchEligible) {
    return createPreferenceMeta(input, RECOMMENDATION_MODES.BRANCH, storesByShopId, {
      activeBranchShopId: preferredBranch.shopId,
      activeCluster:
        preferredBranchStore.recommendationCluster !== RECOMMENDATION_CLUSTERS.UNKNOWN
          ? preferredBranchStore.recommendationCluster
          : undefined,
    });
  }

  const branchFallbackReason: RecommendationFallbackReasonCode | undefined =
    input.preferredBranchShopId === undefined
      ? undefined
      : preferredBranchStore === undefined
        ? RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_NOT_FOUND
        : RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_BRANCH_INELIGIBLE;

  if (input.preferredCluster !== undefined) {
    const eligibleClusterCandidates = getEligibleClusterCandidates(
      data,
      storesByShopId,
      input.preferredCluster
    );

    if (eligibleClusterCandidates.length > 0) {
      return createPreferenceMeta(
        input,
        RECOMMENDATION_MODES.CLUSTER,
        storesByShopId,
        {
          activeCluster: input.preferredCluster,
          fallbackReasonCode: branchFallbackReason,
        }
      );
    }

    return createPreferenceMeta(input, RECOMMENDATION_MODES.AUTO, storesByShopId, {
      fallbackReasonCode:
        branchFallbackReason ??
        RECOMMENDATION_FALLBACK_REASON_CODES.PREFERRED_CLUSTER_UNAVAILABLE,
    });
  }

  return createPreferenceMeta(input, RECOMMENDATION_MODES.AUTO, storesByShopId, {
    fallbackReasonCode: branchFallbackReason,
  });
}
