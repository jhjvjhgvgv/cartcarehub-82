
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingView } from "@/components/auth/LoadingView";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";

type UserRole = "maintenance" | "store";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthView, setIsAuthView] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Add a minimum delay to ensure loading screen is visible
      const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
      
      const sessionCheck = async () => {
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
      };

      // Wait for both the minimum delay and session check
      await Promise.all([minDelay, sessionCheck()]);
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate]);

  const handleLoadingComplete = () => {
    // Don't set loading to false immediately after completion
    // The loading state is already managed by checkSession
  };

  const handlePortalClick = (role: UserRole) => {
    setSelectedRole(role);
    setIsAuthView(true);
  };

  if (isLoading) {
    return <LoadingView onLoadingComplete={handleLoadingComplete} />;
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

        {isAuthView ? (
          <AuthForm
            selectedRole={selectedRole}
            onBack={() => {
              setIsAuthView(false);
              setSelectedRole(null);
            }}
          />
        ) : (
          <PortalSelection onPortalClick={handlePortalClick} />
        )}
      </div>
    </div>
  );
};

export default Index;
