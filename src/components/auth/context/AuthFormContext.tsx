
import React, { createContext, useContext, useState } from "react";
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        console.log("Sign in successful:", signInData);

        if (signInData.user) {
          toast({
            title: "Success",
            description: "You have been signed in successfully!",
          });
          
          console.log("Fetching user profile...");
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
            navigate('/dashboard');
          } else if (profile?.role === 'store') {
            console.log("Redirecting to store dashboard");
            navigate('/customer/dashboard');
          } else {
            console.log("Role not found in profile, using selected role:", selectedRole);
            // If no role in profile, use the selected role for navigation
            if (selectedRole === 'maintenance') {
              navigate('/dashboard');
            } else {
              navigate('/customer/dashboard');
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message,
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
