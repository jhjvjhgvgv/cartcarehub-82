import { supabase } from "@/integrations/supabase/client";

export interface RoleSyncResult {
  success: boolean;
  message: string;
  updatedRole?: string;
}

/**
 * Service to handle role consistency between auth metadata and profile records
 */
export const RoleSyncService = {
  /**
   * Syncs user role from auth metadata to profile table
   */
  async syncUserRole(userId: string): Promise<RoleSyncResult> {
    try {
      console.log("🔄 Syncing role for user:", userId);
      
      // Use the new safe setup function
      const { data, error } = await supabase.rpc('safe_user_setup', {
        user_id_param: userId
      });

      if (error) {
        console.error("❌ Failed to setup user:", error);
        return { 
          success: false, 
          message: `Failed to setup user: ${error.message}` 
        };
      }

      const result = data as { success: boolean; message: string; role?: string };
      
      if (!result.success) {
        return { 
          success: false, 
          message: result.message 
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
   * Ensures maintenance provider profile exists for maintenance users
   */
  async ensureMaintenanceProviderProfile(userId: string, profileData: {
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<RoleSyncResult> {
    try {
      console.log("🏢 Ensuring maintenance provider profile for user:", userId);
      
      // Check if maintenance provider profile already exists
      const { data: existingProvider, error: checkError } = await supabase
        .from('maintenance_providers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error("❌ Error checking existing provider:", checkError);
        // Don't fail completely, this might be due to RLS
        console.warn("⚠️ Could not check existing provider, proceeding with creation attempt");
      }

      if (existingProvider) {
        console.log("✅ Maintenance provider profile already exists");
        return { 
          success: true, 
          message: "Maintenance provider profile already exists" 
        };
      }

      // Create maintenance provider profile with defensive handling
      const { error: createError } = await supabase
        .from('maintenance_providers')
        .insert({
          user_id: userId,
          company_name: profileData.companyName || 'Company Name Required',
          contact_email: profileData.contactEmail || '',
          contact_phone: profileData.contactPhone || '',
          is_verified: false
        });

      if (createError) {
        console.error("❌ Error creating maintenance provider profile:", createError);
        // Return success if it's a duplicate key error (already exists)
        if (createError.code === '23505') {
          return { 
            success: true, 
            message: "Maintenance provider profile already exists" 
          };
        }
        return { 
          success: false, 
          message: `Failed to create maintenance provider profile: ${createError.message}` 
        };
      }

      console.log("✅ Maintenance provider profile created successfully");
      return { 
        success: true, 
        message: "Maintenance provider profile created successfully" 
      };
    } catch (error) {
      console.error("❌ Error creating maintenance provider profile:", error);
      return { 
        success: false, 
        message: `Failed to create maintenance provider profile: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Performs a comprehensive role and profile sync
   */
  async performComprehensiveSync(userId: string): Promise<RoleSyncResult> {
    try {
      // First sync the role
      const roleSyncResult = await this.syncUserRole(userId);
      
      if (!roleSyncResult.success) {
        return roleSyncResult;
      }

      // If user is maintenance, ensure provider profile exists
      if (roleSyncResult.updatedRole === 'maintenance') {
        // Get additional profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, display_name, company_name, contact_phone')
          .eq('id', userId)
          .maybeSingle();

        const providerResult = await this.ensureMaintenanceProviderProfile(userId, {
          companyName: profile?.company_name,
          contactEmail: profile?.email,
          contactPhone: profile?.contact_phone
        });

        if (!providerResult.success) {
          return {
            success: false,
            message: `Role synced but failed to create maintenance provider profile: ${providerResult.message}`
          };
        }
      }
      // Store users and admin users don't need additional profile setup

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