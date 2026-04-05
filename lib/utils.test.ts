import { describe, expect, it } from 'vitest';

import { QUEUE_PRIORITY } from '@/lib/constants';
import { getQueuePriority } from '@/lib/utils';

describe('getQueuePriority', () => {
  it('returns LOW for zero and small waiting groups', () => {
    expect(getQueuePriority(0)).toBe(QUEUE_PRIORITY.LOW);
    expect(getQueuePriority(1)).toBe(QUEUE_PRIORITY.LOW);
    expect(getQueuePriority(15)).toBe(QUEUE_PRIORITY.LOW);
  });

  it('returns MEDIUM for mid-range waiting groups', () => {
    expect(getQueuePriority(16)).toBe(QUEUE_PRIORITY.MEDIUM);
    expect(getQueuePriority(30)).toBe(QUEUE_PRIORITY.MEDIUM);
  });

  it('returns HIGH for larger waiting groups', () => {
    expect(getQueuePriority(31)).toBe(QUEUE_PRIORITY.HIGH);
    expect(getQueuePriority(120)).toBe(QUEUE_PRIORITY.HIGH);
  });
});
