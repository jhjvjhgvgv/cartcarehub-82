import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../../context/types";
import { checkProfileCompletion } from "@/services/profile/profile-completion";

type PortalRole = 'store' | 'provider' | 'corp';

// Determine portal type from org_memberships role
const getPortalFromMembership = (role: string): PortalRole | null => {
  if (role.startsWith('store_')) return 'store';
  if (role.startsWith('provider_')) return 'provider';
  if (role.startsWith('corp_')) return 'corp';
  return null;
};

export const fetchUserProfile = async (userId: string) => {
  // Fetch from user_profiles table
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('full_name, phone')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }
  
  // Fetch memberships to determine role
  const { data: memberships } = await supabase
    .from('org_memberships')
    .select('role, org_id')
    .eq('user_id', userId)
    .limit(1);
  
  const membershipRole = memberships?.[0]?.role || null;
  const portal = membershipRole ? getPortalFromMembership(membershipRole) : null;
  
  return {
    ...profile,
    portal,
    membership_role: membershipRole,
  };
};

export const handleNavigation = async (
  role: string | undefined,
  selectedRole: UserRole,
  navigate: NavigateFunction,
  userId?: string
) => {
  // Check if profile setup is needed first
  if (userId) {
    try {
      const completion = await checkProfileCompletion(userId);
      if (!completion.isComplete) {
        navigate('/setup-profile', { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
      // Continue with normal navigation if profile check fails
    }
  }

  // Determine redirect based on portal type or selected role
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
