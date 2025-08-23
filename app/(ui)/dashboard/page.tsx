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
    // Fetch live store data from the API
    const response = await fetch(`${process.env.BASE_URL}/api/stores/live`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const apiResponse = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch store data');
    }

    const stores: Store[] = apiResponse.data;

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
