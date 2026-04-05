import { describe, expect, it } from 'vitest';

import {
  buildQueueItem,
  compareQueueItems,
  getRecommendationState,
  getSortableQueueCount,
  isRecommendableStatus,
  normalizeQueueCount,
} from '@/lib/queue-items';

describe('queue item helpers', () => {
  it('normalizes queue counts and recommendable statuses', () => {
    expect(isRecommendableStatus('OPEN')).toBe(true);
    expect(isRecommendableStatus('BUSY')).toBe(true);
    expect(isRecommendableStatus('CLOSED')).toBe(false);

    expect(normalizeQueueCount(0)).toBe(0);
    expect(normalizeQueueCount(12)).toBe(12);
    expect(normalizeQueueCount(-1)).toBeNull();
    expect(normalizeQueueCount(Number.NaN)).toBeNull();
    expect(normalizeQueueCount('12')).toBeNull();
  });

  it('derives recommendation state deterministically', () => {
    expect(getRecommendationState('CLOSED', 0)).toBe('INELIGIBLE');
    expect(getRecommendationState('OPEN', null)).toBe('UNAVAILABLE');
    expect(getRecommendationState('OPEN', 0)).toBe('IMMEDIATE');
    expect(getRecommendationState('BUSY', 10)).toBe('WAITING');
  });

  it('builds queue items with normalized queue data', () => {
    expect(buildQueueItem('Mong Kok', 'OPEN', 0)).toEqual({
      name: 'Mong Kok',
      storeStatus: 'OPEN',
      queueCount: 0,
      level: 'LOW',
      recommendationState: 'IMMEDIATE',
    });

    expect(buildQueueItem('Central', 'OPEN', 'unknown')).toEqual({
      name: 'Central',
      storeStatus: 'OPEN',
      queueCount: null,
      level: 'LOW',
      recommendationState: 'UNAVAILABLE',
    });

    expect(buildQueueItem('Sha Tin', 'CLOSED', 5)).toEqual({
      name: 'Sha Tin',
      storeStatus: 'CLOSED',
      queueCount: null,
      level: 'LOW',
      recommendationState: 'INELIGIBLE',
    });
  });

  it('sorts by queue count first and then by name', () => {
    const immediate = buildQueueItem('Zeta', 'OPEN', 0);
    const waiting = buildQueueItem('Alpha', 'OPEN', 2);
    const unavailableA = buildQueueItem('Beta', 'OPEN', 'unknown');
    const unavailableB = buildQueueItem('Alpha', 'CLOSED', 0);

    const sorted = [unavailableA, immediate, unavailableB, waiting].sort(
      compareQueueItems
    );

    expect(sorted).toEqual([immediate, waiting, unavailableB, unavailableA]);
    expect(getSortableQueueCount(null)).toBe(Number.POSITIVE_INFINITY);
  });
});
