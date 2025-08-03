import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  role?: string;
  company_name?: string;
  contact_phone?: string;
  is_active?: boolean;
  last_sign_in?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          setError(fetchError.message);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return false;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
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
    isMaintenanceUser: profile?.role === 'maintenance',
    isStoreUser: profile?.role === 'store',
    isAdminUser: profile?.role === 'admin',
  };
};