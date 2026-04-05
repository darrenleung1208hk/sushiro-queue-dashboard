import {
  RECOMMENDATION_CLUSTERS,
  RecommendationCluster,
  STORE_AREAS,
  STORE_REGIONS,
} from '@/lib/types';

const AREA_CLUSTER_ENTRIES: Array<readonly [string, RecommendationCluster]> = [
  [STORE_AREAS.CENTRAL_WESTERN, RECOMMENDATION_CLUSTERS.HK_ISLAND],
  [STORE_AREAS.WAN_CHAI, RECOMMENDATION_CLUSTERS.HK_ISLAND],
  [STORE_AREAS.EASTERN, RECOMMENDATION_CLUSTERS.HK_ISLAND],
  [STORE_AREAS.SOUTHERN, RECOMMENDATION_CLUSTERS.HK_ISLAND],
  [STORE_AREAS.YAU_TSIM_MONG, RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  [STORE_AREAS.SHAM_SHUI_PO, RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  [STORE_AREAS.KOWLOON_CITY, RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  [STORE_AREAS.WONG_TAI_SIN, RECOMMENDATION_CLUSTERS.EAST_KOWLOON],
  [STORE_AREAS.KWUN_TONG, RECOMMENDATION_CLUSTERS.EAST_KOWLOON],
  [STORE_AREAS.SHA_TIN, RECOMMENDATION_CLUSTERS.SHA_TIN_BELT],
  [STORE_AREAS.TAI_PO, RECOMMENDATION_CLUSTERS.NORTH_NT],
  [STORE_AREAS.NORTH, RECOMMENDATION_CLUSTERS.NORTH_NT],
  [STORE_AREAS.KWAI_TSING, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST],
  [STORE_AREAS.ISLANDS, RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST],
  [STORE_AREAS.TUEN_MUN, RECOMMENDATION_CLUSTERS.FAR_WEST_NT],
  [STORE_AREAS.YUEN_LONG, RECOMMENDATION_CLUSTERS.FAR_WEST_NT],
];

const AREA_TO_CLUSTER = new Map<string, RecommendationCluster>(
  AREA_CLUSTER_ENTRIES.map(([area, cluster]) => [
    normalizeLocationValue(area),
    cluster,
  ])
);

const AREA_ALIAS_ENTRIES: Array<readonly [string, RecommendationCluster]> = [
  ['CENTRAL AND WESTERN', RECOMMENDATION_CLUSTERS.HK_ISLAND],
  ['WAN CHAI', RECOMMENDATION_CLUSTERS.HK_ISLAND],
  ['EASTERN', RECOMMENDATION_CLUSTERS.HK_ISLAND],
  ['SOUTHERN', RECOMMENDATION_CLUSTERS.HK_ISLAND],
  ['YAU TSIM MONG', RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  ['SHAM SHUI PO', RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  ['KOWLOON CITY', RECOMMENDATION_CLUSTERS.WEST_KOWLOON],
  ['WONG TAI SIN', RECOMMENDATION_CLUSTERS.EAST_KOWLOON],
  ['KWUN TONG', RECOMMENDATION_CLUSTERS.EAST_KOWLOON],
  ['TSEUNG KWAN O', RECOMMENDATION_CLUSTERS.TSEUNG_KWAN_O],
  ['TSEUNG KWAN O AREA', RECOMMENDATION_CLUSTERS.TSEUNG_KWAN_O],
  ['SHA TIN', RECOMMENDATION_CLUSTERS.SHA_TIN_BELT],
  ['TAI PO', RECOMMENDATION_CLUSTERS.NORTH_NT],
  ['NORTH', RECOMMENDATION_CLUSTERS.NORTH_NT],
  ['TSUEN WAN', RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST],
  ['KWAI TSING', RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST],
  ['ISLANDS', RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST],
  ['TUEN MUN', RECOMMENDATION_CLUSTERS.FAR_WEST_NT],
  ['YUEN LONG', RECOMMENDATION_CLUSTERS.FAR_WEST_NT],
];

const AREA_ALIAS_TO_CLUSTER = new Map<string, RecommendationCluster>(
  AREA_ALIAS_ENTRIES.map(([area, cluster]) => [normalizeLocationValue(area), cluster])
);

const REGION_TO_CLUSTER = new Map<string, RecommendationCluster>([
  [
    normalizeLocationValue(STORE_REGIONS.HONG_KONG_ISLAND),
    RECOMMENDATION_CLUSTERS.HK_ISLAND,
  ],
]);

function normalizeLocationValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function deriveRecommendationCluster(
  region: string,
  area: string
): RecommendationCluster {
  // Prefer district-level mapping first since it gives tighter practical clusters.
  const normalizedArea = normalizeLocationValue(area);

  const mappedAreaCluster = AREA_TO_CLUSTER.get(normalizedArea);

  if (mappedAreaCluster) {
    return mappedAreaCluster;
  }

  const mappedAreaAliasCluster = AREA_ALIAS_TO_CLUSTER.get(normalizedArea);

  if (mappedAreaAliasCluster) {
    return mappedAreaAliasCluster;
  }

  // Region fallback is intentionally narrow to avoid over-broad grouping.
  const normalizedRegion = normalizeLocationValue(region);

  const mappedRegionCluster = REGION_TO_CLUSTER.get(normalizedRegion);

  if (mappedRegionCluster) {
    return mappedRegionCluster;
  }

  // Unknown is treated as a normal recommendation bucket upstream.
  return RECOMMENDATION_CLUSTERS.UNKNOWN;
}
