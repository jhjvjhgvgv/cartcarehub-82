import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to changes on provider_store_links and invokes onUpdate
 * whenever a row is inserted, updated, or deleted. Silent (no toasts) —
 * consumers should reflect the update in their own UI/toasts.
 */
export function useRealtimeConnections(onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const onUpdateRef = useRef(onUpdate);

  // Keep latest callback without re-subscribing
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const trigger = useCallback(() => {
    onUpdateRef.current?.();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("provider-store-links-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "provider_store_links",
        },
        () => {
          trigger();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [trigger]);

  return { isConnected };
}
