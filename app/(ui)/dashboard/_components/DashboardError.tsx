interface DashboardErrorProps {
  error: unknown;
}

export function DashboardError({ error }: DashboardErrorProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-destructive" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-destructive mb-2">Failed to Load Data</h2>
        <p className="text-muted-foreground mb-4">Unable to fetch store information from the server.</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{errorMessage}</p>
      </div>
    </div>
  );
}
