
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/auth/context/types";

export const createAccountTemplate = async (
  userId: string,
  role: UserRole,
  email: string
): Promise<boolean> => {
  try {
    console.log("Creating account template for:", { userId, role, email });
    
    // Create or update profile with enhanced data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: role,
        email: email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return false;
    }

    // The maintenance provider profile will be created automatically by the trigger
    // if role is 'maintenance', so we don't need to manually create it here

    console.log("Account template created successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error creating account template:", error);
    return false;
  }
};

