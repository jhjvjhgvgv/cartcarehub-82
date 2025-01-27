import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Carts from "@/pages/Carts";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
      <Toaster />
    </Router>
  );
}

export default App;