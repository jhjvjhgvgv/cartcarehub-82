
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/ConnectionService";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthCheck(allowedRole?: "maintenance" | "store" | "admin") {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated: authStatus } = useAuth();
  
  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounted
    
    const checkAuth = async () => {
      // If in test mode, skip auth check
      const testMode = localStorage.getItem("testMode");
      if (testMode === "true") {
        if (mounted) {
          setIsAuthenticated(true);
          setIsVerified(true);
        }
        return;
      }
      
      // Wait for auth status to be determined
      if (authStatus === null) return;
      
      if (mounted) {
        setIsAuthenticated(authStatus);
      }
      
      if (authStatus && user) {
        // Get user role first
        const { data: profile } = await supabase.auth.getUser();
        const userRole = profile?.user?.user_metadata?.role;
        
        // Check if user has required role
        if (allowedRole && userRole !== allowedRole) {
          if (mounted) {
            setIsVerified(false);
          }
          return;
        }
        
        // For maintenance role, check connections
        if (allowedRole === "maintenance") {
          try {
            const connections = await ConnectionService.getMaintenanceRequests(user.id);
            const hasActiveConnections = connections.some(conn => conn.status === "active");
            
            if (mounted) {
              if (!hasActiveConnections) {
                toast({
                  title: "No Active Connections",
                  description: "You don't have any active store connections. Please connect to at least one store.",
                  variant: "destructive"
                });
                setIsVerified(false);
              } else {
                setIsVerified(true);
              }
            }
          } catch (error) {
            console.error("Error checking connections:", error);
            if (mounted) {
              setIsVerified(false);
            }
          }
        } else {
          // Store role, admin role, or no specific role requirement
          if (mounted) {
            setIsVerified(true);
          }
        }
      } else {
        // Not authenticated
        if (mounted) {
          setIsAuthenticated(false);
          setIsVerified(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false; // Cleanup flag to prevent state updates
    };
  }, [allowedRole, authStatus, user?.id]); // Remove toast from dependencies and only use user.id

  return { isAuthenticated, isVerified };
}
