import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Carts from "@/pages/Carts";
import Settings from "@/pages/Settings";
import ForgotPassword from "@/pages/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
