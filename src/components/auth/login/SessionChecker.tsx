
import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { checkProfileCompletion } from "@/services/profile/profile-completion";

export const SessionChecker = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  const checkExistingSession = useCallback(async () => {
    // Prevent multiple redirects
    if (!user || hasRedirected.current || isLoading) return;
    
    console.log("🔍 SessionChecker - checking existing session for user:", user.id);
    
    try {
      // Check if profile is complete first
      const completion = await checkProfileCompletion(user.id);
      if (!completion.isComplete) {
        console.log("📝 Profile incomplete, redirecting to setup");
        hasRedirected.current = true;
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
      
      // Only redirect if we're on the root path to avoid redirect loops
      const currentPath = window.location.pathname;
      
      if (currentPath === '/' || currentPath === '/login') {
        hasRedirected.current = true;
        
        if (role === 'maintenance') {
          console.log("🔀 Redirecting maintenance user to dashboard");
          navigate('/dashboard', { replace: true });
        } else if (role === 'store') {
          console.log("🔀 Redirecting store user to customer dashboard");
          navigate('/customer/dashboard', { replace: true });
        } else if (role === 'admin') {
          console.log("🔀 Redirecting admin user to admin dashboard");
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      console.error("Error checking profile:", err);
    }
  }, [navigate, user, isLoading]);
  
  useEffect(() => {
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (!testMode && user && !hasRedirected.current && !isLoading) {
      checkExistingSession();
    }
  }, [user, isLoading, checkExistingSession]);

  // This component doesn't render anything
  return null;
};
