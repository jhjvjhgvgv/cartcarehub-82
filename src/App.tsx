import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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

function App() {
  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/carts/:cartId" element={<CartDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/store/:id" element={<Store />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/cart-status" element={<CartStatus />} />
          <Route path="/customer/report-issue" element={<ReportIssue />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
        </Routes>
        <Toaster />
      </Router>
    </React.StrictMode>
  )
}

export default App