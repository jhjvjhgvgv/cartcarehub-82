
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const SessionChecker = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (!user || hasRedirected.current || isLoading) return;
    
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (testMode) return;
    
    console.log("🔍 SessionChecker - checking existing session for user:", user.id);
    
    const checkSession = async () => {
      try {
        // Ensure user is properly set up first
        const { data: setupResult, error: setupError } = await supabase.rpc('safe_user_setup', {
          user_id_param: user.id
        });

        if (setupError) {
          console.error("❌ User setup failed:", setupError);
        } else {
          console.log("✅ User setup result:", setupResult);
        }

        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // Try to get role from setup result as fallback
          const fallbackRole = typeof setupResult === 'object' && setupResult !== null && 'role' in setupResult 
            ? setupResult.role as string 
            : 'store';
          console.log("📋 Using fallback role:", fallbackRole);
          
          hasRedirected.current = true;
          if (fallbackRole === 'maintenance') {
            navigate('/dashboard', { replace: true });
          } else if (fallbackRole === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/customer/dashboard', { replace: true });
          }
          return;
        }
        
        // If user has no role set, they're a new user - redirect to onboarding
        if (!profile?.role) {
          console.log("📧 New user without role, redirecting to onboarding");
          hasRedirected.current = true;
          navigate('/onboarding', { replace: true });
          return;
        }
          
        const role = profile.role;
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
        // Don't redirect on error - let user stay on login page
        console.log("⚠️ Error during session check, staying on current page");
      }
    };
    
    checkSession();
  }, [user?.id, isLoading, navigate]);

  // This component doesn't render anything
  return null;
};
