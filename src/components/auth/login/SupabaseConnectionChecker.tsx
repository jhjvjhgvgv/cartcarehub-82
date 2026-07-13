import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseConnectionCheckerProps {
  setSupabaseReady: (value: boolean) => void;
}

export const SupabaseConnectionChecker = ({ setSupabaseReady }: SupabaseConnectionCheckerProps) => {
  useEffect(() => {
    (async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Supabase connection warning:", error.message);
          setSupabaseReady(false);
        } else {
          setSupabaseReady(true);
        }
      } catch (err) {
        console.warn("Supabase connection check failed:", err);
        setSupabaseReady(false);
      }
    })();
  }, [setSupabaseReady]);

  return null;
};
