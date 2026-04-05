import { QueueResponse, Store, StoreListResponse } from '@/lib/types';
import { deriveRecommendationCluster } from '@/lib/recommendation-clusters';

const CORS_PROXY = process.env.CORS_PROXY_URL as string;
const STORE_LIST_API = process.env.SUSHIRO_STORE_LIST_API as string;
const QUEUE_API = process.env.SUSHIRO_QUEUE_API as string;

const DEFAULT_PARAMS = {
  latitude: 22.3193,
  longitude: 114.1694,
  numresults: 100,
  region: 'HK',
} as const;

interface LiveStoreParams {
  latitude?: number;
  longitude?: number;
  numresults?: number;
  region?: string;
}

interface QueueError {
  storeId: number;
  error: string;
}

export interface LiveStoresResult {
  stores: Store[];
  timestamp: Date;
  successfulQueueFetches: number;
  queueErrors: QueueError[];
}

async function fetchStoreList(
  params: LiveStoreParams = {}
): Promise<StoreListResponse[]> {
  const queryParams = new URLSearchParams({
    latitude: String(params.latitude ?? DEFAULT_PARAMS.latitude),
    longitude: String(params.longitude ?? DEFAULT_PARAMS.longitude),
    numresults: String(params.numresults ?? DEFAULT_PARAMS.numresults),
    region: params.region ?? DEFAULT_PARAMS.region,
  });

  const url = `${CORS_PROXY}/?${STORE_LIST_API}?${queryParams.toString()}`;
  const response = await fetch(url, { next: { revalidate: 30 } });

  if (!response.ok) {
    throw new Error(
      `Store list API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function fetchStoreQueue(
  storeId: number,
  region: string
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
        return null;
      }

      throw new Error(
        `Queue API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data as QueueResponse;
  } catch (error) {
    console.error(`Error fetching queue for store ${storeId}:`, error);
    return null;
  }
}

function buildStores(
  storeList: StoreListResponse[],
  queueData: Map<number, QueueResponse | null>,
  timestamp: Date
): Store[] {
  return storeList.map((store) => ({
    shopId: store.id,
    name: store.name || '',
    nameEn: store.nameEn || '',
    storeStatus: store.storeStatus || 'UNKNOWN',
    waitingGroup: Number.isFinite(store.waitingGroup)
      ? store.waitingGroup
      : Number.NaN,
    storeQueue: queueData.get(store.id)?.storeQueue || [],
    address: store.address || '',
    region: store.region || '',
    area: store.area || '',
    recommendationCluster: deriveRecommendationCluster(
      store.region || '',
      store.area || ''
    ),
    timestamp,
    latitude: store.latitude,
    longitude: store.longitude,
  }));
}

export async function fetchLiveStores(
  params: LiveStoreParams = {}
): Promise<LiveStoresResult> {
  const storeList = await fetchStoreList(params);

  if (!storeList.length) {
    return {
      stores: [],
      timestamp: new Date(),
      successfulQueueFetches: 0,
      queueErrors: [],
    };
  }

  const region = params.region ?? DEFAULT_PARAMS.region;
  const queueDataMap = new Map<number, QueueResponse | null>();
  const queueErrors: QueueError[] = [];
  let successfulQueueFetches = 0;
  const concurrencyLimit = 5;

  for (let index = 0; index < storeList.length; index += concurrencyLimit) {
    const chunk = storeList.slice(index, index + concurrencyLimit);

    const results = await Promise.all(
      chunk.map(async (store) => {
        try {
          const queueData = await fetchStoreQueue(store.id, region);
          if (queueData !== null) {
            successfulQueueFetches += 1;
          }

          return { storeId: store.id, queueData };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          queueErrors.push({ storeId: store.id, error: errorMessage });
          return { storeId: store.id, queueData: null };
        }
      })
    );

    results.forEach(({ storeId, queueData }) => {
      queueDataMap.set(storeId, queueData);
    });

    if (index + concurrencyLimit < storeList.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const timestamp = new Date();

  return {
    stores: buildStores(storeList, queueDataMap, timestamp),
    timestamp,
    successfulQueueFetches,
    queueErrors,
  };
}
