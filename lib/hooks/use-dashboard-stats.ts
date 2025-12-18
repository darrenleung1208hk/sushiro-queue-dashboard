import { useMemo } from 'react';
import { Store } from '@/lib/types';

export const useDashboardStats = (stores: Store[]) => {
  const stats = useMemo(() => {
    const totalWaiting = stores.reduce(
      (sum, store) => sum + store.waitingGroup,
      0
    );
    const totalCurrentQueue = stores.reduce(
      (sum, store) => sum + store.storeQueue.length,
      0
    );
    const openStores = stores.filter(
      (store) => store.storeStatus === 'OPEN'
    ).length;

    return {
      totalWaiting,
      totalCurrentQueue,
      openStores,
      totalStores: stores.length,
    };
  }, [stores]);

  return stats;
};
