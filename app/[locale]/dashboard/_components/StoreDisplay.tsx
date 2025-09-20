import React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Store } from '@/lib/types';
import { StoreCard } from './StoreCard';
import { StoreListItem } from './StoreListItem';

interface StoreDisplayProps {
  stores: Store[];
  viewMode: 'grid' | 'list';
  isLoading?: boolean;
}

export const StoreDisplay: React.FC<StoreDisplayProps> = ({
  stores,
  viewMode,
  isLoading = false,
}) => {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {Array.from({ length: 24 }).map((_, index) => (
          <StoreCard key={index} isLoading={isLoading} />
        ))}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-base font-semibold text-foreground mb-1">
          {t('dashboard.noResults.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('dashboard.noResults.message')}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {stores.map((store) => (
          <StoreCard key={store.shopId} store={store} isLoading={isLoading} />
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {stores.map((store) => (
          <StoreListItem key={store.shopId} store={store} />
        ))}
      </div>
    );
  }
};
