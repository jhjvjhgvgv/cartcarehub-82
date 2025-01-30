import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import Settings from "./pages/Settings"
import Store from "./pages/Store"
import Carts from "./pages/Carts"
import CartDetails from "./pages/CartDetails"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/store" element={<Store />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/carts/:cartId" element={<CartDetails />} />
      </Routes>
    </Router>
  )
}

export default App
