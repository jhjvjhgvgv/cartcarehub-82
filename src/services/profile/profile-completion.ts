import { supabase } from "@/integrations/supabase/client";

export interface ProfileCompletion {
  isComplete: boolean;
  missingFields: string[];
  hasOrgMembership: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
}

export const checkProfileCompletion = async (userId: string): Promise<ProfileCompletion> => {
  try {
    // Get the user's profile from the user_profiles table
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return {
        isComplete: false,
        missingFields: ['profile'],
        hasOrgMembership: false,
        emailVerified: false,
        onboardingCompleted: false,
      };
    }

    if (!profile) {
      return {
        isComplete: false,
        missingFields: ['profile'],
        hasOrgMembership: false,
        emailVerified: false,
        onboardingCompleted: false,
      };
    }

    const missingFields: string[] = [];

    // Check required fields
    if (!profile.full_name) {
      missingFields.push('full_name');
    }

    // Check if user has any org memberships
    const { data: memberships } = await supabase
      .from('org_memberships')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const hasOrgMembership = (memberships?.length || 0) > 0;
    
    if (!hasOrgMembership) {
      missingFields.push('organization');
    }

    // Get auth user for email verification status
    const { data: { user } } = await supabase.auth.getUser();
    const emailVerified = user?.email_confirmed_at != null;

    if (!emailVerified) {
      missingFields.push('email_verification');
    }

    // Consider onboarding complete if user has profile and org membership
    const onboardingCompleted = !!profile.full_name && hasOrgMembership;

    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      missingFields,
      hasOrgMembership,
      emailVerified,
      onboardingCompleted,
    };
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return {
      isComplete: false,
      missingFields: ['error'],
      hasOrgMembership: false,
      emailVerified: false,
      onboardingCompleted: false,
    };
  }
};

export const createUserProfile = async (
  userId: string, 
  fullName: string, 
  phone?: string
): Promise<boolean> => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      return true;
    }

    // Insert new profile - note: user_profiles RLS may need INSERT policy
    // For now, profile creation is typically handled by auth trigger
    console.log("Profile creation for new users should be handled by database trigger");
    return false;
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return false;
  }
};

// Helper to get user's primary role from org_memberships
export const getUserPrimaryRole = async (userId: string): Promise<string | null> => {
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
};
