import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../context/types";
import { AuthResult } from "./types";
import { clearNewAccountFlags } from "@/services/connection/storage-utils";

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

export const signInUser = async (
  email: string,
  password: string,
  selectedRole: UserRole,
  navigate: NavigateFunction
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign in with:", { email });
    
    // Clear any new account flags for sign-ins
    clearNewAccountFlags(true);
    localStorage.setItem("lastOperation", "signin");
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return { success: false, message: signInError.message, error: signInError };
    }

    if (signInData?.user) {
      // Store session in localStorage to maintain login state
      localStorage.setItem('supabase.auth.token', JSON.stringify(signInData.session));
      
      try {
        // Use get_my_portal_context for routing
        const { data: ctx, error: ctxError } = await supabase.rpc('get_my_portal_context');
        
        if (ctxError) {
          console.error("Error getting portal context:", ctxError);
          // Fallback to onboarding
          navigate('/onboarding', { replace: true });
          return { success: true, message: "You have been signed in successfully!" };
        }

        const context = ctx as unknown as PortalContext | null;
        
        if (context?.memberships && context.memberships.length > 0) {
          const membership = context.memberships[0];
          const role = membership.role;
          
          // Route based on membership role
          if (role.startsWith('provider_')) {
            navigate('/dashboard', { replace: true });
          } else if (role.startsWith('corp_')) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/customer/dashboard', { replace: true });
          }
        } else {
          // No memberships - go to onboarding
          navigate('/onboarding', { replace: true });
        }
        
        return { success: true, message: "You have been signed in successfully!" };
      } catch (err) {
        console.error("Error during portal context fetch:", err);
        // Fallback based on selected role
        if (selectedRole === 'maintenance') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
        return { success: true, message: "You have been signed in successfully!" };
      }
    }
    
    return { 
      success: false, 
      message: "Login succeeded but user data is missing. Please try again."
    };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, message: error.message || "An unexpected error occurred", error };
  }
};
