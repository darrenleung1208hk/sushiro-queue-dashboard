import { sendGAEvent } from '@next/third-parties/google';

/**
 * Google Analytics event tracking utilities for Sushiro Queue Dashboard
 */

type GAEventParams = Record<string, string | number | boolean | null>;

/**
 * Safely send a GA event - only fires if GA is configured
 */
function trackEvent(eventName: string, params: GAEventParams = {}) {
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ) {
    sendGAEvent('event', eventName, params);
  }
}

/**
 * Track when user searches for stores
 */
export function trackSearchUsed(searchTerm: string, resultsCount: number) {
  trackEvent('search_used', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track when user changes region filter
 */
export function trackRegionFilterChanged(
  region: string | null,
  previousRegion: string | null,
  storesShown: number
) {
  trackEvent('region_filter_changed', {
    region: region ?? 'all',
    previous_region: previousRegion ?? 'all',
    stores_shown: storesShown,
  });
}

/**
 * Track when user changes wait time filter
 */
export function trackWaitTimeFilterChanged(
  waitTime: string | null,
  previousWaitTime: string | null,
  storesShown: number
) {
  trackEvent('wait_time_filter_changed', {
    wait_time: waitTime ?? 'all',
    previous_wait_time: previousWaitTime ?? 'all',
    stores_shown: storesShown,
  });
}

/**
 * Track when user changes language
 */
export function trackLanguageChanged(fromLanguage: string, toLanguage: string) {
  trackEvent('language_changed', {
    from_language: fromLanguage,
    to_language: toLanguage,
  });
}

/**
 * Track when user manually refreshes data
 */
export function trackManualRefresh(timeSinceLastRefresh: number | null) {
  trackEvent('manual_refresh', {
    time_since_last_refresh_seconds: timeSinceLastRefresh ?? 0,
  });
}

/**
 * Track when user changes view mode (grid/list)
 */
export function trackViewModeChanged(
  viewMode: 'grid' | 'list',
  storesDisplayed: number
) {
  trackEvent('view_mode_changed', {
    view_mode: viewMode,
    stores_displayed: storesDisplayed,
  });
}

/**
 * Track when user applies multiple filters together
 */
export function trackFilterCombinationUsed(filters: {
  hasSearch: boolean;
  hasRegion: boolean;
  hasWaitTime: boolean;
  resultsCount: number;
}) {
  const activeFilters = [
    filters.hasSearch && 'search',
    filters.hasRegion && 'region',
    filters.hasWaitTime && 'wait_time',
  ].filter(Boolean);

  // Only track if multiple filters are used
  if (activeFilters.length >= 2) {
    trackEvent('filter_combination_used', {
      filters_used: activeFilters.join(','),
      filter_count: activeFilters.length,
      results_count: filters.resultsCount,
    });
  }
}
