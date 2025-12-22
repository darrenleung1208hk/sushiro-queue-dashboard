import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, MapPin, Search, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  trackSearchUsed,
  trackRegionFilterChanged,
  trackWaitTimeFilterChanged,
  trackFilterCombinationUsed,
} from '@/lib/analytics';

interface FiltersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  regionFilter: string | null;
  onRegionFilterChange: (region: string | null) => void;
  waitingStatusFilter: string | null;
  onWaitingStatusFilterChange: (status: string | null) => void;
  uniqueRegions: string[];
  waitingStatusOptions: string[];
  filteredCount: number;
}

export const FiltersSection: React.FC<FiltersSectionProps> = ({
  searchTerm,
  onSearchChange,
  regionFilter,
  onRegionFilterChange,
  waitingStatusFilter,
  onWaitingStatusFilterChange,
  uniqueRegions,
  waitingStatusOptions,
  filteredCount,
}) => {
  const t = useTranslations();
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const previousRegionRef = useRef<string | null>(regionFilter);
  const previousWaitTimeRef = useRef<string | null>(waitingStatusFilter);

  useEffect(() => {
    const ref = stickyRef.current;
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is not intersecting, the element is sticky
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, []);

  // Debounced search tracking
  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);

      // Clear previous debounce
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      // Only track non-empty searches after user stops typing
      if (value.trim()) {
        searchDebounceRef.current = setTimeout(() => {
          trackSearchUsed(value, filteredCount);
          trackFilterCombinationUsed({
            hasSearch: Boolean(value.trim()),
            hasRegion: regionFilter !== null,
            hasWaitTime: waitingStatusFilter !== null,
            resultsCount: filteredCount,
          });
        }, 800);
      }
    },
    [onSearchChange, filteredCount, regionFilter, waitingStatusFilter]
  );

  // Region filter change with tracking
  const handleRegionChange = useCallback(
    (region: string | null) => {
      trackRegionFilterChanged(
        region,
        previousRegionRef.current,
        filteredCount
      );
      trackFilterCombinationUsed({
        hasSearch: Boolean(searchTerm.trim()),
        hasRegion: region !== null,
        hasWaitTime: waitingStatusFilter !== null,
        resultsCount: filteredCount,
      });
      previousRegionRef.current = region;
      onRegionFilterChange(region);
    },
    [onRegionFilterChange, filteredCount, searchTerm, waitingStatusFilter]
  );

  // Wait time filter change with tracking
  const handleWaitTimeChange = useCallback(
    (status: string | null) => {
      trackWaitTimeFilterChanged(
        status,
        previousWaitTimeRef.current,
        filteredCount
      );
      trackFilterCombinationUsed({
        hasSearch: Boolean(searchTerm.trim()),
        hasRegion: regionFilter !== null,
        hasWaitTime: status !== null,
        resultsCount: filteredCount,
      });
      previousWaitTimeRef.current = status;
      onWaitingStatusFilterChange(status);
    },
    [onWaitingStatusFilterChange, filteredCount, searchTerm, regionFilter]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const getRegionDisplayLabel = () => {
    if (regionFilter === null) {
      return t('dashboard.filters.allRegions');
    }
    return t(`common.regions.${regionFilter}`);
  };

  const getWaitTimeDisplayLabel = () => {
    if (waitingStatusFilter === null) {
      return t('dashboard.filters.allWaitTimes');
    }
    return t(`dashboard.filters.${waitingStatusFilter.toLowerCase()}Wait`);
  };

  const getWaitTimeVariantClass = (status: string | null) => {
    if (status === null) return '';
    switch (status) {
      case 'LOW':
        return 'text-green-600 dark:text-green-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'HIGH':
      case 'EXTREME':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Sentinel element to detect sticky state */}
      <div ref={stickyRef} className="h-0 w-full" aria-hidden="true" />

      {/* Outer wrapper - handles full-width when sticky */}
      <div
        className={cn(
          'sticky top-0 z-10 bg-card border-y border-border shadow-sm',
          'transition-[border-radius,box-shadow] duration-300 ease-in-out',
          isSticky
            ? 'w-screen ml-[calc(-50vw+50%)] rounded-none'
            : 'rounded-lg border-x'
        )}
      >
        {/* Inner wrapper - constrains content to container width */}
        <div
          className={cn(
            'flex flex-col sm:flex-row gap-2 p-3',
            isSticky ? 'max-w-7xl mx-auto px-4' : ''
          )}
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex gap-2">
            {/* Region Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 sm:flex-none justify-between min-w-0 sm:min-w-[160px]',
                    regionFilter !== null && 'border-primary'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{getRegionDisplayLabel()}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => handleRegionChange(null)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      regionFilter === null ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {t('dashboard.filters.allRegions')}
                </DropdownMenuItem>
                {uniqueRegions.map((region) => (
                  <DropdownMenuItem
                    key={region}
                    onClick={() => handleRegionChange(region)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        regionFilter === region ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {t(`common.regions.${region}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wait Time Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 sm:flex-none justify-between min-w-0 sm:min-w-[160px]',
                    waitingStatusFilter !== null && 'border-primary'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Timer className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span
                      className={cn(
                        'truncate',
                        getWaitTimeVariantClass(waitingStatusFilter)
                      )}
                    >
                      {getWaitTimeDisplayLabel()}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => handleWaitTimeChange(null)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      waitingStatusFilter === null ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {t('dashboard.filters.allWaitTimes')}
                </DropdownMenuItem>
                {waitingStatusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleWaitTimeChange(status)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        waitingStatusFilter === status
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className={getWaitTimeVariantClass(status)}>
                      {t(`dashboard.filters.${status.toLowerCase()}Wait`)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
