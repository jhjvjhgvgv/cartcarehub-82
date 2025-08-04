
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/ConnectionService";
import { useAuth } from "@/hooks/use-auth";

export function useAuthCheck(allowedRole?: "maintenance" | "store" | "admin") {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated: authStatus } = useAuth();
  
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
      
      // Set authentication status based on the useAuth hook
      setIsAuthenticated(authStatus);
      
      if (authStatus && user) {
        // Check role permissions
        if (allowedRole === "maintenance") {
          // Check if the maintenance provider has connections
          // to any stores before allowing access
          try {
            // Use the authenticated user ID for maintenance role checking
            const userId = user?.id || '';
            const connections = await ConnectionService.getMaintenanceRequests(userId);
            
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
          } catch (error) {
            console.error("Error checking connections:", error);
            setIsVerified(false);
          }
        } else if (allowedRole === "admin") {
          // Admin users don't need connection verification
          setIsVerified(true);
        } else {
          // Store role and other roles don't need connection verification
          setIsVerified(true);
        }
      } else {
        // Not authenticated
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [allowedRole, authStatus, toast, user]);

  return { isAuthenticated, isVerified };
}
