
import { supabase } from "@/integrations/supabase/client";
import { createAccountTemplate } from "@/services/account/account-templates";
import { NavigateFunction } from "react-router-dom";
import { UserRole } from "./types";

interface AuthResult {
  success: boolean;
  message: string;
  error?: any;
}

export const signUpUser = async (
  email: string,
  password: string,
  selectedRole: UserRole
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign up with:", { email, role: selectedRole });
    
    // Set flag that this is a new account to prevent sample data creation
    localStorage.setItem('isNewAccountSession', 'true');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: selectedRole,
        },
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
      // Create account template based on selected role
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

export const signInUser = async (
  email: string,
  password: string,
  selectedRole: UserRole,
  navigate: NavigateFunction
): Promise<AuthResult> => {
  try {
    console.log("Attempting sign in with:", { email, password });
    
    // Reset new account flag on sign in
    localStorage.removeItem('isNewAccountSession');
    
    // Use signInWithPassword instead of signIn which is deprecated
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Sign in response:", { data: signInData, error: signInError });

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
        
        console.log("User profile:", profile);
        
        // Determine redirect path based on role
        if (profile?.role === 'maintenance') {
          console.log("Redirecting to maintenance dashboard");
          navigate('/dashboard', { replace: true });
        } else if (profile?.role === 'store') {
          console.log("Redirecting to store dashboard");
          navigate('/customer/dashboard', { replace: true });
        } else {
          console.log("Role not found in profile, using selected role:", selectedRole);
          // If no role in profile, use the selected role for navigation
          if (selectedRole === 'maintenance') {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/customer/dashboard', { replace: true });
          }
        }
        
        return { success: true, message: "You have been signed in successfully!" };
      } catch (err) {
        console.error("Error during profile fetch or navigation:", err);
        // Fallback navigation if there's an error fetching the profile
        if (selectedRole === 'maintenance') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
        return { success: true, message: "You have been signed in successfully!" };
      }
    } else {
      console.error("No user data returned after successful sign in");
      return { 
        success: false, 
        message: "Login succeeded but user data is missing. Please try again."
      };
    }
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, message: error.message || "An unexpected error occurred", error };
  }
};

export const checkSession = async (navigate: NavigateFunction): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session check error:", error);
      return false;
    }
    
    if (data.session) {
      console.log("User already has an active session:", data.session);
      
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .maybeSingle();
        
      if (profile?.role === 'maintenance') {
        navigate('/dashboard');
      } else if (profile?.role === 'store') {
        navigate('/customer/dashboard');
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Error checking session:", err);
    return false;
  }
};
