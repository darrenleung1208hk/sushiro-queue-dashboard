import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import {
  buildQueueSnapshot,
  buildUnavailableQueueSnapshot,
  parseRecommendationPreference,
} from '@/lib/queue-snapshot';
import { QUEUE_SNAPSHOT_STATUS, QueueApiResponse } from '@/lib/types';

export async function GET(request: Request): Promise<NextResponse<QueueApiResponse>> {
  const preference = parseRecommendationPreference(
    new URL(request.url).searchParams
  );

  try {
    const snapshot = buildQueueSnapshot(await fetchLiveStores(), preference);
    const statusCode =
      snapshot.status === QUEUE_SNAPSHOT_STATUS.SUCCESS
        ? 200
        : snapshot.status === QUEUE_SNAPSHOT_STATUS.PARTIAL
          ? 206
          : 503;

    return NextResponse.json(snapshot, { status: statusCode });
  } catch (error) {
    console.error('Error in queues API:', error);

    return NextResponse.json(
      buildUnavailableQueueSnapshot(new Date(), 'STORE_DATA_UNAVAILABLE', preference),
      {
        status: 503,
      }
    );
  }
}
