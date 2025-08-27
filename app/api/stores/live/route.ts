import { NextResponse } from 'next/server';
import {
  Store,
  StoreListResponse,
  QueueResponse,
  ApiResponse,
} from '@/lib/types';

// CORS proxy URL (same as n8n workflow)
const CORS_PROXY = process.env.CORS_PROXY_URL as string;

// Sushiro API endpoints
const STORE_LIST_API = process.env.SUSHIRO_STORE_LIST_API as string;
const QUEUE_API = process.env.SUSHIRO_QUEUE_API as string;

// Default parameters for Hong Kong
const DEFAULT_PARAMS = {
  latitude: 22.3193, // Hong Kong latitude
  longitude: 114.1694, // Hong Kong longitude
  numresults: 25,
  region: 'HK',
};

interface StoreListParams {
  latitude?: number;
  longitude?: number;
  numresults?: number;
  region?: string;
}

/**
 * Fetches store list from Sushiro API
 */
async function fetchStoreList(
  params: StoreListParams = {}
): Promise<StoreListResponse[]> {
  const queryParams = new URLSearchParams({
    latitude: (params.latitude || DEFAULT_PARAMS.latitude).toString(),
    longitude: (params.longitude || DEFAULT_PARAMS.longitude).toString(),
    numresults: (params.numresults || DEFAULT_PARAMS.numresults).toString(),
    region: params.region || DEFAULT_PARAMS.region,
  });

  const url = `${CORS_PROXY}/?${STORE_LIST_API}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, { next: { revalidate: 30 } });

    if (!response.ok) {
      throw new Error(
        `Store list API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching store list:', error);
    throw new Error(
      `Failed to fetch store list: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Fetches queue data for a specific store
 */
async function fetchStoreQueue(
  storeId: number,
  region: string = 'HK'
): Promise<QueueResponse | null> {
  const queryParams = new URLSearchParams({
    region,
    storeid: storeId.toString(),
  });

  const url = `${CORS_PROXY}?${QUEUE_API}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, { next: { revalidate: 15 } });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Store not found or no queue data
      }
      throw new Error(
        `Queue API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching queue for store ${storeId}:`, error);
    return null; // Return null instead of throwing to continue processing other stores
  }
}

/**
 * Processes and merges store data with queue information
 */
function processStoreData(
  storeList: StoreListResponse[],
  queueData: Map<number, QueueResponse | null>
): Store[] {
  return storeList.map(store => {
    const queue = queueData.get(store.id);

    return {
      shopId: store.id,
      name: store.name || '',
      nameEn: store.nameEn || '',
      storeStatus: store.storeStatus || 'UNKNOWN',
      waitingGroup: store.waitingGroup || 0,
      storeQueue: queue?.storeQueue || [],
      address: store.address || '',
      region: store.region || '',
      area: store.area || '',
      timestamp: new Date(),
      latitude: store.latitude,
      longitude: store.longitude,
    };
  });
}

/**
 * Main API endpoint that replicates n8n workflow functionality
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Store[]>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: StoreListParams = {
      latitude: searchParams.get('latitude')
        ? parseFloat(searchParams.get('latitude')!)
        : undefined,
      longitude: searchParams.get('longitude')
        ? parseFloat(searchParams.get('longitude')!)
        : undefined,
      numresults: searchParams.get('numresults')
        ? parseInt(searchParams.get('numresults')!)
        : undefined,
      region: searchParams.get('region') || undefined,
    };

    console.log('Fetching live store data with params:', params);

    // Step 1: Fetch store list (equivalent to "Fetch Shops Data" in n8n)
    let storeList: StoreListResponse[];
    try {
      storeList = await fetchStoreList(params);
    } catch (storeError) {
      console.error('Failed to fetch store list:', storeError);
      return NextResponse.json(
        {
          success: false,
          error: 'STORE_DATA_UNAVAILABLE',
          message: 'Unable to fetch store information. Please try again later.',
          timestamp: new Date(),
          data: [] as Store[],
        },
        { status: 503 }
      );
    }

    if (!storeList.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_STORES_FOUND',
          message: 'No stores available for the specified parameters',
          timestamp: new Date(),
          data: [] as Store[],
        },
        { status: 404 }
      );
    }

    console.log(`Found ${storeList.length} stores, fetching queue data...`);

    // Step 2: Fetch queue data for each store (equivalent to "Loop Over Shops" + "Fetch Store Queue")
    const queueDataMap = new Map<number, QueueResponse | null>();
    const queueErrors: Array<{ storeId: number; error: string }> = [];
    let successfulQueueFetches = 0;

    // Process stores in parallel with concurrency limit to avoid overwhelming the API
    const concurrencyLimit = 5;
    const chunks = [];

    for (let i = 0; i < storeList.length; i += concurrencyLimit) {
      chunks.push(storeList.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async store => {
        try {
          const queueData = await fetchStoreQueue(
            store.id,
            params.region || 'HK'
          );
          if (queueData !== null) {
            successfulQueueFetches++;
          }
          return { storeId: store.id, queueData, error: null };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          queueErrors.push({ storeId: store.id, error: errorMessage });
          console.error(
            `Failed to fetch queue for store ${store.id}:`,
            errorMessage
          );
          return { storeId: store.id, queueData: null, error: errorMessage };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ storeId, queueData }) => {
        queueDataMap.set(storeId, queueData);
      });

      // Small delay between chunks to be respectful to the API
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Step 3: Process and merge data (equivalent to "Merge" + "Add Timestamp" in n8n)
    const processedStores = processStoreData(storeList, queueDataMap);

    console.log(`Successfully processed ${processedStores.length} stores`);
    console.log(
      `Queue data available for ${successfulQueueFetches}/${storeList.length} stores`
    );

    // Determine response status based on data availability
    const hasStoreData = storeList.length > 0;
    const hasQueueData = successfulQueueFetches > 0;
    const allDataAvailable = hasStoreData && hasQueueData;
    const partialDataAvailable = hasStoreData && !hasQueueData;

    let responseStatus: 'success' | 'partial_success' | 'error';
    let statusCode: number;
    let message: string;
    let error: string | undefined;

    if (allDataAvailable) {
      responseStatus = 'success';
      statusCode = 200;
      message = `Successfully fetched complete data for ${processedStores.length} stores`;
    } else if (partialDataAvailable) {
      responseStatus = 'partial_success';
      statusCode = 206; // Partial Content
      message = `Store data available but queue data is currently unavailable. Showing ${processedStores.length} stores with limited information.`;
      error = 'QUEUE_DATA_UNAVAILABLE';
    } else {
      responseStatus = 'error';
      statusCode = 503;
      message = 'Store data is currently unavailable. Please try again later.';
      error = 'STORE_DATA_UNAVAILABLE';
    }

    // Add warnings if there were queue fetch errors
    if (queueErrors.length > 0) {
      console.warn(
        `Queue fetch errors for ${queueErrors.length} stores:`,
        queueErrors
      );
      if (responseStatus === 'success') {
        message += ` Note: Queue data may be incomplete for some stores.`;
      }
    }

    // Step 4: Return final result
    const responseData: Partial<ApiResponse<Store[]>> = {
      success: responseStatus === 'success',
      data: processedStores,
      timestamp: new Date(),
      message,
    };

    if (error) {
      responseData.error = error;
    }

    if (responseStatus === 'partial_success') {
      responseData.warnings = [
        `Queue data unavailable for ${storeList.length - successfulQueueFetches} stores`,
      ];
      responseData.partialData = true;
    }

    if (queueErrors.length > 0) {
      responseData.queueErrors = queueErrors.slice(0, 5); // Limit to first 5 errors to avoid response bloat
    }

    const response = responseData as ApiResponse<Store[]>;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Error in live stores API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        timestamp: new Date(),
        data: [] as Store[],
      },
      { status: 500 }
    );
  }
}
