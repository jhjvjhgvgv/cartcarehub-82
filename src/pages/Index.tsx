import React, { useState, useEffect } from "react";
import { LoginContainer } from "@/components/auth/login/LoginContainer";
import { SessionChecker } from "@/components/auth/login/SessionChecker";
import { SupabaseConnectionChecker } from "@/components/auth/login/SupabaseConnectionChecker";
import { logCurrentSessionState } from "@/utils/session-debug";

// App version - update this when making significant changes
const APP_VERSION = "1.0.0";

const Index = () => {
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [buildVersion] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return `${APP_VERSION} (${today})`;
  });

  useEffect(() => {
    console.log("🏠 Index page mounted");
    logCurrentSessionState();
  }, []);

  return (
    <>
      <SessionChecker />
      <SupabaseConnectionChecker setSupabaseReady={setSupabaseReady} />
      <LoginContainer 
        buildVersion={buildVersion}
        supabaseReady={supabaseReady}
      />
    </>
  );
};

export default React.memo(Index);
