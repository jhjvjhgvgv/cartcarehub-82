
import { supabase } from "@/integrations/supabase/client";
import { createAccountTemplate } from "@/services/account/account-templates";
import { UserRole } from "../context/types";
import { AuthResult } from "./types";
import { clearNewAccountFlags, setNewAccountSessionFlag } from "@/services/connection/storage-utils";

export const signUpUser = async (
  email: string,
  password: string,
  selectedRole: UserRole
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign up with:", { email, role: selectedRole });
    
    // FORCEFULLY clear any existing flags first to avoid state confusion
    localStorage.removeItem("isNewAccountSession");
    localStorage.removeItem("lastOperation");
    
    // Now set the new account flags
    localStorage.setItem("isNewAccountSession", "true");
    localStorage.setItem("lastOperation", "signup");
    console.log("⭐ NEW ACCOUNT FLAGS FORCEFULLY SET - THIS IS A NEW ACCOUNT ⭐");
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: selectedRole,
          display_name: email, // Use email as initial display name
        },
        emailRedirectTo: `${window.location.origin}/setup-profile`
      },
    });

    if (signUpError) {
      // Handle the specific "Signups not allowed" error
      if (signUpError.message.includes("Signups not allowed")) {
        return {
          success: false,
          message: "Signups are currently disabled in this application. Please enable signups in the Supabase dashboard or contact the administrator.",
          error: signUpError
        };
      } else {
        return { success: false, message: signUpError.message, error: signUpError };
      }
    }

    if (signUpData.user) {
      // Create account template with enhanced profile data
      const templateCreated = await createAccountTemplate(
        signUpData.user.id,
        selectedRole,
        email
      );
      
      if (templateCreated) {
        return {
          success: true,
          message: `Your ${selectedRole} account has been created! Please check your email for confirmation.`
        };
      } else {
        return {
          success: true,
          message: "Your account was created but we couldn't set up your profile template. Please contact support."
        };
      }
    }
    
    return {
      success: false,
      message: "Sign up completed but no user was created. Please try again."
    };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, message: error.message || "An unexpected error occurred", error };
  }
};
