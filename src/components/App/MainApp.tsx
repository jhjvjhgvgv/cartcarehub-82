
import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { InstallPWA } from "@/components/ui/install-pwa";
import { TestModeIndicator } from "@/components/ui/test-mode-indicator";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { LoadingView } from "@/components/auth/LoadingView";

export function MainApp() {
  return (
    <QueryProvider>
      <AdminAuthProvider>
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
      </AdminAuthProvider>
    </QueryProvider>
  );
}
