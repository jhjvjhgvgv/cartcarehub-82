
import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import Index from "@/pages/Index"
import Dashboard from "@/pages/Dashboard"
import Carts from "@/pages/Carts"
import CartDetails from "@/pages/CartDetails"
import Customers from "@/pages/Customers"
import Settings from "@/pages/Settings"
import Store from "@/pages/Store"
import Invite from "@/pages/Invite"
import ForgotPassword from "@/pages/ForgotPassword"
import { Toaster } from "@/components/ui/toaster"
import CustomerDashboard from "@/pages/customer/Dashboard"
import CartStatus from "@/pages/customer/CartStatus"
import ReportIssue from "@/pages/customer/ReportIssue"
import CustomerSettings from "@/pages/customer/Settings"
import { useToast } from "@/hooks/use-toast"
import { LoadingView } from "@/components/auth/LoadingView"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { InstallPWA } from "@/components/ui/install-pwa"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

function App() {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simple loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/invite" element={<Invite />} />
          
          {/* Maintenance Routes - No longer protected */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/carts/:cartId" element={<CartDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/store/:id" element={<Store />} />

          {/* Store Routes - No longer protected */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/cart-status" element={<CartStatus />} />
          <Route path="/customer/report-issue" element={<ReportIssue />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
