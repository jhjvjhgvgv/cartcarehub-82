
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
    
    console.log("🔍 SessionChecker - checking existing session for user:", user.id);
    
    try {
      // Check if profile is complete first
      const completion = await checkProfileCompletion(user.id);
      if (!completion.isComplete) {
        console.log("📝 Profile incomplete, redirecting to setup");
        navigate('/setup-profile', { replace: true });
        return;
      }

      // If profile is complete, look up user role to determine correct redirect
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }
        
      const role = profile?.role;
      console.log("👤 User role:", role);
      
      // Prevent redirect loops by checking current path
      const currentPath = window.location.pathname;
      let targetPath = '';
      
      if (role === 'maintenance') {
        targetPath = '/dashboard';
      } else if (role === 'store') {
        targetPath = '/customer/dashboard';
      } else if (role === 'admin') {
        targetPath = '/admin';
      }
      
      // Only redirect if we're not already on the target path or a sub-path
      if (targetPath && !currentPath.startsWith(targetPath) && currentPath === '/') {
        console.log("🔀 Redirecting to:", targetPath);
        navigate(targetPath, { replace: true });
      } else {
        console.log("✅ Already on correct path or sub-path:", currentPath);
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
