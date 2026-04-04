import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import { QueueApiResponse, QueueItem } from '@/lib/types';
import { getQueuePriority } from '@/lib/utils';

function normalizeQueueCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function getSortableQueueCount(queueCount: number | null): number {
  return queueCount ?? Number.POSITIVE_INFINITY;
}

function compareQueueItems(left: QueueItem, right: QueueItem): number {
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

function buildQueueItem(
  name: string,
  storeStatus: string,
  rawQueueCount: unknown
): QueueItem {
  const normalizedQueueCount = normalizeQueueCount(rawQueueCount);
  const queueCount = storeStatus === 'OPEN' ? normalizedQueueCount : null;

  return {
    name,
    storeStatus,
    queueCount,
    level: getQueuePriority(queueCount ?? 0),
  };
}

export async function GET(): Promise<NextResponse<QueueApiResponse>> {
  try {
    const liveStores = await fetchLiveStores();
    const updatedAt = liveStores.timestamp ?? new Date();

    const data = liveStores.stores
      .map((store) =>
        buildQueueItem(store.name, store.storeStatus, store.waitingGroup)
      )
      .sort(compareQueueItems);

    return NextResponse.json({
      updatedAt: updatedAt.toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error in queues API:', error);

    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        data: [],
      },
      { status: 503 }
    );
  }
}
