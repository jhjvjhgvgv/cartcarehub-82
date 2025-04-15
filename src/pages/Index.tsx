
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { Logo } from "@/components/auth/Logo";
import { BuildInfo } from "@/components/auth/BuildInfo";
import { TestMode } from "@/components/auth/TestMode";

type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [buildVersion] = useState(`${Date.now().toString().slice(-6)}`);

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
    setRefreshing(true);
    
    // Log operation for debugging
    console.log('Force refresh initiated at:', new Date().toISOString());
    
    // Clear localStorage except for test mode values
    const testMode = localStorage.getItem("testMode");
    const testRole = localStorage.getItem("testRole");
    localStorage.clear();
    if (testMode) localStorage.setItem("testMode", testMode);
    if (testRole) localStorage.setItem("testRole", testRole);
    
    // Clear caches if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        console.log(`Found ${names.length} caches to clear`);
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Simple reload without cache busting parameters
    setTimeout(() => {
      window.location.reload();
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
        Version: {buildVersion} | Updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Index;
