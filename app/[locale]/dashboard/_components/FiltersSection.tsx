import React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FiltersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  regionFilter: string | null;
  onRegionFilterChange: (region: string | null) => void;
  waitingStatusFilter: string | null;
  onWaitingStatusFilterChange: (status: string | null) => void;
  uniqueRegions: string[];
  waitingStatusOptions: string[];
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
}) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row gap-2 bg-card rounded-lg p-3 border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('dashboard.filters.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {/* Region Filters */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={regionFilter === null ? 'primary' : 'outline'}
            className="cursor-pointer"
            onClick={() => onRegionFilterChange(null)}
          >
            {t('dashboard.filters.allRegions')}
          </Badge>
          {uniqueRegions.map((region) => (
            <Badge
              key={region}
              variant={regionFilter === region ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                onRegionFilterChange(regionFilter === region ? null : region)
              }
            >
              {t(`common.regions.${region}`)}
            </Badge>
          ))}
        </div>

        {/* Waiting Status Filters */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={waitingStatusFilter === null ? 'primary' : 'outline'}
            className="cursor-pointer"
            onClick={() => onWaitingStatusFilterChange(null)}
          >
            {t('dashboard.filters.allWaitTimes')}
          </Badge>
          {waitingStatusOptions.map((status) => (
            <Badge
              key={status}
              variant={
                waitingStatusFilter === status
                  ? status === 'LOW'
                    ? 'default'
                    : status === 'MEDIUM'
                      ? 'secondary'
                      : status === 'HIGH'
                        ? 'destructive'
                        : 'destructive'
                  : 'outline'
              }
              className="cursor-pointer"
              onClick={() =>
                onWaitingStatusFilterChange(
                  waitingStatusFilter === status ? null : status
                )
              }
            >
              {t(`dashboard.filters.${status.toLowerCase()}Wait`)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
