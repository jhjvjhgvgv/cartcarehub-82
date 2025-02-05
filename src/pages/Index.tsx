import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Wrench, Key, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type UserRole = "maintenance" | "store";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthView, setIsAuthView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role === 'maintenance') {
          navigate('/dashboard');
        } else if (profile?.role === 'store') {
          navigate('/customer/dashboard');
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate]);

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const handlePortalClick = (role: UserRole) => {
    setSelectedRole(role);
    setIsAuthView(true);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { 
        isValid: false, 
        message: "Password must be at least 6 characters long" 
      };
    }
    return { isValid: true, message: "" };
  };

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
    }

    try {
      let authResponse;
      
      if (isSignUp) {
        authResponse = await supabase.auth.signUp({
          email,
          password,
        });

        if (authResponse.error) {
          throw authResponse.error;
        }

        // After successful signup, update the user's role
        if (authResponse.data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: selectedRole })
            .eq('id', authResponse.data.user.id);

          if (profileError) throw profileError;
        }

        toast({
          title: "Success",
          description: "Account created successfully. Please check your email for confirmation.",
        });
        setIsSignUp(false);
        return;
      } else {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authResponse.error) {
          if (authResponse.error.message.includes('Email not confirmed')) {
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email and confirm your account before signing in.",
              variant: "destructive",
            });
            return;
          }
          throw authResponse.error;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authResponse.data.user!.id)
          .maybeSingle();

        if (profile?.role === 'maintenance') {
          navigate('/dashboard');
        } else if (profile?.role === 'store') {
          navigate('/customer/dashboard');
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

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (isAuthView) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="w-full max-w-md px-4 py-6 sm:py-8">
          <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm border-primary-100">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                {isSignUp ? "Create Account" : "Sign In"}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {isSignUp && (
                    <p className="text-sm text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsAuthView(false);
                    setSelectedRole(null);
                  }}
                >
                  Back to Portals
                </Button>
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="w-full max-w-md px-4 py-6 sm:py-8 flex flex-col gap-8">
        {/* Logo Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold text-primary-800 mb-2 drop-shadow-lg animate-fade-in">
            Cart Repair Pros
          </h1>
          <p className="text-sm sm:text-lg text-primary-600 animate-fade-in">
            Smart Cart Management System
          </p>
        </div>

        <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm border-primary-100 animate-scale-in">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col space-y-4">
              <p className="text-center text-gray-600 text-sm sm:text-base mb-2">
                Choose your portal
              </p>
              
              <Button
                variant="outline"
                className="h-auto py-4 sm:py-6 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group"
                onClick={() => handlePortalClick('maintenance')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-primary-50 rounded-full flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base sm:text-lg">Maintenance Portal</div>
                    <div className="text-sm text-gray-500">For service providers</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 sm:py-6 flex items-center justify-between space-x-3 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md group"
                onClick={() => handlePortalClick('store')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-primary-50 rounded-full flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base sm:text-lg">Store Portal</div>
                    <div className="text-sm text-gray-500">For store managers</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
              </Button>

              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 flex items-center gap-2 text-sm sm:text-base group"
                  onClick={() => navigate("/forgot-password")}
                >
                  <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Forgot Password?
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;