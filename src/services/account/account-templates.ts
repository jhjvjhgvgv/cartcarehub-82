
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/auth/context/types";

export const createAccountTemplate = async (
  userId: string,
  role: UserRole,
  email: string
): Promise<boolean> => {
  try {
    console.log("Creating account template for:", { userId, role, email });
    
    // Use RPC call to safely setup user with proper permissions
    const { data, error } = await supabase.rpc('safe_user_setup', {
      user_id_param: userId
    });

    if (error) {
      console.error("Profile creation error:", error);
      return false;
    }

    const result = data as { success: boolean; message?: string } | null;
    if (result && !result.success) {
      console.error("User setup failed:", result.message);
      return false;
    }

    console.log("Account template created successfully via RPC");
    return true;
  } catch (error) {
    console.error("Unexpected error creating account template:", error);
    return false;
  }
};

