
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";
import { createAccountTemplate } from "@/services/account/account-templates";

type UserRole = "maintenance" | "store";

interface AuthFormContextType {
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isLoading: boolean;
  selectedRole: UserRole | null;
  handleAuth: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

const AuthFormContext = createContext<AuthFormContextType | undefined>(undefined);

export const useAuthForm = () => {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error("useAuthForm must be used within an AuthFormProvider");
  }
  return context;
};

interface AuthFormProviderProps {
  children: React.ReactNode;
  selectedRole: UserRole | null;
}

export const AuthFormProvider: React.FC<AuthFormProviderProps> = ({ 
  children, 
  selectedRole 
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
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
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, [navigate]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { isSignUp, email, password, selectedRole });
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a portal first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up flow
        if (password !== confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { isValid, message } = validatePassword(password);
        if (!isValid) {
          toast({
            title: "Invalid Password",
            description: message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log("Attempting sign up with:", { email, role: selectedRole });
        
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
            toast({
              title: "Signup Disabled",
              description: "Signups are currently disabled in this application. Please enable signups in the Supabase dashboard or contact the administrator.",
              variant: "destructive",
            });
          } else {
            throw signUpError;
          }
          setIsLoading(false);
          return;
        }

        if (signUpData.user) {
          // Create account template based on selected role
          const templateCreated = await createAccountTemplate(
            signUpData.user.id,
            selectedRole,
            email
          );
          
          if (templateCreated) {
            toast({
              title: "Success",
              description: `Your ${selectedRole} account has been created! Please check your email for confirmation.`,
            });
          } else {
            toast({
              title: "Account Created",
              description: "Your account was created but we couldn't set up your profile template. Please contact support.",
              variant: "default",
            });
          }
          
          setIsSignUp(false);
        }
      } else {
        // Sign In flow
        console.log("Attempting sign in with:", { email, password });
        
        // Use signInWithPassword instead of signIn which is deprecated
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Sign in response:", { data: signInData, error: signInError });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        if (signInData?.user) {
          toast({
            title: "Success",
            description: "You have been signed in successfully!",
          });
          
          console.log("Fetching user profile...");
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
            
            // Store session in localStorage to maintain login state
            localStorage.setItem('supabase.auth.token', JSON.stringify(signInData.session));
            
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
          } catch (err) {
            console.error("Error during profile fetch or navigation:", err);
            // Fallback navigation if there's an error fetching the profile
            if (selectedRole === 'maintenance') {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/customer/dashboard', { replace: true });
            }
          }
        } else {
          console.error("No user data returned after successful sign in");
          toast({
            title: "Error",
            description: "Login succeeded but user data is missing. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isSignUp,
    setIsSignUp,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    selectedRole,
    handleAuth,
    resetForm,
  };

  return (
    <AuthFormContext.Provider value={value}>
      {children}
    </AuthFormContext.Provider>
  );
};
