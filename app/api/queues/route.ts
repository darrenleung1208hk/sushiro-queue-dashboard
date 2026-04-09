import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import {
  buildQueueSnapshot,
  buildUnavailableQueueSnapshot,
} from '@/lib/queue-snapshot';
import { QUEUE_SNAPSHOT_STATUS, QueueApiResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<QueueApiResponse>> {
  try {
    const snapshot = buildQueueSnapshot(await fetchLiveStores());
    const statusCode =
      snapshot.status === QUEUE_SNAPSHOT_STATUS.SUCCESS
        ? 200
        : snapshot.status === QUEUE_SNAPSHOT_STATUS.PARTIAL
          ? 206
          : 503;

    return NextResponse.json(snapshot, { status: statusCode });
  } catch (error) {
    console.error('Error in queues API:', error);

    return NextResponse.json(buildUnavailableQueueSnapshot(new Date()), {
      status: 503,
    });
  }
}
