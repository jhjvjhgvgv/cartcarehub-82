
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSupabaseAuth = () => {
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener for session changes
    const setupAuthListener = async () => {
      const { data } = await supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session ? "Has session" : "No session");
        
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
  }, []);

  return { authSubscription };
};
