import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  // Derived from org_memberships
  portal?: 'store' | 'provider' | 'corp';
  membership_role?: string;
  // Legacy compatibility fields (mapped from new schema)
  display_name?: string;
  company_name?: string;
  contact_phone?: string;
  email?: string;
  role?: string;
  last_sign_in?: string;
}

// Determine portal type from org_memberships role
const getPortalFromMembership = (role: string): 'store' | 'provider' | 'corp' | undefined => {
  if (role.startsWith('store_')) return 'store';
  if (role.startsWith('provider_')) return 'provider';
  if (role.startsWith('corp_')) return 'corp';
  return undefined;
};

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch from user_profiles table
      const { data: profileData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        setError(fetchError.message);
      }

      // Fetch memberships to determine role/portal
      const { data: memberships } = await supabase
        .from('org_memberships')
        .select('role, org_id')
        .eq('user_id', user.id)
        .limit(1);

      const membershipRole = memberships?.[0]?.role || undefined;
      const portal = membershipRole ? getPortalFromMembership(membershipRole) : undefined;

      // Get role from user metadata if no membership yet (new user during onboarding)
      const metaRole = user.user_metadata?.role;
      
      // Determine legacy role: from membership, then from metadata, then default to store
      const legacyRole = portal === 'provider' ? 'maintenance' : 
                        portal === 'corp' ? 'admin' : 
                        metaRole === 'maintenance' ? 'maintenance' :
                        'store';
      
      // Determine portal type: from membership or from metadata
      const derivedPortal = portal || 
                           (metaRole === 'maintenance' ? 'provider' : 
                            metaRole === 'store' ? 'store' : undefined);

      setProfile({
        id: user.id,
        full_name: profileData?.full_name || undefined,
        phone: profileData?.phone || undefined,
        created_at: profileData?.created_at,
        updated_at: profileData?.updated_at,
        portal: derivedPortal,
        membership_role: membershipRole,
        // Legacy compatibility mappings
        display_name: profileData?.full_name || undefined,
        contact_phone: profileData?.phone || undefined,
        role: legacyRole,
        email: user.email,
      });
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return false;

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setError(updateError.message);
        return false;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error("Unexpected error updating profile:", err);
      setError("Failed to update profile");
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    isMaintenanceUser: profile?.portal === 'provider',
    isStoreUser: profile?.portal === 'store',
    isAdminUser: profile?.portal === 'corp',
  };
};
