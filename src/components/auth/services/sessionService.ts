
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

export const checkSession = async (navigate: NavigateFunction): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session check error:", error);
      return false;
    }
    
    if (data.session) {
      console.log("User already has an active session:", data.session);
      
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .maybeSingle();
        
      if (profile?.role === 'maintenance') {
        navigate('/dashboard');
      } else if (profile?.role === 'store') {
        navigate('/customer/dashboard');
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Error checking session:", err);
    return false;
  }
};
