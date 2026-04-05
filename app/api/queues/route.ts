import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import { buildQueueItem, compareQueueItems } from '@/lib/queue-items';
import { buildRecommendedQueues } from '@/lib/queue-recommendations';
import {
  buildQueueGroups,
  createEmptyQueueGroups,
} from '@/lib/queue-response';
import { QueueApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<QueueApiResponse>> {
  try {
    const liveStores = await fetchLiveStores();
    const storesByShopId = new Map(
      liveStores.stores.map((store) => [store.shopId, store] as const)
    );
    const updatedAt = liveStores.timestamp ?? new Date();

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
    const groups = buildQueueGroups(data);
    const recommended = buildRecommendedQueues(data, storesByShopId);

    return NextResponse.json({
      updatedAt: updatedAt.toISOString(),
      data,
      recommended,
      groups,
    });
  } catch (error) {
    console.error('Error in queues API:', error);

    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        data: [],
        recommended: [],
        groups: createEmptyQueueGroups(),
      },
      { status: 503 }
    );
  }
}
