import { NextResponse } from 'next/server';
import { Store, StoreListResponse, QueueResponse, ApiResponse } from '@/lib/types';

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
  region: 'HK'
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
async function fetchStoreList(params: StoreListParams = {}): Promise<StoreListResponse[]> {
  const queryParams = new URLSearchParams({
    latitude: (params.latitude || DEFAULT_PARAMS.latitude).toString(),
    longitude: (params.longitude || DEFAULT_PARAMS.longitude).toString(),
    numresults: (params.numresults || DEFAULT_PARAMS.numresults).toString(),
    region: params.region || DEFAULT_PARAMS.region
  });

  const url = `${CORS_PROXY}/?${STORE_LIST_API}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, { next: { revalidate: 30 } });

    if (!response.ok) {
      throw new Error(`Store list API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching store list:', error);
    throw new Error(`Failed to fetch store list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches queue data for a specific store
 */
async function fetchStoreQueue(storeId: number, region: string = 'HK'): Promise<QueueResponse | null> {
  const queryParams = new URLSearchParams({
    region,
    storeid: storeId.toString()
  });

  const url = `${CORS_PROXY}?${QUEUE_API}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sushiro-Queue-Dashboard/1.0'
      },
      next: { revalidate: 15 } // Cache for 15 seconds (more frequent updates for queue data)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Store not found or no queue data
      }
      throw new Error(`Queue API error: ${response.status} ${response.statusText}`);
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
      storeStatus: store.storeStatus || 'UNKNOWN',
      waitingGroup: queue?.waitingGroup || store.waitingGroup || 0,
      storeQueue: queue?.storeQueue || [],
      timestamp: new Date().toISOString(),
      name: store.name || '',
      nameEn: store.nameEn || '',
      address: store.address || '',
      region: store.region || '',
      area: store.area || '',
      latitude: store.latitude,
      longitude: store.longitude
    };
  });
}

/**
 * Main API endpoint that replicates n8n workflow functionality
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: StoreListParams = {
      latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      numresults: searchParams.get('numresults') ? parseInt(searchParams.get('numresults')!) : undefined,
      region: searchParams.get('region') || undefined
    };

    console.log('Fetching live store data with params:', params);

    // Step 1: Fetch store list (equivalent to "Fetch Shops Data" in n8n)
    const storeList = await fetchStoreList(params);
    
    if (!storeList.length) {
      return NextResponse.json({
        success: false,
        error: 'No stores found',
        message: 'No stores available for the specified parameters',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    console.log(`Found ${storeList.length} stores, fetching queue data...`);

    // Step 2: Fetch queue data for each store (equivalent to "Loop Over Shops" + "Fetch Store Queue")
    const queueDataMap = new Map<number, QueueResponse | null>();
    
    // Process stores in parallel with concurrency limit to avoid overwhelming the API
    const concurrencyLimit = 5;
    const chunks = [];
    
    for (let i = 0; i < storeList.length; i += concurrencyLimit) {
      chunks.push(storeList.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (store) => {
        const queueData = await fetchStoreQueue(store.id, params.region || 'HK');
        return { storeId: store.id, queueData };
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

    // Step 4: Return final result
    const response: ApiResponse<Store[]> = {
      success: true,
      data: processedStores,
      timestamp: new Date().toISOString(),
      message: `Successfully fetched data for ${processedStores.length} stores`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in live stores API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}