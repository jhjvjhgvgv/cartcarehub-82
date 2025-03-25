
import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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

// Protected route component
const ProtectedRoute = ({ element, allowedRole }: { element: React.ReactNode, allowedRole?: "maintenance" | "store" }) => {
  const testMode = localStorage.getItem("testMode");
  const testRole = localStorage.getItem("testRole");
  
  // If test mode is enabled, allow access with the correct role
  if (testMode === "true") {
    if (!allowedRole || allowedRole === testRole) {
      return <>{element}</>;
    }
  }
  
  // Default redirect to login if no test mode
  return <Navigate to="/" replace />;
};

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
          
          {/* Maintenance Routes - Protected with test mode support */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="maintenance" />} />
          <Route path="/carts" element={<ProtectedRoute element={<Carts />} allowedRole="maintenance" />} />
          <Route path="/carts/:cartId" element={<ProtectedRoute element={<CartDetails />} allowedRole="maintenance" />} />
          <Route path="/customers" element={<ProtectedRoute element={<Customers />} allowedRole="maintenance" />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} allowedRole="maintenance" />} />
          <Route path="/store/:id" element={<ProtectedRoute element={<Store />} allowedRole="maintenance" />} />
          
          {/* Customer routes - Protected with test mode support */}
          <Route path="/customer/dashboard" element={<ProtectedRoute element={<CustomerDashboard />} allowedRole="store" />} />
          <Route path="/customer/cart-status" element={<ProtectedRoute element={<CartStatus />} allowedRole="store" />} />
          <Route path="/customer/cart/:cartId" element={<ProtectedRoute element={<CartDetails />} allowedRole="store" />} />
          <Route path="/customer/report-issue" element={<ProtectedRoute element={<ReportIssue />} allowedRole="store" />} />
          <Route path="/customer/settings" element={<ProtectedRoute element={<CustomerSettings />} allowedRole="store" />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
