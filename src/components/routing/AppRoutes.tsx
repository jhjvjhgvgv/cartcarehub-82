
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Carts from "@/pages/Carts";
import CartDetails from "@/pages/CartDetails";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import Store from "@/pages/Store";
import Invite from "@/pages/Invite";
import ForgotPassword from "@/pages/ForgotPassword";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CartStatus from "@/pages/customer/CartStatus";
import ReportIssue from "@/pages/customer/ReportIssue";
import CustomerSettings from "@/pages/customer/Settings";

export const AppRoutes = () => {
  return (
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
  );
};
