import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import { buildQueueItem, compareQueueItems } from '@/lib/queue-items';
import {
  buildQueueGroups,
  buildRecommendedQueues,
  createEmptyQueueGroups,
} from '@/lib/queue-response';
import { QueueApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<QueueApiResponse>> {
  try {
    const liveStores = await fetchLiveStores();
    const updatedAt = liveStores.timestamp ?? new Date();

    const data = liveStores.stores
      .map((store) =>
        buildQueueItem(store.name, store.storeStatus, store.waitingGroup)
      )
      .sort(compareQueueItems);
    const groups = buildQueueGroups(data);
    const recommended = buildRecommendedQueues(groups);

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
