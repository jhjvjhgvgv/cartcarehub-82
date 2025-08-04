
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../../context/types";
import { checkProfileCompletion } from "@/services/profile/profile-completion";

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }
  
  return profile;
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

  const redirectPath = role === 'maintenance' ? '/dashboard' : 
                        role === 'admin' ? '/admin' : '/customer/dashboard';
  navigate(redirectPath, { replace: true });
};
