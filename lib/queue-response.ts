import type { QueueGroupKey, QueueGroups, QueueItem } from './types';

export function getQueueGroup(item: QueueItem): QueueGroupKey {
  if (item.queueCount === null) {
    return 'unavailable';
  }

  if (item.queueCount === 0) {
    return 'available';
  }

  if (item.queueCount <= 15) {
    return 'low';
  }

  return 'busy';
}

export function createEmptyQueueGroups(): QueueGroups {
  return {
    available: [],
    low: [],
    busy: [],
    unavailable: [],
  };
}

export function buildQueueGroups(data: QueueItem[]): QueueGroups {
  const groups = createEmptyQueueGroups();

  data.forEach((item) => {
    groups[getQueueGroup(item)].push(item);
  });

  return groups;
}

export function buildRecommendedQueues(groups: QueueGroups): QueueItem[] {
  return [...groups.available, ...groups.low, ...groups.busy].slice(0, 3);
}
