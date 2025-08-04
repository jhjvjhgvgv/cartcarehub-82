
import React from "react";
import { InitialLoading } from "@/components/App/InitialLoading";
import { MainApp } from "@/components/App/MainApp";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

function App() {
  return (
    <AuthErrorBoundary>
      <ErrorBoundary>
        <InitialLoading />
        <MainApp />
      </ErrorBoundary>
    </AuthErrorBoundary>
  );
}

export default App;
