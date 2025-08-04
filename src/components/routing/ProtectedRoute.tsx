
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useAuthCheck } from "@/hooks/use-auth-check";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRole?: "maintenance" | "store" | "admin";
}

export const ProtectedRoute = ({ element, allowedRole }: ProtectedRouteProps) => {
  const testMode = localStorage.getItem("testMode");
  const testRole = localStorage.getItem("testRole");
  const { user } = useAuth();
  const { isAuthenticated, isVerified } = useAuthCheck(allowedRole);
  
  // If test mode is enabled, allow access with the correct role
  if (testMode === "true") {
    if (!allowedRole || allowedRole === testRole) {
      return <>{element}</>;
    } else {
      // If test mode is enabled but wrong role, redirect to appropriate dashboard
      const redirectPath = testRole === "maintenance" ? "/dashboard" : 
                          testRole === "admin" ? "/admin" : "/customer/dashboard";
      return <Navigate to={redirectPath} replace />;
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
  
  // If verification failed, redirect based on actual user role, not test role
  if (isVerified === false) {
    // Get the actual user role from auth metadata
    const userRole = user?.user_metadata?.role;
    const redirectPath = userRole === "store" ? "/customer/settings" : "/settings";
    return <Navigate to={redirectPath} replace />;
  }
  
  // All checks passed, render the protected element
  return <>{element}</>;
};
