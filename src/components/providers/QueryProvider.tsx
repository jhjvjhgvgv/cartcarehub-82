
import React from "react";
import { QueryClient, QueryClientProvider as TanstackQueryProvider } from "@tanstack/react-query";

// Create a client with optimized settings to prevent refresh loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1, // Reduced from default to prevent refresh loops
      refetchOnWindowFocus: false, // Prevent refetches on focus which can cause loops
      refetchOnReconnect: false, // Prevent refetches on reconnect which can cause loops
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}
