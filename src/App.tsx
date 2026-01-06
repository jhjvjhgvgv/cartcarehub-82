import React from "react";
import { MainApp } from "@/components/App/MainApp";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { useInitialLoading } from "@/hooks/use-initial-loading";
import { LoadingView } from "@/components/auth/LoadingView";

function AppContent() {
  const { loading, setLoading } = useInitialLoading();
  
  if (loading) {
    return <LoadingView onLoadingComplete={() => setLoading(false)} />;
  }
  
  return <MainApp />;
}

function App() {
  return (
    <AuthErrorBoundary>
      <ErrorBoundary>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </ErrorBoundary>
    </AuthErrorBoundary>
  );
}

export default App;
