import React from 'react';
import { useTranslations } from 'next-intl';
import { StoreIcon, Users, Clock, Search } from 'lucide-react';

import { StatCard } from './StatCard';

interface StatsOverviewProps {
  stats: {
    totalStores: number;
    totalWaiting: number;
    totalCurrentQueue: number;
  };
  filteredCount: number;
  isLoading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  filteredCount,
  isLoading = false,
}) => {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <StatCard
        icon={StoreIcon}
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
        title={t('dashboard.stats.totalStores')}
        value={stats.totalStores}
        subtitle={t('dashboard.stats.openStores')}
        isLoading={isLoading}
      />

      <StatCard
        icon={Users}
        iconBgColor="bg-warning/10"
        iconColor="text-warning"
        title={t('dashboard.stats.totalWaiting')}
        value={stats.totalWaiting}
        subtitle={t('dashboard.stats.acrossAllStores')}
        isLoading={isLoading}
      />

      <StatCard
        icon={Clock}
        iconBgColor="bg-success/10"
        iconColor="text-success"
        title={t('dashboard.stats.currentQueue')}
        value={stats.totalCurrentQueue}
        subtitle={t('dashboard.stats.activeTickets')}
        isLoading={isLoading}
      />

      <StatCard
        icon={Search}
        iconBgColor="bg-destructive/10"
        iconColor="text-destructive"
        title={t('dashboard.stats.filteredResults')}
        value={filteredCount}
        subtitle={t('dashboard.stats.showing')}
        isLoading={isLoading}
      />
    </div>
  );
};
