
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener for session changes
    const setupAuthListener = async () => {
      // First check current session
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      setUser(sessionData.session?.user || null);

      // Then set up listener for future changes
      const { data } = await supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session ? "Has session" : "No session");
        
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_OUT') {
          // Clear any session data when signed out
          localStorage.removeItem('supabase.auth.token');
        }
      });
      
      setAuthSubscription(data.subscription);
    };
    
    setupAuthListener();
    
    return () => {
      // Clean up auth listener
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Remove toast from dependencies

  return { 
    user,
    session,
    isAuthenticated: !!user,
  };
};
