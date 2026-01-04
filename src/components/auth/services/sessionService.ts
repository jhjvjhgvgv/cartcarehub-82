import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

interface PortalContext {
  memberships: Array<{
    org_id: string;
    org_name: string;
    org_type: string;
    role: string;
  }>;
  accessible_stores: Array<{
    store_org_id: string;
    store_name: string;
  }>;
}

export const checkSession = async (navigate: NavigateFunction): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session check error:", error);
      return false;
    }
    
    if (data.session) {
      console.log("User already has an active session");
      
      // Use get_my_portal_context RPC for consistent routing
      const { data: ctx, error: ctxError } = await supabase.rpc('get_my_portal_context');
      
      if (ctxError) {
        console.error("Error getting portal context:", ctxError);
        // Fallback to onboarding if context fails
        navigate('/onboarding');
        return true;
      }

      const context = ctx as unknown as PortalContext | null;
      
      if (context?.memberships && context.memberships.length > 0) {
        const membership = context.memberships[0];
        const role = membership.role;
        
        // Route based on membership role
        if (role.startsWith('provider_')) {
          navigate('/dashboard');
        } else if (role.startsWith('corp_')) {
          navigate('/admin');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        // No memberships - go to onboarding
        navigate('/onboarding');
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Error checking session:", err);
    return false;
  }
};
