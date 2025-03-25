
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { ShoppingCart } from "lucide-react";

// Make sure to define this type the same way across all files
type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);

  useEffect(() => {
    // Add a minimum delay to ensure loading screen is visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

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
        </div>

        {selectedPortal ? (
          <AuthForm selectedRole={selectedPortal} onBack={handleBack} />
        ) : (
          <PortalSelection onPortalClick={handlePortalClick} />
        )}
      </div>
    </div>
  );
};

export default Index;
