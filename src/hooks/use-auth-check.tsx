
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/ConnectionService";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthCheck(allowedRole?: "maintenance" | "store" | "admin") {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { user, isAuthenticated: authStatus } = useAuth();
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      console.log("🔍 useAuthCheck - checking auth", { allowedRole, authStatus, userId: user?.id });
      
      // If in test mode, skip auth check
      const testMode = localStorage.getItem("testMode");
      if (testMode === "true") {
        console.log("✅ Test mode enabled, allowing access");
        if (mounted) {
          setIsAuthenticated(true);
          setIsVerified(true);
        }
        return;
      }
      
      // Wait for auth status to be determined
      if (authStatus === null) {
        console.log("⏳ Auth status still determining...");
        return;
      }
      
      if (mounted) {
        setIsAuthenticated(authStatus);
      }
      
      if (authStatus && user) {
        console.log("👤 User authenticated, checking role...");
        
        try {
          // Get user role from profile table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            if (mounted) setIsVerified(false);
            return;
          }
          
          const userRole = profile?.role;
          console.log("🎭 User role:", userRole, "Required role:", allowedRole);
          
          // Check if user has required role
          if (allowedRole && userRole !== allowedRole) {
            console.log("❌ Role mismatch, access denied");
            if (mounted) setIsVerified(false);
            return;
          }
          
          // For maintenance role, we'll skip the connection check for now to avoid complex dependencies
          // The connection check can be handled at the component level if needed
          console.log("✅ Auth check passed");
          if (mounted) setIsVerified(true);
          
        } catch (error) {
          console.error("Error in auth check:", error);
          if (mounted) setIsVerified(false);
        }
      } else {
        // Not authenticated
        console.log("❌ User not authenticated");
        if (mounted) {
          setIsAuthenticated(false);
          setIsVerified(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [allowedRole, authStatus, user?.id]);

  return { isAuthenticated, isVerified };
}
