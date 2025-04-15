import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "./utils/validation";
import { PasswordInput } from "./components/PasswordInput";
import { FormHeader } from "./components/FormHeader";
import { SignUpMessage } from "./components/SignUpMessage";

type UserRole = "maintenance" | "store";

interface AuthFormProps {
  selectedRole: UserRole | null;
  onBack: () => void;
}

export const AuthForm = ({ selectedRole, onBack }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          toast({
            title: "Success",
            description: "Account created! Please check your email for confirmation.",
          });
          setIsSignUp(false);
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (signInData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', signInData.user.id)
            .maybeSingle();

          if (profile?.role === 'maintenance') {
            navigate('/dashboard');
          } else if (profile?.role === 'store') {
            navigate('/customer/dashboard');
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border-none overflow-hidden">
      <FormHeader 
        title={isSignUp ? `Sign Up - ${selectedRole}` : `Welcome Back - ${selectedRole}`}
        onBack={onBack}
      />
      <CardContent className="p-6 pt-8">
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-3">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl h-12"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            />
          </div>

          {isSignUp && (
            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              />
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="text-primary-600 hover:text-primary-800 p-0 h-auto text-sm"
                onClick={() => navigate("/forgot-password")}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>
            </div>
          )}

          {isSignUp && <SignUpMessage />}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Log In")}
          </Button>
          
          <div className="text-center mt-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword("");
              }}
              disabled={isLoading}
            >
              {isSignUp 
                ? "Already have an account? Sign In" 
                : "Need an account? Sign Up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
