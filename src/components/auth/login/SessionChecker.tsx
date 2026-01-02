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
        // Ensure user is properly set up first
        const { data: setupResult, error: setupError } = await supabase.rpc('safe_user_setup', {
          user_id_param: user.id
        });

        if (setupError) {
          console.error("❌ User setup failed:", setupError);
        } else {
          console.log("✅ User setup result:", setupResult);
        }

        // Get portal context to determine user's memberships and roles
        const { data: portalContext, error: contextError } = await supabase.rpc('get_my_portal_context');
        
        if (contextError) {
          console.error("Portal context fetch error:", contextError);
          // Fallback: check if user has any org memberships
          const { data: memberships } = await supabase
            .from('org_memberships')
            .select('role, organizations(type)')
            .eq('user_id', user.id)
            .limit(1);
          
          if (!memberships || memberships.length === 0) {
            // New user without memberships - redirect to onboarding
            console.log("📧 New user without memberships, redirecting to onboarding");
            hasRedirected.current = true;
            navigate('/onboarding', { replace: true });
            return;
          }

          // Determine role from first membership
          const membership = memberships[0];
          const orgType = (membership.organizations as any)?.type;
          hasRedirected.current = true;
          redirectBasedOnRole(membership.role, orgType);
          return;
        }
        
        const context = portalContext as any;
        const memberships = context?.memberships || [];
        
        // If user has no memberships, they're a new user - redirect to onboarding
        if (memberships.length === 0) {
          console.log("📧 New user without memberships, redirecting to onboarding");
          hasRedirected.current = true;
          navigate('/onboarding', { replace: true });
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
