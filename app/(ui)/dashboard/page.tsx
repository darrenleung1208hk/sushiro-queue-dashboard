import { Suspense } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Store } from '@/components/StoreCard';
import {
  DashboardLoading,
  DashboardError,
} from '@/app/(ui)/dashboard/_components';

// Server component that fetches data on the server
async function DashboardServer() {
  try {
    // Simple inline function that returns sample data
    const getStores = (): Store[] => [
      {
        shopId: 34,
        storeStatus: 'OPEN',
        waitingGroup: 62,
        storeQueue: ['265', '266', '267'],
        timestamp: '2025-08-17T18:35:23.683+08:00',
        name: '香港仔利港商場店',
        nameEn: 'Aberdeen Port Centre Shopping Arcade',
        address: '香港香港仔成都道38號利港商場3樓301號舖',
        region: '香港島',
        area: '南區',
      },
      {
        shopId: 42,
        storeStatus: 'OPEN',
        waitingGroup: 28,
        storeQueue: ['301', '302'],
        timestamp: '2025-08-17T18:32:15.421+08:00',
        name: '銅鑼灣時代廣場店',
        nameEn: 'Causeway Bay Times Square',
        address: '香港銅鑼灣勿地臣街1號時代廣場地庫1樓B108號舖',
        region: '香港島',
        area: '灣仔區',
      },
      {
        shopId: 58,
        storeStatus: 'CLOSED',
        waitingGroup: 0,
        storeQueue: [],
        timestamp: '2025-08-17T18:00:00.000+08:00',
        name: '旺角朗豪坊店',
        nameEn: 'Mong Kok Langham Place',
        address: '九龍旺角亞皆老街8號朗豪坊14樓1401號舖',
        region: '九龍',
        area: '油尖旺區',
      },
    ];

    const stores = getStores();

    // Pass the data directly to Dashboard
    return <Dashboard stores={stores} />;
  } catch (error) {
    console.error('Error in dashboard server:', error);
    return <DashboardError error={error} />;
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardServer />
    </Suspense>
  );
}
