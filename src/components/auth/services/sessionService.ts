import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

type PortalRole = 'store' | 'provider' | 'corp';

// Determine portal type from org_memberships
const getPortalFromMembership = (role: string): PortalRole | null => {
  if (role.startsWith('store_')) return 'store';
  if (role.startsWith('provider_')) return 'provider';
  if (role.startsWith('corp_')) return 'corp';
  return null;
};

export const checkSession = async (navigate: NavigateFunction): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session check error:", error);
      return false;
    }
    
    if (data.session) {
      console.log("User already has an active session:", data.session);
      
      // Get user's org memberships to determine portal routing
      const { data: memberships } = await supabase
        .from('org_memberships')
        .select('role, org_id')
        .eq('user_id', data.session.user.id)
        .limit(1);
        
      if (memberships && memberships.length > 0) {
        const portal = getPortalFromMembership(memberships[0].role);
        
        if (portal === 'provider') {
          navigate('/dashboard');
        } else if (portal === 'store') {
          navigate('/customer/dashboard');
        } else if (portal === 'corp') {
          navigate('/admin');
        } else {
          // Default to store portal
          navigate('/customer/dashboard');
        }
      } else {
        // No memberships found, go to onboarding
        navigate('/setup-profile');
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Error checking session:", err);
    return false;
  }
};
