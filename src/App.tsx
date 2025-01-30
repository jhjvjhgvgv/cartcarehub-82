import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Carts from "./pages/Carts";
import Store from "./pages/Store";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/store/:id" element={<Store />} />
      </Routes>
    </Router>
  );
}

export default App;