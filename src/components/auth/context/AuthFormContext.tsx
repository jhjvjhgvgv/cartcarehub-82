
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthFormContextType, UserRole } from "./types";
import { validateFormData } from "../utils/formValidation";
import { signUpUser, signInUser, checkSession } from "./authService";

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
    checkSession(navigate);
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
    
    const validation = validateFormData(
      email,
      password,
      isSignUp ? confirmPassword : null,
      selectedRole,
      isSignUp
    );

    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up flow
        if (!selectedRole) {
          throw new Error("Role selection is required");
        }

        const result = await signUpUser(email, password, selectedRole);
        
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          setIsSignUp(false);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } else {
        // Sign In flow
        if (!selectedRole) {
          throw new Error("Role selection is required");
        }

        const result = await signInUser(email, password, selectedRole, navigate);
        
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
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
