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

// Determine portal type from membership role
const getPortalFromRole = (role: string): 'store' | 'provider' | 'corp' | null => {
  if (role.startsWith('store_')) return 'store';
  if (role.startsWith('provider_')) return 'provider';
  if (role.startsWith('corp_')) return 'corp';
  return null;
};

export const fetchUserProfile = async (userId: string) => {
  // Fetch from user_profiles table with explicit columns
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, full_name, phone, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }
  
  // Use get_my_portal_context for membership info
  const { data: ctx, error: ctxError } = await supabase.rpc('get_my_portal_context');
  
  if (ctxError) {
    console.error("Error getting portal context:", ctxError);
  }
  
  const context = ctx as unknown as PortalContext | null;
  const membership = context?.memberships?.[0];
  const portal = membership?.role ? getPortalFromRole(membership.role) : null;
  
  return {
    ...profile,
    portal,
    membership_role: membership?.role || null,
    org_id: membership?.org_id || null,
    org_name: membership?.org_name || null,
  };
};

export const handleNavigation = async (
  role: string | undefined,
  selectedRole: string,
  navigate: NavigateFunction,
  userId?: string
) => {
  // Use get_my_portal_context for routing decisions
  if (userId) {
    try {
      const { data: ctx, error } = await supabase.rpc('get_my_portal_context');
      
      if (!error && ctx) {
        const context = ctx as unknown as PortalContext;
        
        if (context.memberships && context.memberships.length > 0) {
          const membership = context.memberships[0];
          const memberRole = membership.role;
          
          if (memberRole.startsWith('provider_')) {
            navigate('/dashboard', { replace: true });
            return;
          } else if (memberRole.startsWith('corp_')) {
            navigate('/admin', { replace: true });
            return;
          } else {
            navigate('/customer/dashboard', { replace: true });
            return;
          }
        } else {
          // No memberships - go to onboarding
          navigate('/onboarding', { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error("Error getting portal context for navigation:", error);
    }
  }

  // Fallback based on role parameter or selected role
  let redirectPath = '/customer/dashboard';
  
  if (role === 'provider' || role === 'maintenance') {
    redirectPath = '/dashboard';
  } else if (role === 'corp' || role === 'admin') {
    redirectPath = '/admin';
  } else if (role === 'store') {
    redirectPath = '/customer/dashboard';
  } else if (selectedRole === 'maintenance') {
    redirectPath = '/dashboard';
  }
  
  navigate(redirectPath, { replace: true });
};
