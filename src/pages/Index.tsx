
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { ShoppingCart, Bug, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Make sure to define this type the same way across all files
type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [buildVersion] = useState(`${Date.now().toString()}_${Math.random().toString(36).substring(2)}`);

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
    
    // Special handling for Lovable environment
    if (window.location.hostname.includes('lovable.app')) {
      console.log('Lovable environment detected in Index component');
      // Force styles to recalculate
      document.documentElement.style.setProperty('--cache-buster', Date.now().toString());
    }
    
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

  // Force refresh the page and clear caches - enhanced version
  const forceRefresh = () => {
    setRefreshing(true);
    
    // Log operation for debugging
    console.log('Force refresh initiated at:', new Date().toISOString());
    
    // Clear all localStorage except for essential test mode values
    const testMode = localStorage.getItem("testMode");
    const testRole = localStorage.getItem("testRole");
    localStorage.clear();
    if (testMode) localStorage.setItem("testMode", testMode);
    if (testRole) localStorage.setItem("testRole", testRole);
    
    // Clear caches if possible - now with progress reporting
    if ('caches' in window) {
      caches.keys().then(names => {
        console.log(`Found ${names.length} caches to clear`);
        names.forEach(name => {
          console.log(`Clearing cache: ${name}`);
          caches.delete(name);
        });
      });
    }
    
    // Unregister service workers more aggressively
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log(`Found ${registrations.length} service workers to unregister`);
        const promises = registrations.map(registration => {
          console.log(`Unregistering service worker: ${registration.scope}`);
          return registration.unregister();
        });
        Promise.all(promises).then(() => {
          console.log('All service workers unregistered');
        });
      });
    }
    
    // Add extra timestamp to URL to bust cache - now with multiple parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const random2 = Math.random().toString(36).substring(2);
    const random3 = Math.random().toString(36).substring(2);
    const cacheBuster = `t=${timestamp}&r=${random}&r2=${random2}&r3=${random3}&_v=${timestamp}_${random}&_r=${random2}_${random3}&forceUpdate=true&nocache=true&flush=true&invalidate=${Date.now()}&clear=cache`;
    
    // Set some attributes on the HTML element to force reflow
    document.documentElement.setAttribute('data-refresh-time', timestamp.toString());
    document.documentElement.setAttribute('data-refresh-id', random);
    
    // Add meta tags dynamically to force cache invalidation
    const meta = document.createElement('meta');
    meta.name = 'refresh-token';
    meta.content = `${timestamp}_${random}`;
    document.head.appendChild(meta);
    
    // Reload with extreme cache busting - with a small delay to ensure UI update
    console.log('Preparing to reload page with cache busting');
    setTimeout(() => {
      console.log('Executing page reload now');
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
              {/* Updated cart icon with animation */}
              <ShoppingCart className="w-full h-full text-primary-600 animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg animate-fade-in">
            Cart Repair Pros
          </h1>
          <p className="text-sm sm:text-base text-primary-100 animate-fade-in">
            Smart Cart Management System
          </p>
          
          {/* Force Refresh Button */}
          <div className="mt-4 flex justify-center gap-2">
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                  >
                    <Info size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Updated version! Build: {buildVersion}</p>
                  <p className="text-xs">Rendered at: {new Date().toLocaleTimeString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        Version: {buildVersion} | Updated: {new Date().toLocaleTimeString()} | ID: {Math.random().toString(36).substring(2)}
      </div>
    </div>
  );
};

export default Index;
