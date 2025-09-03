import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RealtimeConnectionUpdate {
  id: string;
  store_id: string;
  provider_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function useRealtimeConnections(onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Stabilize the onUpdate callback
  const stableOnUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  useEffect(() => {
    console.log('Setting up real-time connection listener...');
    
    const channel = supabase
      .channel('connection-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'store_provider_connections'
        },
        (payload) => {
          console.log('Real-time connection update received:', payload);
          
          const eventType = payload.eventType;
          const connection = payload.new as RealtimeConnectionUpdate;
          
          // Show appropriate toast notification
          if (eventType === 'INSERT') {
            toast({
              title: "New Connection Request",
              description: `Connection request received from ${connection.store_id}`,
              duration: 5000,
            });
          } else if (eventType === 'UPDATE') {
            const oldConnection = payload.old as RealtimeConnectionUpdate;
            if (oldConnection.status !== connection.status) {
              if (connection.status === 'accepted') {
                toast({
                  title: "Connection Accepted",
                  description: `Connection with ${connection.store_id} has been accepted`,
                  duration: 5000,
                });
              } else if (connection.status === 'rejected') {
                toast({
                  title: "Connection Rejected", 
                  description: `Connection with ${connection.store_id} has been rejected`,
                  variant: "destructive",
                  duration: 5000,
                });
              }
            }
          }
          
          // Trigger data refresh
          stableOnUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Real-time Updates Enabled",
            description: "You'll receive instant notifications for connection updates",
            duration: 3000,
          });
        }
      });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up real-time connection listener');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [stableOnUpdate]); // Only depend on the stable callback, not toast

  return { isConnected };
}