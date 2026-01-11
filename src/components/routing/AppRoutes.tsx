import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Carts from "@/pages/Carts";
import CartDetails from "@/pages/CartDetails";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Store from "@/pages/Store";
import Invite from "@/pages/Invite";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CartStatus from "@/pages/customer/CartStatus";
import ReportIssue from "@/pages/customer/ReportIssue";
import CustomerSettings from "@/pages/customer/Settings";
import { ProfileSetup } from "@/components/auth/ProfileSetup";
import { ErrorRecovery } from "@/components/auth/ErrorRecovery";
import { MasterAdminLogin } from "@/pages/MasterAdminLogin";
import { OnboardingContainer } from "@/components/auth/onboarding/OnboardingContainer";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invite" element={<Invite />} />
      <Route path="/error-recovery" element={<ErrorRecovery error="Authentication error occurred" />} />
      <Route path="/setup-profile" element={<ProtectedRoute element={<ProfileSetup />} skipOnboardingCheck />} />
      <Route path="/onboarding" element={<ProtectedRoute element={<OnboardingContainer />} skipOnboardingCheck />} />
      
      {/* Master Admin Routes - Separate authentication system */}
      <Route path="/master-admin" element={<MasterAdminLogin />} />
      
      {/* Maintenance Routes - Protected with test mode support */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="maintenance" />} />
      <Route path="/carts" element={<ProtectedRoute element={<Carts />} allowedRole="maintenance" />} />
      <Route path="/carts/:cartId" element={<ProtectedRoute element={<CartDetails />} allowedRole="maintenance" />} />
      <Route path="/customers" element={<ProtectedRoute element={<Customers />} allowedRole="maintenance" />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} allowedRole="maintenance" />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <Admin />
        </AdminProtectedRoute>
      } />
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
