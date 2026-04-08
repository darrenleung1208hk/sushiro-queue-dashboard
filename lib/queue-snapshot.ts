import type { LiveStoresResult } from '@/lib/live-stores';
import { buildQueueItem, compareQueueItems } from '@/lib/queue-items';
import { buildRecommendedQueues } from '@/lib/queue-recommendations';
import { buildQueueGroups, createEmptyQueueGroups } from '@/lib/queue-response';
import {
  QUEUE_SNAPSHOT_STATUS,
  QueueApiResponse,
  QueueSnapshotStatus,
} from '@/lib/types';

function getQueueSnapshotStatus(
  liveStores: LiveStoresResult
): QueueSnapshotStatus {
  if (liveStores.totalStores === 0) {
    return QUEUE_SNAPSHOT_STATUS.UNAVAILABLE;
  }

  if (liveStores.failedQueueFetches > 0) {
    return QUEUE_SNAPSHOT_STATUS.PARTIAL;
  }

  return QUEUE_SNAPSHOT_STATUS.SUCCESS;
}

export function buildUnavailableQueueSnapshot(
  updatedAt: Date,
  errorCode = 'STORE_DATA_UNAVAILABLE'
): QueueApiResponse {
  return {
    status: QUEUE_SNAPSHOT_STATUS.UNAVAILABLE,
    updatedAt: updatedAt.toISOString(),
    data: [],
    recommended: [],
    groups: createEmptyQueueGroups(),
    warnings: [],
    partialData: false,
    errorCode,
    meta: {
      totalStores: 0,
      successfulQueueFetches: 0,
      failedQueueFetches: 0,
    },
  };
}

export function buildQueueSnapshot(
  liveStores: LiveStoresResult
): QueueApiResponse {
  const status = getQueueSnapshotStatus(liveStores);

  if (status === QUEUE_SNAPSHOT_STATUS.UNAVAILABLE) {
    return buildUnavailableQueueSnapshot(liveStores.timestamp);
  }

  const storesByShopId = new Map(
    liveStores.stores.map((store) => [store.shopId, store] as const)
  );
  const data = liveStores.stores
    .map((store) =>
      buildQueueItem(
        store.shopId,
        store.name,
        store.storeStatus,
        store.waitingGroup
      )
    )
    .sort(compareQueueItems);
  const recommended = buildRecommendedQueues(data, storesByShopId);
  const groups = buildQueueGroups(data);
  const warnings =
    status === QUEUE_SNAPSHOT_STATUS.PARTIAL
      ? [
          liveStores.successfulQueueFetches > 0
            ? `Queue data is unavailable for ${liveStores.failedQueueFetches} branches.`
            : 'Queue data is currently unavailable for all branches.',
        ]
      : [];

  return {
    status,
    updatedAt: liveStores.timestamp.toISOString(),
    data,
    recommended,
    groups,
    warnings,
    partialData: status === QUEUE_SNAPSHOT_STATUS.PARTIAL,
    errorCode:
      status === QUEUE_SNAPSHOT_STATUS.PARTIAL
        ? liveStores.successfulQueueFetches > 0
          ? 'QUEUE_DATA_PARTIAL'
          : 'QUEUE_DATA_UNAVAILABLE'
        : undefined,
    meta: {
      totalStores: liveStores.totalStores,
      successfulQueueFetches: liveStores.successfulQueueFetches,
      failedQueueFetches: liveStores.failedQueueFetches,
    },
  };
}
