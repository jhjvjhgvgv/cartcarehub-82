
import React, { useState, useCallback } from "react";
import { LoginContainer } from "@/components/auth/login/LoginContainer";
import { LoadingHandler } from "@/components/auth/login/LoadingHandler";
import { SessionChecker } from "@/components/auth/login/SessionChecker";
import { SupabaseConnectionChecker } from "@/components/auth/login/SupabaseConnectionChecker";

// App version - update this when making significant changes
const APP_VERSION = "1.0.0";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [buildVersion] = useState(() => {
    // Create a versioned build string with date
    const today = new Date().toISOString().split('T')[0];
    return `${APP_VERSION} (${today})`;
  });

  const handleLoadingComplete = useCallback(() => {
    // The loading state is already managed by the timer
  }, []);

  return (
    <>
      {/* Session checker component */}
      <SessionChecker />
      
      {/* Supabase connection checker */}
      <SupabaseConnectionChecker setSupabaseReady={setSupabaseReady} />
      
      {/* Loading handler */}
      <LoadingHandler 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onLoadingComplete={handleLoadingComplete}
      />
      
      {/* Main login container (shown when not loading) */}
      {!isLoading && (
        <LoginContainer 
          buildVersion={buildVersion}
          supabaseReady={supabaseReady}
        />
      )}
    </>
  );
};

export default React.memo(Index);
