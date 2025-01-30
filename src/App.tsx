import { Routes, Route } from "react-router-dom"
import Index from "@/pages/Index"
import Dashboard from "@/pages/Dashboard"
import Carts from "@/pages/Carts"
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
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/store/:id" element={<Store />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/customer">
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="cart-status" element={<CartStatus />} />
          <Route path="report-issue" element={<ReportIssue />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App