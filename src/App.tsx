import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Carts from "./pages/Carts";
import CustomerDashboard from "./pages/customer/Dashboard";
import CartStatus from "./pages/customer/CartStatus";
import ReportIssue from "./pages/customer/ReportIssue";
import CustomerSettings from "./pages/customer/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          
          {/* Maintenance Company Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/customers" element={<Customers />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/cart-status" element={<CartStatus />} />
          <Route path="/customer/report" element={<ReportIssue />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;