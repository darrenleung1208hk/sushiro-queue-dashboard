import { describe, expect, it } from 'vitest';

import { buildQueueGroups, buildRecommendedQueues } from '@/lib/queue-response';
import { QueueItem } from '@/lib/types';

function createQueueItem(
  name: string,
  queueCount: number | null,
  recommendationState: QueueItem['recommendationState'] = 'WAITING',
  storeStatus = 'OPEN'
): QueueItem {
  return {
    name,
    storeStatus,
    queueCount,
    level: 'LOW',
    recommendationState,
  };
}

describe('queue response helpers', () => {
  it('classifies items into fixed ordered groups', () => {
    const available = createQueueItem('Central', 0, 'IMMEDIATE');
    const low = createQueueItem('Kowloon', 12);
    const busy = createQueueItem('Tsuen Wan', 24);
    const unavailable = createQueueItem('Causeway Bay', null, 'UNAVAILABLE');

    const groups = buildQueueGroups([available, low, busy, unavailable]);

    expect(Object.keys(groups)).toEqual([
      'available',
      'low',
      'busy',
      'unavailable',
    ]);
    expect(groups.available[0]).toBe(available);
    expect(groups.low[0]).toBe(low);
    expect(groups.busy[0]).toBe(busy);
    expect(groups.unavailable[0]).toBe(unavailable);
  });

  it('reuses eligible item references and excludes unavailable items from recommendations', () => {
    const availableA = createQueueItem('Central', 0, 'IMMEDIATE');
    const availableB = createQueueItem('Mong Kok', 0, 'IMMEDIATE');
    const low = createQueueItem('Tsim Sha Tsui', 4);
    const busy = createQueueItem('Sha Tin', 16);
    const unavailable = createQueueItem('Tai Po', null, 'UNAVAILABLE');

    const groups = buildQueueGroups([
      availableA,
      availableB,
      low,
      busy,
      unavailable,
    ]);
    const recommended = buildRecommendedQueues(groups);

    expect(recommended).toHaveLength(3);
    expect(recommended).toEqual([availableA, availableB, low]);
    expect(recommended[0]).toBe(availableA);
    expect(recommended[1]).toBe(availableB);
    expect(recommended[2]).toBe(low);
    expect(recommended).not.toContain(unavailable);
  });

  it('falls back from available to low to busy when building recommendations', () => {
    const lowA = createQueueItem('Admiralty', 2);
    const lowB = createQueueItem('Jordan', 8);
    const busy = createQueueItem('Yuen Long', 20);

    const groups = buildQueueGroups([lowA, lowB, busy]);
    const recommended = buildRecommendedQueues(groups);

    expect(recommended).toEqual([lowA, lowB, busy]);
  });
});
