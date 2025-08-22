import { Suspense } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Store } from '@/components/StoreCard';

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Loading Sushiro Dashboard</h2>
        <p className="text-muted-foreground">Fetching latest queue information...</p>
      </div>
    </div>
  );
}

// Server component that fetches data on the server
async function DashboardServer() {
  try {
    // Fetch data on the server side using absolute URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/stores`, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    
    const result = await response.json();
    const stores: Store[] = result.data;
    
    // Pass the server-fetched data directly to Dashboard
    return <Dashboard stores={stores} />;
  } catch (error) {
    console.error('Error fetching stores on server:', error);
    // Return error state instead of fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Failed to Load Data</h2>
          <p className="text-muted-foreground mb-4">Unable to fetch store information from the server.</p>
        </div>
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardServer />
    </Suspense>
  );
}
