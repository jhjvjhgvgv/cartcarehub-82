
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/auth/Logo";
import { BuildInfo } from "@/components/auth/BuildInfo";
import { ConnectionWarning } from "./ConnectionWarning";
import { AuthForm } from "@/components/auth/AuthForm";
import { PortalSelection } from "@/components/auth/PortalSelection";
import { RefreshButton } from "./RefreshButton";

type UserRole = "maintenance" | "store";
type PortalType = UserRole | "forgot-password";

interface LoginContainerProps {
  buildVersion: string;
  supabaseReady: boolean;
}

export const LoginContainer = ({ buildVersion, supabaseReady }: LoginContainerProps) => {
  const navigate = useNavigate();
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const { refreshing, handleRefresh } = RefreshButton({ 
    onRefresh: () => {
      window.location.reload();
    }
  });

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

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60">
      <div className="w-full max-w-md px-6 py-8 flex flex-col gap-8">
        <Logo />
        <BuildInfo 
          buildVersion={buildVersion}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        
        <ConnectionWarning supabaseReady={supabaseReady} />
        
        {selectedPortal ? (
          <AuthForm selectedRole={selectedPortal} onBack={handleBack} />
        ) : (
          <PortalSelection onPortalClick={handlePortalClick} />
        )}
      </div>

      <div className="absolute bottom-2 text-xs text-primary-foreground/40">
        Version: {buildVersion}
      </div>
    </div>
  );
};
