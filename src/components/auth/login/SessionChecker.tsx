import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const SessionChecker = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (!user || hasRedirected.current || isLoading) return;
    
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (testMode) return;
    
    console.log("🔍 SessionChecker - checking existing session for user:", user.id);
    
    const checkSession = async () => {
      try {
        // FIRST: Check onboarding status before anything else
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed, skipped_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If no onboarding record or not completed, redirect to onboarding
        if (!onboardingData || (!onboardingData.onboarding_completed && !onboardingData.skipped_at)) {
          console.log("📋 User needs onboarding, redirecting...");
          hasRedirected.current = true;
          navigate('/onboarding', { replace: true });
          return;
        }
        
        // Ensure user profile + org exists
        const setupResult = await supabase.rpc('safe_user_setup', { user_id_param: user.id });
        if (setupResult.error) {
          console.warn("User setup warning:", setupResult.error.message);
        } else {
          console.log("✅ safe_user_setup result:", setupResult.data);
        }

        // Get portal context to determine user's memberships and roles
        const { data: portalContext, error: contextError } = await supabase.rpc('get_my_portal_context');
        
        if (contextError) {
          console.error("Portal context fetch error:", contextError);
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        const context = portalContext as any;
        const memberships = context?.memberships || [];
        
        // If user has no memberships, go to customer dashboard
        if (memberships.length === 0) {
          console.log("📧 No memberships found, redirecting to customer dashboard");
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        // Determine primary role based on memberships
        const primaryMembership = memberships[0];
        const role = primaryMembership.role;
        const orgType = primaryMembership.org_type;
        
        console.log("👤 User role:", role, "org type:", orgType);
        
        // Only redirect if we're on the root path
        const currentPath = window.location.pathname;
        
        if (currentPath === '/' || currentPath === '/login') {
          hasRedirected.current = true;
          redirectBasedOnRole(role, orgType);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        console.log("⚠️ Error during session check, staying on current page");
      }
    };
    
    const redirectBasedOnRole = (role: string, orgType?: string) => {
      // Provider roles go to provider dashboard
      if (role === 'provider_admin' || role === 'provider_tech' || orgType === 'provider') {
        console.log("🔀 Redirecting provider user to dashboard");
        navigate('/dashboard', { replace: true });
      } 
      // Corp roles go to corp dashboard (admin area)
      else if (role === 'corp_admin' || role === 'corp_viewer' || orgType === 'corporation') {
        console.log("🔀 Redirecting corp user to admin dashboard");
        navigate('/admin', { replace: true });
      } 
      // Store roles go to customer dashboard
      else if (role === 'store_admin' || role === 'store_staff' || orgType === 'store') {
        console.log("🔀 Redirecting store user to customer dashboard");
        navigate('/customer/dashboard', { replace: true });
      }
      // Default to customer dashboard
      else {
        console.log("🔀 Redirecting to customer dashboard (default)");
        navigate('/customer/dashboard', { replace: true });
      }
    };
    
    checkSession();
  }, [user?.id, isLoading, navigate]);

  // This component doesn't render anything
  return null;
};
