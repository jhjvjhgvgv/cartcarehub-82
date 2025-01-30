import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import Carts from "@/pages/Carts";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CartStatus from "@/pages/customer/CartStatus";
import ReportIssue from "@/pages/customer/ReportIssue";
import CustomerSettings from "@/pages/customer/Settings";
import ForgotPassword from "@/pages/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Customer routes */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/cart-status" element={<CartStatus />} />
        <Route path="/customer/report" element={<ReportIssue />} />
        <Route path="/customer/settings" element={<CustomerSettings />} />
      </Routes>
    </Router>
  );
}

export default App;