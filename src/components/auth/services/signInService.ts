
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "../context/types";
import { AuthResult } from "./types";
import { clearNewAccountFlags } from "@/services/connection/storage-utils";

export const signInUser = async (
  email: string,
  password: string,
  selectedRole: UserRole,
  navigate: NavigateFunction
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign in with:", { email, password });
    
    // FORCEFULLY clear any new account flags for sign-ins
    clearNewAccountFlags(true); // Use immediate mode
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }
        
        // Determine redirect path based on role
        const role = profile?.role || selectedRole;
        const redirectPath = role === 'maintenance' ? '/dashboard' : '/customer/dashboard';
        navigate(redirectPath, { replace: true });
        
        return { success: true, message: "You have been signed in successfully!" };
      } catch (err) {
        console.error("Error during profile fetch or navigation:", err);
        // Fallback navigation
        const fallbackPath = selectedRole === 'maintenance' ? '/dashboard' : '/customer/dashboard';
        navigate(fallbackPath, { replace: true });
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
