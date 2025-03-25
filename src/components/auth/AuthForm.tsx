
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

// Updated to match other files
type UserRole = "maintenance" | "store";

interface AuthFormProps {
  selectedRole: UserRole | null;
  onBack: () => void;
}

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { 
      isValid: false, 
      message: "Password must be at least 6 characters long" 
    };
  }
  return { isValid: true, message: "" };
};

export const AuthForm = ({ selectedRole, onBack }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a portal first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSignUp) {
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
          toast({
            title: "Invalid Password",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: selectedRole })
            .eq('id', signUpData.user.id);

          if (profileError) throw profileError;

          toast({
            title: "Success",
            description: "Account created successfully. Please check your email for confirmation.",
          });
          setIsSignUp(false);
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email and confirm your account before signing in.",
              variant: "destructive",
            });
            return;
          }
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
    }
  };

  const roleLabel = selectedRole === 'maintenance' ? 'Maintenance' : 'Store';

  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border-none overflow-hidden">
      <div className="bg-primary-600 pt-8 pb-12 px-6 relative">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 text-white hover:text-primary-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white text-center">
          {isSignUp ? `Sign Up - ${roleLabel}` : `Welcome Back - ${roleLabel}`}
        </h2>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary-500 rounded-tl-full" />
      </div>
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
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl h-12 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="text-primary-600 hover:text-primary-800 p-0 h-auto text-sm"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </Button>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
          
          <div className="text-center mt-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600"
              onClick={() => setIsSignUp(!isSignUp)}
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
