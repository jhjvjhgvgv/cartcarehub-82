
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../context/types";
import { AuthResult } from "./types";
import { clearNewAccountFlags } from "@/services/connection/storage-utils";
import { fetchUserProfile, handleNavigation } from "./profile/profileService";

export const signInUser = async (
  email: string,
  password: string,
  selectedRole: UserRole,
  navigate: NavigateFunction
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign in with:", { email, password });
    
    // FORCEFULLY clear any new account flags for sign-ins
    clearNewAccountFlags(true);
    localStorage.setItem("lastOperation", "signin");
    console.log("⭐ NEW ACCOUNT FLAGS FORCEFULLY CLEARED - THIS IS NOT A NEW ACCOUNT ⭐");
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return { success: false, message: signInError.message, error: signInError };
    }

    if (signInData?.user) {
      // Store session in localStorage to maintain login state
      localStorage.setItem('supabase.auth.token', JSON.stringify(signInData.session));
      
      try {
        // Ensure profile/role is synced from auth metadata before routing
        try {
          const { error: setupError } = await supabase.rpc('safe_user_setup', {
            user_id_param: signInData.user.id,
          });
          if (setupError) {
            console.warn('safe_user_setup failed, continuing with existing profile:', setupError);
          }
        } catch (e) {
          console.warn('safe_user_setup threw, continuing:', e);
        }
        
        // Fetch the (potentially updated) profile
        const profile = await fetchUserProfile(signInData.user.id);
        const roleFromProfile = profile?.role || null;
        const roleFromMetadata = (signInData.user.user_metadata as any)?.role || null;
        
        // Prefer synced profile role; if missing, fall back to auth metadata, then selected portal
        const role = roleFromProfile || roleFromMetadata || selectedRole;
        
        // Update last sign in timestamp
        await supabase
          .from('profiles')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('id', signInData.user.id);
        
        await handleNavigation(role, selectedRole, navigate, signInData.user.id);
        
        return { success: true, message: "You have been signed in successfully!" };
      } catch (err) {
        console.error("Error during profile fetch or navigation:", err);
        await handleNavigation(selectedRole, selectedRole, navigate, signInData.user.id);
        return { success: true, message: "You have been signed in successfully!" };
      }
    }
    
    return { 
      success: false, 
      message: "Login succeeded but user data is missing. Please try again."
    };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, message: error.message || "An unexpected error occurred", error };
  }
};
