import React, { useEffect, useState, Suspense } from "react"
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
import { TestModeIndicator } from "@/components/ui/test-mode-indicator"
import { ConnectionService } from "@/services/ConnectionService"

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

// Protected route component
const ProtectedRoute = ({ element, allowedRole }: { element: React.ReactNode, allowedRole?: "maintenance" | "store" }) => {
  const testMode = localStorage.getItem("testMode");
  const testRole = localStorage.getItem("testRole");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Only run verification if NOT in test mode
    if (testMode !== "true" && allowedRole === "maintenance") {
      // In a real app, we would check if the maintenance provider has connections
      // to any stores before allowing access
      const verifyConnections = async () => {
        try {
          const currentUser = ConnectionService.getCurrentUser();
          const connections = await ConnectionService.getMaintenanceRequests(currentUser.id);
          
          const hasActiveConnections = connections.some(conn => conn.status === "active");
          
          if (!hasActiveConnections) {
            toast({
              title: "No Active Connections",
              description: "You don't have any active store connections. Please connect to at least one store.",
              variant: "destructive"
            });
            // Redirect to settings where they can establish connections
            setIsVerified(false);
          } else {
            setIsVerified(true);
          }
        } catch (error) {
          console.error("Error verifying connections:", error);
          setIsVerified(true); // Default to allowing access on error
        }
      };
      
      verifyConnections();
    } else {
      setIsVerified(true); // Not maintenance role or in test mode
    }
  }, [allowedRole, testMode, toast]);
  
  // If test mode is enabled, allow access with the correct role
  if (testMode === "true") {
    if (!allowedRole || allowedRole === testRole) {
      return <>{element}</>;
    } else {
      // If test mode is enabled but wrong role, redirect to appropriate dashboard
      return <Navigate to={testRole === "maintenance" ? "/dashboard" : "/customer/dashboard"} replace />;
    }
  }
  
  // If verification is still in progress, show loading
  if (isVerified === null) {
    return <div className="flex items-center justify-center h-screen">Verifying access...</div>;
  }
  
  // If no active connections for maintenance role, redirect to settings
  if (isVerified === false) {
    return <Navigate to="/settings" replace />;
  }
  
  // Default redirect to login if no test mode
  return <Navigate to="/" replace />;
};

function App() {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [authAttempted, setAuthAttempted] = useState(false)

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

  // Handle supabase auth state changes without causing refresh loops
  useEffect(() => {
    if (authAttempted) return; // Only attempt auth check once
    
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Auth check error (non-critical):", error.message);
        }
        // Note: We just check, but don't cause any side effects that could trigger loops
      } catch (err) {
        console.error("Auth service error:", err);
      } finally {
        setAuthAttempted(true);
      }
    };
    
    checkAuth();
  }, [authAttempted]);

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
        </Suspense>
        <TestModeIndicator />
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
