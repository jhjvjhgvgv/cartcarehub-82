
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { Logo } from "@/components/auth/Logo";
import { BuildInfo } from "@/components/auth/BuildInfo";
import { TestMode } from "@/components/auth/TestMode";
import { useToast } from "@/hooks/use-toast";

type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

// App version - update this when making significant changes
const APP_VERSION = "1.0.0";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshAttemptCount = useRef(0);
  const [buildVersion] = useState(() => {
    // Create a versioned build string with date
    const today = new Date().toISOString().split('T')[0];
    return `${APP_VERSION} (${today})`;
  });
  
  const [supabaseReady, setSupabaseReady] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    // The loading state is already managed by the timer
  }, []);

  const handlePortalClick = useCallback((portal: PortalType) => {
    if (portal === 'forgot-password') {
      navigate('/forgot-password');
    } else {
      setSelectedPortal(portal);
    }
  }, [navigate]);

  const handleBack = useCallback(() => {
    setSelectedPortal(null);
  }, []);

  const enterTestMode = useCallback((role: UserRole) => {
    // Important: Clear the new account flag when entering test mode
    localStorage.removeItem('isNewAccountSession');
    
    localStorage.setItem("testMode", "true");
    localStorage.setItem("testRole", role);
    if (role === "maintenance") {
      navigate("/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  }, [navigate]);

  const forceRefresh = useCallback(() => {
    refreshAttemptCount.current += 1;
    
    if (refreshAttemptCount.current > 3) {
      toast({
        title: "Too Many Refreshes",
        description: "Please wait a moment before trying again.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        refreshAttemptCount.current = 0;
      }, 10000);
      
      return;
    }
    
    setRefreshing(true);
    
    // Force reload the page
    window.location.reload();
  }, [toast]);

  // Check existing session and redirect if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("User has an active session:", data.session);
          
          // Look up user profile to determine correct redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profile?.role === 'maintenance') {
            navigate('/dashboard', { replace: true });
          } else if (profile?.role === 'store') {
            navigate('/customer/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    // Only check for existing session if not in test mode
    const testMode = localStorage.getItem("testMode");
    if (!testMode) {
      checkExistingSession();
    }
  }, [navigate]);

  // Check Supabase connectivity on mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('carts').select('count').limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error.message);
          toast({
            title: "Connection Issue",
            description: "Unable to connect to the database. Some features may be unavailable.",
            variant: "destructive"
          });
        } else {
          console.log("Supabase connection established successfully");
          setSupabaseReady(true);
        }
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
      }
    };
    
    checkSupabaseConnection();
  }, [toast]);

  useEffect(() => {
    const testMode = localStorage.getItem("testMode");
    if (testMode) {
      const role = localStorage.getItem("testRole") as UserRole;
      if (role === "maintenance") {
        navigate("/dashboard");
      } else if (role === "store") {
        navigate("/customer/dashboard");
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (isLoading) {
    return <LoadingView onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="w-full max-w-md px-6 py-8 flex flex-col gap-8">
        <Logo />
        <BuildInfo 
          buildVersion={buildVersion}
          onRefresh={forceRefresh}
          refreshing={refreshing}
        />
        
        {!supabaseReady && (
          <div className="p-3 text-sm bg-yellow-500/20 text-yellow-200 rounded-md">
            Database connection issue detected. Some features may be unavailable.
          </div>
        )}
        
        {selectedPortal ? (
          <AuthForm selectedRole={selectedPortal} onBack={handleBack} />
        ) : (
          <>
            <PortalSelection onPortalClick={handlePortalClick} />
            <TestMode onEnterTestMode={enterTestMode} />
          </>
        )}
      </div>

      <div className="absolute bottom-2 text-xs text-white/40">
        Version: {buildVersion}
      </div>
    </div>
  );
};

export default React.memo(Index);
