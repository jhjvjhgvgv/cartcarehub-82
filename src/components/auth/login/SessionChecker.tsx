
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const SessionChecker = () => {
  const navigate = useNavigate();

  const checkExistingSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        return;
      }
      
      if (data.session) {
        console.log("User has an active session:", data.session);
        
        // Look up user profile to determine correct redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        if (profile?.role === 'maintenance') {
          navigate('/dashboard', { replace: true });
        } else if (profile?.role === 'store') {
          navigate('/customer/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error("Error checking session:", err);
    }
  }, [navigate]);
  
  useEffect(() => {
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (!testMode) {
      checkExistingSession();
    }
  }, [checkExistingSession]);

  // This component doesn't render anything
  return null;
};
