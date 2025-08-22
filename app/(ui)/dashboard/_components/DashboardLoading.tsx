export function DashboardLoading() {
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
