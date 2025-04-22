
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/ConnectionService";

export function useAuthCheck(allowedRole?: "maintenance" | "store") {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // If in test mode, skip auth check
      const testMode = localStorage.getItem("testMode");
      if (testMode === "true") {
        setIsAuthenticated(true);
        setIsVerified(true);
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          return;
        }
        
        if (data.session) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
          
          // Check role permissions
          if (allowedRole === "maintenance") {
            // Check if the maintenance provider has connections
            // to any stores before allowing access
            const currentUser = ConnectionService.getCurrentUser();
            const connections = await ConnectionService.getMaintenanceRequests(currentUser.id);
            
            const hasActiveConnections = connections.some(conn => conn.status === "active");
            
            if (!hasActiveConnections) {
              toast({
                title: "No Active Connections",
                description: "You don't have any active store connections. Please connect to at least one store.",
                variant: "destructive"
              });
              // Redirect to settings where they can establish connections
              setIsVerified(false);
            } else {
              setIsVerified(true);
            }
          } else {
            setIsVerified(true); // Not maintenance role
          }
        } else {
          console.log("No active session found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [allowedRole, toast]);

  return { isAuthenticated, isVerified };
}
