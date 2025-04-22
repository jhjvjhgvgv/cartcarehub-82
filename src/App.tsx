
import React, { useEffect, useState, Suspense } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { LoadingView } from "@/components/auth/LoadingView"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { InstallPWA } from "@/components/ui/install-pwa"
import { TestModeIndicator } from "@/components/ui/test-mode-indicator"
import { AppRoutes } from "@/components/routing/AppRoutes"

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
})

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simple loading delay - but only do it once per session
    if (!sessionStorage.getItem('initial_load_complete')) {
      const timer = setTimeout(() => {
        setLoading(false)
        sessionStorage.setItem('initial_load_complete', 'true')
      }, 1000)
  
      return () => clearTimeout(timer)
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <LoadingView onLoadingComplete={() => setLoading(false)} />
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}

export default App
