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
    
    const checkSession = async () => {
      try {
        // FIRST: Apply any pending role from OAuth BEFORE setup
        const pendingRole = localStorage.getItem('pending_signup_role');
        if (pendingRole && (pendingRole === 'store' || pendingRole === 'maintenance')) {
          console.log('🔄 Applying pending role in SessionChecker:', pendingRole);
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: pendingRole }
          });
          if (updateError) {
            console.error('Failed to apply pending role:', updateError);
          } else {
            console.log('✅ Role applied successfully:', pendingRole);
          }
          localStorage.removeItem('pending_signup_role');
        }
        
        // Check onboarding status
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed, skipped_at')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // If no onboarding record or not completed, redirect to onboarding
        if (!onboardingData || (!onboardingData.onboarding_completed && !onboardingData.skipped_at)) {
          hasRedirected.current = true;
          navigate('/onboarding', { replace: true });
          return;
        }
        
        // Ensure user profile + org exists (AFTER role is applied)
        const setupResult = await supabase.rpc('safe_user_setup', { user_id_param: user.id });
        if (setupResult.error) {
          console.warn("User setup warning:", setupResult.error.message);
        }

        // Get portal context to determine user's memberships and roles
        const { data: portalContext, error: contextError } = await supabase.rpc('get_my_portal_context');
        
        if (contextError) {
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        const context = portalContext as any;
        const memberships = context?.memberships || [];
        
        // If user has no memberships, go to customer dashboard
        if (memberships.length === 0) {
          hasRedirected.current = true;
          navigate('/customer/dashboard', { replace: true });
          return;
        }
        
        // Determine primary role based on memberships
        const primaryMembership = memberships[0];
        const role = primaryMembership.role;
        const orgType = primaryMembership.org_type;
        
        // Only redirect if we're on the root path
        const currentPath = window.location.pathname;
        
        if (currentPath === '/' || currentPath === '/login') {
          hasRedirected.current = true;
          redirectBasedOnRole(role, orgType);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    const redirectBasedOnRole = (role: string, orgType?: string) => {
      // Provider roles go to provider dashboard
      if (role === 'provider_admin' || role === 'provider_tech' || orgType === 'provider') {
        navigate('/dashboard', { replace: true });
      } 
      // Corp roles go to corp dashboard (admin area)
      else if (role === 'corp_admin' || role === 'corp_viewer' || orgType === 'corporation') {
        navigate('/admin', { replace: true });
      } 
      // Store roles go to customer dashboard
      else if (role === 'store_admin' || role === 'store_staff' || orgType === 'store') {
        navigate('/customer/dashboard', { replace: true });
      }
      // Default to customer dashboard
      else {
        navigate('/customer/dashboard', { replace: true });
      }
    };
    
    checkSession();
  }, [user?.id, isLoading, navigate]);

  // This component doesn't render anything
  return null;
};
