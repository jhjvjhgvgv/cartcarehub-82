
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SupabaseConnectionCheckerProps {
  setSupabaseReady: (value: boolean) => void;
}

export const SupabaseConnectionChecker = ({ setSupabaseReady }: SupabaseConnectionCheckerProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('carts').select('count').limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error.message);
          toast({
            title: "Connection Issue",
            description: "Unable to connect to the database. Some features may be unavailable.",
            variant: "destructive"
          });
        } else {
          console.log("Supabase connection established successfully");
          setSupabaseReady(true);
        }
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
      }
    };
    
    checkSupabaseConnection();
  }, [toast, setSupabaseReady]);

  // This component doesn't render anything
  return null;
};
