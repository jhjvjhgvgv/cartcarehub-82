
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useAuthCheck } from "@/hooks/use-auth-check";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRole?: "maintenance" | "store";
}

export const ProtectedRoute = ({ element, allowedRole }: ProtectedRouteProps) => {
  const testMode = localStorage.getItem("testMode");
  const testRole = localStorage.getItem("testRole");
  const { isAuthenticated, isVerified } = useAuthCheck(allowedRole);
  
  // If test mode is enabled, allow access with the correct role
  if (testMode === "true") {
    if (!allowedRole || allowedRole === testRole) {
      return <>{element}</>;
    } else {
      // If test mode is enabled but wrong role, redirect to appropriate dashboard
      return <Navigate to={testRole === "maintenance" ? "/dashboard" : "/customer/dashboard"} replace />;
    }
  }
  
  // Still checking auth status
  if (isAuthenticated === null || isVerified === null) {
    return <div className="flex items-center justify-center h-screen">Verifying access...</div>;
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If no active connections for maintenance role, redirect to settings
  if (isVerified === false) {
    return <Navigate to="/settings" replace />;
  }
  
  // All checks passed, render the protected element
  return <>{element}</>;
};
