import { supabase } from "@/integrations/supabase/client";

export interface ProfileCompletion {
  isComplete: boolean;
  missingFields: string[];
  needsMaintenanceProfile: boolean;
}

export const checkProfileCompletion = async (userId: string): Promise<ProfileCompletion> => {
  try {
    // Get the user's profile from the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return {
        isComplete: false,
        missingFields: ['profile'],
        needsMaintenanceProfile: false
      };
    }

    if (!profile) {
      return {
        isComplete: false,
        missingFields: ['profile'],
        needsMaintenanceProfile: false
      };
    }

    const missingFields: string[] = [];
    let needsMaintenanceProfile = false;

    // Check required fields for all users
    if (!profile.display_name) {
      missingFields.push('display_name');
    }
    if (!profile.company_name) {
      missingFields.push('company_name');
    }

    // If user is a maintenance provider, check if they have a maintenance_providers profile
    if (profile.role === 'maintenance') {
      const { data: maintenanceProfile, error: maintenanceError } = await supabase
        .from('maintenance_providers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (maintenanceError) {
        console.error("Error checking maintenance profile:", maintenanceError);
        needsMaintenanceProfile = true;
      } else if (!maintenanceProfile) {
        needsMaintenanceProfile = true;
      }
    }

    const isComplete = missingFields.length === 0 && !needsMaintenanceProfile;

    return {
      isComplete,
      missingFields,
      needsMaintenanceProfile
    };
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return {
      isComplete: false,
      missingFields: ['error'],
      needsMaintenanceProfile: false
    };
  }
};

export const createMaintenanceProviderProfile = async (userId: string, companyName: string, contactEmail: string, contactPhone?: string): Promise<boolean> => {
  try {
    // Check if maintenance provider profile already exists
    const { data: existingProvider } = await supabase
      .from('maintenance_providers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProvider) {
      console.log("Maintenance provider profile already exists");
      return true; // Already exists, consider it successful
    }

    const { error } = await supabase
      .from('maintenance_providers')
      .insert({
        user_id: userId,
        company_name: companyName,
        contact_email: contactEmail,
        contact_phone: contactPhone
      });

    if (error) {
      console.error("Error creating maintenance provider profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating maintenance provider profile:", error);
    return false;
  }
};