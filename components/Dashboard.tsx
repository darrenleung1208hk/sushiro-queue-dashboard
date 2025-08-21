"use client"

import { useState, useMemo } from "react";
import { StoreCard, type Store } from "./StoreCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Store as StoreIcon, Users, Clock } from "lucide-react";

interface DashboardProps {
  stores: Store[];
}

export const Dashboard = ({ stores }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.area.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || store.storeStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalWaiting = stores.reduce((sum, store) => sum + store.waitingGroup, 0);
    const totalQueue = stores.reduce((sum, store) => sum + store.storeQueue.length, 0);
    const openStores = stores.filter(store => store.storeStatus === "OPEN").length;
    
    return { totalWaiting, totalQueue, openStores, totalStores: stores.length };
  }, [stores]);

  const uniqueStatuses = Array.from(new Set(stores.map(store => store.storeStatus)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Store Queue Dashboard</h1>
          <p className="text-muted-foreground">Monitor store queues and wait times in real-time</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <StoreIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stores</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStores}</p>
                <p className="text-xs text-success">{stats.openStores} Open</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Waiting</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalWaiting}</p>
                <p className="text-xs text-muted-foreground">Across all stores</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Tickets</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalQueue}</p>
                <p className="text-xs text-muted-foreground">In queue</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Search className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold text-foreground">{filteredStores.length}</p>
                <p className="text-xs text-muted-foreground">Showing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card rounded-lg p-4 border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores by name, region, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={statusFilter === null ? "primary" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter(null)}
            >
              All
            </Badge>
            {uniqueStatuses.map((status) => (
              <Badge
                key={status}
                variant={statusFilter === status ? (status === "OPEN" ? "default" : "destructive") : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Store Grid */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StoreCard key={store.shopId} store={store} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No stores found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};