import { NextResponse } from 'next/server';

import { fetchLiveStores } from '@/lib/live-stores';
import { ApiResponse, Store } from '@/lib/types';

interface StoreListParams {
  latitude?: number;
  longitude?: number;
  numresults?: number;
  region?: string;
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Store[]>>> {
  try {
    const { searchParams } = new URL(request.url);

    const params: StoreListParams = {
      latitude: searchParams.get('latitude')
        ? parseFloat(searchParams.get('latitude')!)
        : undefined,
      longitude: searchParams.get('longitude')
        ? parseFloat(searchParams.get('longitude')!)
        : undefined,
      numresults: searchParams.get('numresults')
        ? parseInt(searchParams.get('numresults')!, 10)
        : undefined,
      region: searchParams.get('region') || undefined,
    };

    const { stores, timestamp, successfulQueueFetches, queueErrors } =
      await fetchLiveStores(params);

    if (!stores.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_STORES_FOUND',
          message: 'No stores available for the specified parameters',
          timestamp,
          data: [],
        },
        { status: 404 }
      );
    }

    const hasQueueData = successfulQueueFetches > 0;
    const response: ApiResponse<Store[]> = {
      success: hasQueueData,
      data: stores,
      timestamp,
      message: hasQueueData
        ? `Successfully fetched complete data for ${stores.length} stores`
        : `Store data available but queue data is currently unavailable. Showing ${stores.length} stores with limited information.`,
    };

    if (!hasQueueData) {
      response.error = 'QUEUE_DATA_UNAVAILABLE';
      response.warnings = [
        `Queue data unavailable for ${stores.length - successfulQueueFetches} stores`,
      ];
      response.partialData = true;
    }

    if (queueErrors.length > 0) {
      response.queueErrors = queueErrors.slice(0, 5);
      if (hasQueueData) {
        response.message = `${response.message} Note: Queue data may be incomplete for some stores.`;
      }
    }

    return NextResponse.json(response, { status: hasQueueData ? 200 : 206 });
  } catch (error) {
    console.error('Error in live stores API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'STORE_DATA_UNAVAILABLE',
        message: 'Unable to fetch store information. Please try again later.',
        timestamp: new Date(),
        data: [],
      },
      { status: 503 }
    );
  }
}
