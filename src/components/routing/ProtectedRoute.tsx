
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
  
  console.log("🛡️ ProtectedRoute", { allowedRole, isAuthenticated, isVerified, testMode });
  
  // If test mode is enabled, allow access with the correct role
  if (testMode === "true") {
    console.log("🧪 Test mode active, role:", testRole);
    if (!allowedRole || allowedRole === testRole) {
      return <>{element}</>;
    } else {
      // If test mode is enabled but wrong role, redirect to appropriate dashboard
      const redirectPath = testRole === "maintenance" ? "/dashboard" : 
                          testRole === "admin" ? "/admin" : "/customer/dashboard";
      console.log("🔀 Test mode redirect to:", redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // Still checking auth status
  if (isAuthenticated === null || isVerified === null) {
    console.log("⏳ Still verifying access...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }
  
  // If verification failed, handle gracefully
  if (isVerified === false) {
    console.log("❌ Verification failed");
    
    // If we have a user but wrong role, redirect to appropriate dashboard
    if (user) {
      const userRole = user.user_metadata?.role;
      console.log("🔀 Wrong role, redirecting. User role:", userRole);
      
      if (userRole === "maintenance") {
        return <Navigate to="/dashboard" replace />;
      } else if (userRole === "admin") {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/customer/dashboard" replace />;
      }
    }
    
    // Fallback to login if no user
    return <Navigate to="/" replace />;
  }
  
  // All checks passed, render the protected element
  console.log("✅ Access granted");
  return <>{element}</>;
};
