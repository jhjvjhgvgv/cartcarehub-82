
import React from "react";
import { InitialLoading } from "@/components/App/InitialLoading";
import { MainApp } from "@/components/App/MainApp";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

function App() {
  return (
    <AuthErrorBoundary>
      <ErrorBoundary>
        <AdminAuthProvider>
          <InitialLoading />
          <MainApp />
        </AdminAuthProvider>
      </ErrorBoundary>
    </AuthErrorBoundary>
  );
}

export default App;
