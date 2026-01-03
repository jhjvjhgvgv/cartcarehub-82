import { supabase } from "@/integrations/supabase/client";

export interface RoleSyncResult {
  success: boolean;
  message: string;
  updatedRole?: string;
}

/**
 * Service to handle role consistency using org_memberships
 */
export const RoleSyncService = {
  /**
   * Gets user's primary role from org_memberships
   */
  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data: membership } = await supabase
        .from('org_memberships')
        .select('role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      return membership?.role || null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  },

  /**
   * Syncs user role - uses org_memberships as source of truth
   */
  async syncUserRole(userId: string): Promise<RoleSyncResult> {
    try {
      console.log("🔄 Syncing role for user:", userId);
      
      // Try to use safe_user_setup RPC if available
      const { data, error } = await supabase.rpc('safe_user_setup', {
        user_id_param: userId
      });

      if (error) {
        console.error("❌ Failed to setup user via RPC:", error);
        
        // Fallback: just get existing role from org_memberships
        const role = await this.getUserRole(userId);
        
        if (role) {
          return { 
            success: true, 
            message: "Role retrieved from existing membership",
            updatedRole: role
          };
        }
        
        return { 
          success: false, 
          message: `No role found for user` 
        };
      }

      const result = data as { success: boolean; message: string; role?: string } | null;
      
      if (!result?.success) {
        return { 
          success: false, 
          message: result?.message || 'Unknown error' 
        };
      }

      console.log("✅ User setup completed successfully");
      return { 
        success: true, 
        message: result.message,
        updatedRole: result.role
      };
    } catch (error) {
      console.error("❌ Error in syncUserRole:", error);
      return { 
        success: false, 
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Checks if user has a provider org membership
   */
  async isProviderMember(userId: string): Promise<boolean> {
    try {
      const { data: memberships } = await supabase
        .from('org_memberships')
        .select('org_id, role')
        .eq('user_id', userId);

      if (!memberships?.length) return false;

      // Check if any membership is for a provider org
      const providerRoles = ['provider_admin', 'provider_tech'];
      return memberships.some(m => providerRoles.includes(m.role));
    } catch (error) {
      console.error("Error checking provider membership:", error);
      return false;
    }
  },

  /**
   * Performs a comprehensive role and profile sync
   */
  async performComprehensiveSync(userId: string): Promise<RoleSyncResult> {
    try {
      // Sync the role
      const roleSyncResult = await this.syncUserRole(userId);
      
      if (!roleSyncResult.success) {
        // Try to get existing role as fallback
        const existingRole = await this.getUserRole(userId);
        if (existingRole) {
          return {
            success: true,
            message: "Using existing role from org membership",
            updatedRole: existingRole
          };
        }
        return roleSyncResult;
      }

      return {
        success: true,
        message: "Comprehensive sync completed successfully",
        updatedRole: roleSyncResult.updatedRole
      };
    } catch (error) {
      console.error("Error in performComprehensiveSync:", error);
      return {
        success: false,
        message: "An unexpected error occurred during comprehensive sync"
      };
    }
  }
};
