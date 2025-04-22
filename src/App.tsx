
import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { LoadingView } from "@/components/auth/LoadingView";
import { Toaster } from "@/components/ui/toaster";
import { InstallPWA } from "@/components/ui/install-pwa";
import { TestModeIndicator } from "@/components/ui/test-mode-indicator";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useInitialLoading } from "@/hooks/use-initial-loading";

function App() {
  const { loading, setLoading } = useInitialLoading();

  if (loading) {
    return <LoadingView onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <QueryProvider>
      <Router>
        <div className="fixed top-4 right-4 z-50">
          <InstallPWA />
        </div>
        <Suspense fallback={<LoadingView onLoadingComplete={() => {}} />}>
          <AppRoutes />
        </Suspense>
        <TestModeIndicator />
        <Toaster />
      </Router>
    </QueryProvider>
  );
}

export default App;
