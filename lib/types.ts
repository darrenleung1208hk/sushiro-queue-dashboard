/**
 * TypeScript interfaces for Sushiro store queue data
 * Based on n8n workflow "get-store-queue-status"
 */

// Raw API response types
export interface StoreListResponse {
  id: number;
  name: string;
  nameEn: string;
  address: string;
  region: string;
  area: string;
  latitude: number;
  longitude: number;
  storeStatus: string;
  waitingGroup: number;
}

export interface QueueResponse {
  shopId: number;
  storeQueue: string[];
  storeStatus: string;
  waitingGroup: number;
}

// Final processed data structure from n8n workflow
export interface StoreQueueData {
  shopId: number;
  storeStatus: string;
  waitingGroup: number;
  storeQueue: string[];
  timestamp: string;
}

// Enhanced store data with location information
export interface Store extends StoreQueueData {
  name: string;
  nameEn: string;
  address: string;
  region: string;
  area: string;
  latitude?: number;
  longitude?: number;
}

// API request parameters
export interface StoreListParams {
  latitude: number;
  longitude: number;
  numresults: number;
  region: string;
}

export interface QueueParams {
  region: string;
  storeid: number;
}

// Workflow execution metadata
export interface WorkflowExecution {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  storesProcessed: number;
  data: StoreQueueData[];
}

// Store status constants
export const STORE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  BUSY: 'BUSY',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];

// Queue priority levels based on waiting group size
export const QUEUE_PRIORITY = {
  LOW: 'LOW', // 0-20 people
  MEDIUM: 'MEDIUM', // 21-50 people
  HIGH: 'HIGH', // 51-100 people
  EXTREME: 'EXTREME', // 100+ people
} as const;

export type QueuePriority =
  (typeof QUEUE_PRIORITY)[keyof typeof QUEUE_PRIORITY];

// Helper function to determine queue priority
export function getQueuePriority(waitingGroup: number): QueuePriority {
  if (waitingGroup === 0) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 20) return QUEUE_PRIORITY.LOW;
  if (waitingGroup <= 50) return QUEUE_PRIORITY.MEDIUM;
  if (waitingGroup <= 100) return QUEUE_PRIORITY.HIGH;
  return QUEUE_PRIORITY.EXTREME;
}

// Store region constants
export const STORE_REGIONS = {
  HONG_KONG_ISLAND: '香港島',
  KOWLOON: '九龍',
  NEW_TERRITORIES: '新界',
} as const;

export type StoreRegion = (typeof STORE_REGIONS)[keyof typeof STORE_REGIONS];

// Store area constants (common areas in Hong Kong)
export const STORE_AREAS = {
  // Hong Kong Island
  CENTRAL_WESTERN: '中西區',
  WAN_CHAI: '灣仔區',
  EASTERN: '東區',
  SOUTHERN: '南區',

  // Kowloon
  YAU_TSIM_MONG: '油尖旺區',
  SHAM_SHUI_PO: '深水埗區',
  WONG_TAI_SIN: '黃大仙區',
  KOWLOON_CITY: '九龍城區',
  KWUN_TONG: '觀塘區',

  // New Territories
  KWAI_TSING: '葵青區',
  TUEN_MUN: '屯門區',
  YUEN_LONG: '元朗區',
  NORTH: '北區',
  TAI_PO: '大埔區',
  SHA_TIN: '沙田區',
  SAI_KUNG: '西貢區',
  ISLANDS: '離島區',
} as const;

export type StoreArea = (typeof STORE_AREAS)[keyof typeof STORE_AREAS];

// API response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

// Dashboard specific types
export interface DashboardStats {
  totalStores: number;
  openStores: number;
  closedStores: number;
  totalWaiting: number;
  totalQueueTickets: number;
  averageWaitTime?: number;
  busiestStore?: Store;
  leastBusyStore?: Store;
}

// Filter and search types
export interface StoreFilters {
  status?: StoreStatus;
  region?: StoreRegion;
  area?: StoreArea;
  priority?: QueuePriority;
  searchTerm?: string;
}

// Sorting options
export interface SortOptions {
  field: 'name' | 'waitingGroup' | 'queueLength' | 'region' | 'area';
  direction: 'asc' | 'desc';
}
