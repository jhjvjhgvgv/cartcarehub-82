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
        // Ensure user profile + org exists - this is the key fix for missing memberships
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
          // Redirect to onboarding - safe_user_setup should have created the membership
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        const context = portalContext as any;
        const memberships = context?.memberships || [];
        
        // If user STILL has no memberships after safe_user_setup, go to customer dashboard
        // The membership should exist now, but just in case
        if (memberships.length === 0) {
          console.log("📧 No memberships found even after setup, redirecting to customer dashboard");
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        // Determine primary role based on memberships
        const primaryMembership = memberships[0];
        const role = primaryMembership.role;
        const orgType = primaryMembership.org_type;
        
        console.log("👤 User role:", role, "org type:", orgType);
        
        // Only redirect if we're on the root path to avoid redirect loops
        const currentPath = window.location.pathname;
        
        if (currentPath === '/' || currentPath === '/login') {
          hasRedirected.current = true;
          redirectBasedOnRole(role, orgType);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        // Don't redirect on error - let user stay on login page
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
