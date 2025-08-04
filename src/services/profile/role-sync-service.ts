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
      // Get current user from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: "Could not retrieve user authentication data"
        };
      }

      // Get role from user metadata
      const metadataRole = user.user_metadata?.role;
      
      if (!metadataRole) {
        return {
          success: false,
          message: "No role found in user metadata"
        };
      }

      // Update profile with the role from metadata
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: metadataRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating profile role:", updateError);
        return {
          success: false,
          message: "Failed to update profile role"
        };
      }

      return {
        success: true,
        message: "Role successfully synced",
        updatedRole: metadataRole
      };
    } catch (error) {
      console.error("Error in syncUserRole:", error);
      return {
        success: false,
        message: "An unexpected error occurred during role sync"
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
      // Check if maintenance provider profile already exists
      const { data: existingProvider, error: checkError } = await supabase
        .from('maintenance_providers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking maintenance provider:", checkError);
        return {
          success: false,
          message: "Error checking existing maintenance provider profile"
        };
      }

      if (existingProvider) {
        return {
          success: true,
          message: "Maintenance provider profile already exists"
        };
      }

      // Create maintenance provider profile
      const { error: insertError } = await supabase
        .from('maintenance_providers')
        .insert({
          user_id: userId,
          company_name: profileData.companyName || 'Unnamed Company',
          contact_email: profileData.contactEmail || '',
          contact_phone: profileData.contactPhone || null,
          is_verified: false
        });

      if (insertError) {
        console.error("Error creating maintenance provider profile:", insertError);
        return {
          success: false,
          message: "Failed to create maintenance provider profile"
        };
      }

      return {
        success: true,
        message: "Maintenance provider profile created successfully"
      };
    } catch (error) {
      console.error("Error in ensureMaintenanceProviderProfile:", error);
      return {
        success: false,
        message: "An unexpected error occurred while creating maintenance provider profile"
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