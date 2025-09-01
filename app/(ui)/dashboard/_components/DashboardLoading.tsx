import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Store as StoreIcon, Users, Clock } from 'lucide-react';

export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Total Stores Skeleton */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <StoreIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-[6px]">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Waiting Skeleton */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-warning/10 rounded-md">
                  <Users className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 space-y-[6px]">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tickets Skeleton */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-success/10 rounded-md">
                  <Clock className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 space-y-[6px]">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtered Results Skeleton */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-destructive/10 rounded-md">
                  <Search className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 space-y-[6px]">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 bg-card rounded-lg p-3 border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-10 w-full pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* View Toggle Skeleton */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Store Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border border-border shadow-sm"
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 shrink-0" />
                </div>

                <div className="space-y-2">
                  {/* Metrics Skeleton */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-md border">
                      <Skeleton className="h-3 w-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md border">
                      <Skeleton className="h-3 w-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>

                                     {/* Queue Details Skeleton - Always show for consistent layout */}
                   <div className="space-y-1">
                     <Skeleton className="h-2.5 w-24" />
                     <div className="flex flex-wrap gap-1">
                       <Skeleton className="h-5 w-12" />
                       <Skeleton className="h-5 w-12" />
                       <Skeleton className="h-5 w-12" />
                     </div>
                   </div>

                                     {/* Location Skeleton */}
                   <div className="flex items-start gap-2 pt-2 border-t border-border">
                     <Skeleton className="h-3 w-3 mt-0.5 shrink-0" />
                     <div>
                       <Skeleton className="h-2.5 w-32" />
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Status Bar Skeleton */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg px-4 py-3 flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="hidden sm:inline h-3 w-24" />
            <div className="flex items-center gap-2 pr-2 sm:pr-0">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="w-16 h-2 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
