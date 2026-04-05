import { describe, expect, it } from 'vitest';

import { deriveRecommendationCluster } from '@/lib/recommendation-clusters';
import {
  RECOMMENDATION_CLUSTERS,
  STORE_AREAS,
  STORE_REGIONS,
} from '@/lib/types';

describe('recommendation cluster derivation', () => {
  it('maps Hong Kong Island districts to HK_ISLAND', () => {
    expect(
      deriveRecommendationCluster('', STORE_AREAS.CENTRAL_WESTERN)
    ).toBe(RECOMMENDATION_CLUSTERS.HK_ISLAND);
    expect(deriveRecommendationCluster('', STORE_AREAS.WAN_CHAI)).toBe(
      RECOMMENDATION_CLUSTERS.HK_ISLAND
    );
  });

  it('maps west Kowloon districts to WEST_KOWLOON', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.YAU_TSIM_MONG)).toBe(
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.SHAM_SHUI_PO)).toBe(
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.KOWLOON_CITY)).toBe(
      RECOMMENDATION_CLUSTERS.WEST_KOWLOON
    );
  });

  it('maps east Kowloon districts to EAST_KOWLOON', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.WONG_TAI_SIN)).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.KWUN_TONG)).toBe(
      RECOMMENDATION_CLUSTERS.EAST_KOWLOON
    );
  });

  it('maps Tseung Kwan O aliases to TSEUNG_KWAN_O', () => {
    expect(deriveRecommendationCluster('', 'Tseung Kwan O')).toBe(
      RECOMMENDATION_CLUSTERS.TSEUNG_KWAN_O
    );
  });

  it('maps Sha Tin to SHA_TIN_BELT', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.SHA_TIN)).toBe(
      RECOMMENDATION_CLUSTERS.SHA_TIN_BELT
    );
  });

  it('maps Tai Po and North to NORTH_NT', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.TAI_PO)).toBe(
      RECOMMENDATION_CLUSTERS.NORTH_NT
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.NORTH)).toBe(
      RECOMMENDATION_CLUSTERS.NORTH_NT
    );
  });

  it('maps Tsuen Wan belt districts to TSUEN_KWAN_WEST', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.KWAI_TSING)).toBe(
      RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.ISLANDS)).toBe(
      RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST
    );
    expect(deriveRecommendationCluster('', 'Tsuen Wan')).toBe(
      RECOMMENDATION_CLUSTERS.TSUEN_KWAN_WEST
    );
  });

  it('maps Tuen Mun and Yuen Long to FAR_WEST_NT', () => {
    expect(deriveRecommendationCluster('', STORE_AREAS.TUEN_MUN)).toBe(
      RECOMMENDATION_CLUSTERS.FAR_WEST_NT
    );
    expect(deriveRecommendationCluster('', STORE_AREAS.YUEN_LONG)).toBe(
      RECOMMENDATION_CLUSTERS.FAR_WEST_NT
    );
  });

  it('uses narrow region fallback for Hong Kong Island', () => {
    expect(deriveRecommendationCluster(STORE_REGIONS.HONG_KONG_ISLAND, '')).toBe(
      RECOMMENDATION_CLUSTERS.HK_ISLAND
    );
  });

  it('returns UNKNOWN for unmapped inputs', () => {
    expect(deriveRecommendationCluster('', 'Unknown Area')).toBe(
      RECOMMENDATION_CLUSTERS.UNKNOWN
    );
  });
});
