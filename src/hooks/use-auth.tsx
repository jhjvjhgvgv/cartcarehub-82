
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const setupAuthListener = async () => {
      try {
        console.log("🔐 Setting up auth listener...");
        
        // Set up listener FIRST to catch all events
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("🔄 Auth state changed:", event, session ? "Has session" : "No session");
          
          if (mounted) {
            setSession(session);
            setUser(session?.user || null);
            setIsLoading(false);
          }
          
          if (event === 'SIGNED_OUT') {
            console.log("🚪 User signed out, clearing session data");
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('sb-qxutldpiaxfdicdsiomt-auth-token');
          }
        });
        
        if (mounted) {
          setAuthSubscription(data.subscription);
        }

        // THEN check current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (mounted) {
          setSession(sessionData.session);
          setUser(sessionData.session?.user || null);
          setIsLoading(false);
          console.log("📱 Initial session:", sessionData.session ? "Found" : "None");
        }
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        if (mounted) setIsLoading(false);
      }
    };
    
    setupAuthListener();
    
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return { 
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
  };
};
