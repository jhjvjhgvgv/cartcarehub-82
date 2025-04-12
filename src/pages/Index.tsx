
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { ShoppingCart, Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Make sure to define this type the same way across all files
type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    // Don't set loading to false immediately after completion
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

  // Force refresh the page and clear caches
  const forceRefresh = () => {
    setRefreshing(true);
    
    // Clear all localStorage except for essential test mode values
    const testMode = localStorage.getItem("testMode");
    const testRole = localStorage.getItem("testRole");
    localStorage.clear();
    if (testMode) localStorage.setItem("testMode", testMode);
    if (testRole) localStorage.setItem("testRole", testRole);
    
    // Clear caches if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Unregister service workers more aggressively
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        const promises = registrations.map(registration => registration.unregister());
        Promise.all(promises).then(() => {
          console.log('All service workers unregistered');
        });
      });
    }
    
    // Add extra timestamp to URL to bust cache
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const cacheBuster = `t=${timestamp}&r=${random}&_v=${timestamp}_${random}&forceUpdate=true&nocache=true&flush=true&invalidate=${Date.now()}`;
    
    // Reload with extreme cache busting
    setTimeout(() => {
      document.location.href = window.location.pathname + 
        `?${cacheBuster}`;
    }, 500);
  };

  if (isLoading) {
    return <LoadingView onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="w-full max-w-md px-6 py-8 flex flex-col gap-8">
        {/* Logo Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg mb-4 relative" style={{ width: '120px', height: '120px' }}>
              {/* Replace 3D cart with simple Lucide ShoppingCart icon */}
              <ShoppingCart className="w-full h-full text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg animate-fade-in">
            Cart Repair Pros
          </h1>
          <p className="text-sm sm:text-base text-primary-100 animate-fade-in">
            Smart Cart Management System
          </p>
          
          {/* Force Refresh Button */}
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
              onClick={forceRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Force Refresh"}
            </Button>
          </div>
        </div>

        {selectedPortal ? (
          <AuthForm selectedRole={selectedPortal} onBack={handleBack} />
        ) : (
          <>
            <PortalSelection onPortalClick={handlePortalClick} />
            
            {/* Test Mode Section */}
            <div className="mt-4">
              <div className="flex flex-col space-y-3">
                <p className="text-white text-sm text-center font-medium flex items-center justify-center gap-1">
                  <Bug size={16} /> Test Mode (Bypass Login)
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                    onClick={() => enterTestMode("maintenance")}
                  >
                    Maintenance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                    onClick={() => enterTestMode("store")}
                  >
                    Store
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Version info with timestamp that changes on every render */}
      <div className="absolute bottom-2 text-xs text-white/40">
        Version: {Date.now().toString()}
      </div>
    </div>
  );
};

export default Index;
