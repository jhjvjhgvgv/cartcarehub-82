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
import ForgotPassword from "@/pages/ForgotPassword"
import { Toaster } from "@/components/ui/toaster"
import CustomerDashboard from "@/pages/customer/Dashboard"
import CartStatus from "@/pages/customer/CartStatus"
import ReportIssue from "@/pages/customer/ReportIssue"
import CustomerSettings from "@/pages/customer/Settings"
import { useToast } from "@/hooks/use-toast"

function App() {
  const [userRole, setUserRole] = useState<'maintenance' | 'store' | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check auth state and get user role
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          setUserRole(profile?.role || null)
        } else {
          setUserRole(null)
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUserRole(profile?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  if (loading) {
    return <div>Loading...</div>
  }

  const ProtectedMaintenanceRoute = ({ children }: { children: React.ReactNode }) => {
    if (!userRole) {
      return <Navigate to="/" replace />
    }
    if (userRole !== 'maintenance') {
      toast({
        title: "Access Denied",
        description: "You don't have access to the maintenance portal",
        variant: "destructive",
      })
      return <Navigate to="/customer/dashboard" replace />
    }
    return <>{children}</>
  }

  const ProtectedStoreRoute = ({ children }: { children: React.ReactNode }) => {
    if (!userRole) {
      return <Navigate to="/" replace />
    }
    if (userRole !== 'store') {
      toast({
        title: "Access Denied",
        description: "You don't have access to the store portal",
        variant: "destructive",
      })
      return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Maintenance Routes */}
          <Route path="/dashboard" element={
            <ProtectedMaintenanceRoute>
              <Dashboard />
            </ProtectedMaintenanceRoute>
          } />
          <Route path="/carts" element={
            <ProtectedMaintenanceRoute>
              <Carts />
            </ProtectedMaintenanceRoute>
          } />
          <Route path="/carts/:cartId" element={
            <ProtectedMaintenanceRoute>
              <CartDetails />
            </ProtectedMaintenanceRoute>
          } />
          <Route path="/customers" element={
            <ProtectedMaintenanceRoute>
              <Customers />
            </ProtectedMaintenanceRoute>
          } />
          <Route path="/settings" element={
            <ProtectedMaintenanceRoute>
              <Settings />
            </ProtectedMaintenanceRoute>
          } />
          <Route path="/store/:id" element={
            <ProtectedMaintenanceRoute>
              <Store />
            </ProtectedMaintenanceRoute>
          } />

          {/* Store Routes */}
          <Route path="/customer" element={
            <ProtectedStoreRoute>
              <Navigate to="/customer/dashboard" replace />
            </ProtectedStoreRoute>
          } />
          <Route path="/customer/dashboard" element={
            <ProtectedStoreRoute>
              <CustomerDashboard />
            </ProtectedStoreRoute>
          } />
          <Route path="/customer/cart-status" element={
            <ProtectedStoreRoute>
              <CartStatus />
            </ProtectedStoreRoute>
          } />
          <Route path="/customer/report-issue" element={
            <ProtectedStoreRoute>
              <ReportIssue />
            </ProtectedStoreRoute>
          } />
          <Route path="/customer/settings" element={
            <ProtectedStoreRoute>
              <CustomerSettings />
            </ProtectedStoreRoute>
          } />
        </Routes>
        <Toaster />
      </Router>
    </>
  )
}

export default App