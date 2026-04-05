import { QueueItem, QueueRecommendationState } from '@/lib/types';
import { getQueuePriority } from '@/lib/utils';

export function isRecommendableStatus(storeStatus: string): boolean {
  return storeStatus === 'OPEN' || storeStatus === 'BUSY';
}

export function normalizeQueueCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function getSortableQueueCount(queueCount: number | null): number {
  return queueCount ?? Number.POSITIVE_INFINITY;
}

export function getRecommendationState(
  storeStatus: string,
  queueCount: number | null
): QueueRecommendationState {
  if (!isRecommendableStatus(storeStatus)) {
    return 'INELIGIBLE';
  }

  if (queueCount === null) {
    return 'UNAVAILABLE';
  }

  if (queueCount === 0) {
    return 'IMMEDIATE';
  }

  return 'WAITING';
}

export function compareQueueItems(left: QueueItem, right: QueueItem): number {
  const leftCount = getSortableQueueCount(left.queueCount);
  const rightCount = getSortableQueueCount(right.queueCount);

  if (leftCount < rightCount) {
    return -1;
  }

  if (leftCount > rightCount) {
    return 1;
  }

  return left.name.localeCompare(right.name, 'zh-HK');
}

export function buildQueueItem(
  name: string,
  storeStatus: string,
  rawQueueCount: unknown
): QueueItem {
  const queueCount = isRecommendableStatus(storeStatus)
    ? normalizeQueueCount(rawQueueCount)
    : null;

  return {
    name,
    storeStatus,
    queueCount,
    level: getQueuePriority(queueCount ?? 0),
    recommendationState: getRecommendationState(storeStatus, queueCount),
  };
}
