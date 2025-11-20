import React, { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  const statCards = [
    {
      icon: StoreIcon,
      iconBgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      title: t('dashboard.stats.totalStores'),
      value: stats.totalStores,
      subtitle: t('dashboard.stats.openStores'),
    },
    {
      icon: Users,
      iconBgColor: 'bg-warning/10',
      iconColor: 'text-warning',
      title: t('dashboard.stats.totalWaiting'),
      value: stats.totalWaiting,
      subtitle: t('dashboard.stats.acrossAllStores'),
    },
    {
      icon: Clock,
      iconBgColor: 'bg-success/10',
      iconColor: 'text-success',
      title: t('dashboard.stats.currentQueue'),
      value: stats.totalCurrentQueue,
      subtitle: t('dashboard.stats.activeTickets'),
    },
    {
      icon: Search,
      iconBgColor: 'bg-destructive/10',
      iconColor: 'text-destructive',
      title: t('dashboard.stats.filteredResults'),
      value: filteredCount,
      subtitle: t('dashboard.stats.showing'),
    },
  ];

  // Generate random delays only on client after mount to avoid hydration mismatch
  // Only on initial visit (when totalStores is 0), no staggered animation on refresh
  const isInitialVisit = stats.totalStores === 0;
  const [statDelays, setStatDelays] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (isInitialVisit) {
      // Generate delays only on client side
      setStatDelays(Array.from({ length: 4 }).map(() => Math.random() * 400 + 100));
    }
  }, [isInitialVisit]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={isInitialVisit && isMounted ? 'animate-fade-in-up' : ''}
          style={
            isInitialVisit && isMounted && statDelays[index]
              ? {
                  animationDelay: `${statDelays[index]}ms`,
                }
              : {}
          }
        >
          <StatCard
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
};
