"use client";

import { Dashboard } from '@/components/Dashboard';
import { Store } from '@/components/StoreCard';

interface DashboardClientProps {
  stores: Store[];
}

export function DashboardClient({ stores }: DashboardClientProps) {
  return <Dashboard stores={stores} />;
}
