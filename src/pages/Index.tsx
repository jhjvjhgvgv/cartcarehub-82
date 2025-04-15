
import React, { useState, useEffect, useRef } from "react";
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

  // Check Supabase connectivity on mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Perform a simple health check query
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
    // Check if test mode is enabled from localStorage
    const testMode = localStorage.getItem("testMode");
    if (testMode) {
      const role = localStorage.getItem("testRole") as UserRole;
      if (role === "maintenance") {
        navigate("/dashboard");
      } else if (role === "store") {
        navigate("/customer/dashboard");
      }
    }

    // Add a minimum delay to ensure loading screen is visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLoadingComplete = () => {
    // The loading state is already managed by the timer
  };

  const handlePortalClick = (portal: PortalType) => {
    if (portal === 'forgot-password') {
      navigate('/forgot-password');
    } else {
      setSelectedPortal(portal);
    }
  };

  const handleBack = () => {
    setSelectedPortal(null);
  };

  const enterTestMode = (role: UserRole) => {
    localStorage.setItem("testMode", "true");
    localStorage.setItem("testRole", role);
    if (role === "maintenance") {
      navigate("/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  const forceRefresh = () => {
    // Prevent excessive refreshing
    refreshAttemptCount.current += 1;
    
    if (refreshAttemptCount.current > 3) {
      toast({
        title: "Too Many Refreshes",
        description: "Please wait a moment before trying again.",
        variant: "destructive"
      });
      
      // Reset counter after a delay
      setTimeout(() => {
        refreshAttemptCount.current = 0;
      }, 10000);
      
      return;
    }
    
    setRefreshing(true);
    
    // Simple soft reload without cache clearing
    setTimeout(() => {
      // This approach avoids refresh loops while still refreshing the page
      window.location.href = window.location.pathname;
    }, 500);
  };

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

export default Index;
