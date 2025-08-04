
import React from "react";
import { InitialLoading } from "@/components/App/InitialLoading";
import { MainApp } from "@/components/App/MainApp";
import { ErrorBoundary } from "@/components/auth/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <InitialLoading />
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;
