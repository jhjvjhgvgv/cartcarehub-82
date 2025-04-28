
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../../context/types";

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

export const handleNavigation = (
  role: string | undefined,
  selectedRole: UserRole,
  navigate: NavigateFunction
) => {
  const redirectPath = role === 'maintenance' ? '/dashboard' : '/customer/dashboard';
  navigate(redirectPath, { replace: true });
};
