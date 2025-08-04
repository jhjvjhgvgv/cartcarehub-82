
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { checkProfileCompletion } from "@/services/profile/profile-completion";

export const SessionChecker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkExistingSession = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if profile is complete first
      const completion = await checkProfileCompletion(user.id);
      if (!completion.isComplete) {
        navigate('/setup-profile', { replace: true });
        return;
      }

      // If profile is complete, look up user role to determine correct redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profile?.role === 'maintenance') {
        navigate('/dashboard', { replace: true });
      } else if (profile?.role === 'store') {
        navigate('/customer/dashboard', { replace: true });
      } else if (profile?.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      console.error("Error checking profile:", err);
    }
  }, [navigate, user]);
  
  useEffect(() => {
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (!testMode && user) {
      checkExistingSession();
    }
  }, [checkExistingSession, user]);

  // This component doesn't render anything
  return null;
};
