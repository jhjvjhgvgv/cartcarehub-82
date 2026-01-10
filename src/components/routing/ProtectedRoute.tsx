import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useAuthCheck } from "@/hooks/use-auth-check";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRole?: "maintenance" | "store" | "admin";
  skipOnboardingCheck?: boolean;
}

export const ProtectedRoute = ({ element, allowedRole, skipOnboardingCheck = false }: ProtectedRouteProps) => {
  const testMode = localStorage.getItem("testMode");
  const testRole = localStorage.getItem("testRole");
  const { user, isLoading } = useAuth();
  const { isAuthenticated, isVerified, roleCheckComplete } = useAuthCheck(allowedRole);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || skipOnboardingCheck || testMode === "true") {
        setOnboardingChecked(true);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed, skipped_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking onboarding:', error);
          setOnboardingChecked(true);
          return;
        }
        
        // If no record exists or onboarding not completed/skipped, redirect
        if (!data || (!data.onboarding_completed && !data.skipped_at)) {
          setNeedsOnboarding(true);
        }
        setOnboardingChecked(true);
      } catch (err) {
        console.error('Onboarding check failed:', err);
        setOnboardingChecked(true);
      }
    };
    
    if (isAuthenticated && user) {
      checkOnboarding();
    }
  }, [user, isAuthenticated, skipOnboardingCheck, testMode]);
  
  console.log("🛡️ ProtectedRoute", { allowedRole, isAuthenticated, isVerified, roleCheckComplete, testMode, isLoading, onboardingChecked, needsOnboarding });
  
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
  
  // Still checking auth status - wait for complete verification
  if (isLoading || !roleCheckComplete || isAuthenticated === null || isVerified === null) {
    console.log("⏳ Still verifying access...", { isLoading, roleCheckComplete, isAuthenticated, isVerified });
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
  
  // Check onboarding (only after auth is confirmed)
  if (!onboardingChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to onboarding if needed
  if (needsOnboarding) {
    console.log("📋 Redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // If verification failed, handle gracefully
  if (isVerified === false) {
    console.log("❌ Verification failed");
    
    // If we have a user but wrong role, redirect to appropriate dashboard
    if (user && isAuthenticated) {
      // Redirect based on allowed role
      const redirectPath = allowedRole === "maintenance" ? "/customer/dashboard" : 
                          allowedRole === "admin" ? "/customer/dashboard" : "/dashboard";
      console.log("🔀 Redirecting to:", redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
    
    // Fallback to login if no user
    return <Navigate to="/" replace />;
  }
  
  // All checks passed, render the protected element
  console.log("✅ Access granted");
  return <>{element}</>;
};
