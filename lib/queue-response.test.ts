import { describe, expect, it } from 'vitest';

import { buildQueueGroups } from '@/lib/queue-response';
import { QueueItem } from '@/lib/types';

function createQueueItem(
  shopId: number,
  name: string,
  queueCount: number | null,
  recommendationState: QueueItem['recommendationState'] = 'WAITING',
  storeStatus = 'OPEN'
): QueueItem {
  return {
    shopId,
    name,
    storeStatus,
    queueCount,
    level: 'LOW',
    recommendationState,
  };
}

describe('queue response helpers', () => {
  it('classifies items into fixed ordered groups', () => {
    const available = createQueueItem(1, 'Central', 0, 'IMMEDIATE');
    const low = createQueueItem(2, 'Kowloon', 12);
    const busy = createQueueItem(3, 'Tsuen Wan', 24);
    const unavailable = createQueueItem(
      4,
      'Causeway Bay',
      null,
      'UNAVAILABLE'
    );

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
});
