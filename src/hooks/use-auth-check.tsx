import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionService } from "@/services/ConnectionService";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type PortalRole = 'store' | 'provider' | 'corp';

// Determine portal type from org_memberships role
const getPortalFromMembership = (role: string): PortalRole | null => {
  if (role.startsWith('store_')) return 'store';
  if (role.startsWith('provider_')) return 'provider';
  if (role.startsWith('corp_')) return 'corp';
  return null;
};

export function useAuthCheck(allowedRole?: "maintenance" | "store" | "admin") {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const { user, isAuthenticated: authStatus, isLoading } = useAuth();
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      console.log("🔍 useAuthCheck - checking auth", { allowedRole, authStatus, userId: user?.id, isLoading });
      
      // If in test mode, skip auth check
      const testMode = localStorage.getItem("testMode");
      if (testMode === "true") {
        console.log("✅ Test mode enabled, allowing access");
        if (mounted) {
          setIsAuthenticated(true);
          setIsVerified(true);
          setRoleCheckComplete(true);
        }
        return;
      }
      
      // Wait for auth loading to complete
      if (isLoading) {
        console.log("⏳ Auth still loading...");
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
          // Get user's org memberships to determine portal access
          const { data: memberships, error: membershipError } = await supabase
            .from('org_memberships')
            .select('role, org_id')
            .eq('user_id', user.id)
            .limit(1);
            
          if (membershipError) {
            console.error("Error fetching memberships:", membershipError);
            if (mounted) {
              // Even on error, allow the user through - they may need to complete onboarding
              setIsVerified(allowedRole ? false : true);
              setRoleCheckComplete(true);
            }
            return;
          }
          
          const membershipRole = memberships?.[0]?.role || null;
          const portal = membershipRole ? getPortalFromMembership(membershipRole) : null;
          
          console.log("🎭 User portal:", portal, "Required role:", allowedRole, "Has memberships:", (memberships?.length || 0) > 0);
          
          // If user has no memberships yet, they need onboarding
          // Allow them through if no specific role is required
          if (!memberships || memberships.length === 0) {
            console.log("⚠️ No memberships found - user needs onboarding");
            if (mounted) {
              // No role required = allow through (e.g., onboarding page)
              // Role required = deny (they can't access role-specific pages yet)
              setIsVerified(allowedRole ? false : true);
              setRoleCheckComplete(true);
            }
            return;
          }
          
          // Map allowedRole to portal type for checking
          const roleToPortal: Record<string, PortalRole> = {
            'maintenance': 'provider',
            'store': 'store',
            'admin': 'corp',
          };
          
          // Check if user has required role
          if (allowedRole) {
            const requiredPortal = roleToPortal[allowedRole];
            if (portal !== requiredPortal) {
              console.log("❌ Portal mismatch, access denied");
              if (mounted) {
                setIsVerified(false);
                setRoleCheckComplete(true);
              }
              return;
            }
          }
          
          console.log("✅ Auth check passed");
          if (mounted) {
            setIsVerified(true);
            setRoleCheckComplete(true);
          }
          
        } catch (error) {
          console.error("Error in auth check:", error);
          if (mounted) {
            // On error, allow access if no role required
            setIsVerified(allowedRole ? false : true);
            setRoleCheckComplete(true);
          }
        }
      } else {
        // Not authenticated
        console.log("❌ User not authenticated");
        if (mounted) {
          setIsAuthenticated(false);
          setIsVerified(false);
          setRoleCheckComplete(true);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [allowedRole, authStatus, user?.id, isLoading]);

  return { isAuthenticated, isVerified, roleCheckComplete };
}
