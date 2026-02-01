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
  const { user, isLoading } = useAuth();
  const { isAuthenticated, isVerified, roleCheckComplete } = useAuthCheck(allowedRole);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || skipOnboardingCheck) {
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
          setOnboardingChecked(true);
          return;
        }
        
        // If no record exists or onboarding not completed/skipped, redirect
        if (!data || (!data.onboarding_completed && !data.skipped_at)) {
          setNeedsOnboarding(true);
        }
        setOnboardingChecked(true);
      } catch (err) {
        setOnboardingChecked(true);
      }
    };
    
    if (isAuthenticated && user) {
      checkOnboarding();
    }
  }, [user, isAuthenticated, skipOnboardingCheck]);
  
  // Still checking auth status - wait for complete verification
  if (isLoading || !roleCheckComplete || isAuthenticated === null || isVerified === null) {
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
    return <Navigate to="/onboarding" replace />;
  }
  
  // If verification failed, handle gracefully
  if (isVerified === false) {
    // If we have a user but wrong role, redirect to appropriate dashboard
    if (user && isAuthenticated) {
      const redirectPath = allowedRole === "maintenance" ? "/customer/dashboard" : 
                          allowedRole === "admin" ? "/customer/dashboard" : "/dashboard";
      return <Navigate to={redirectPath} replace />;
    }
    
    // Fallback to login if no user
    return <Navigate to="/" replace />;
  }
  
  // All checks passed, render the protected element
  return <>{element}</>;
};
