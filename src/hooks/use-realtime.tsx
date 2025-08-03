import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type RealtimeTable = 'carts' | 'maintenance_requests' | 'maintenance_schedules';

interface RealtimeOptions {
  table: RealtimeTable;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  enabled?: boolean;
}

export const useRealtime = ({ table, event = '*', filter, enabled = true }: RealtimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    console.log(`Setting up realtime subscription for ${table}`);
    
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter
        } as any,
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
          
          // Invalidate relevant queries
          switch (table) {
            case 'carts':
              queryClient.invalidateQueries({ queryKey: ['carts'] });
              break;
            case 'maintenance_requests':
              queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
              queryClient.invalidateQueries({ queryKey: ['maintenance'] });
              break;
            case 'maintenance_schedules':
              queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
              queryClient.invalidateQueries({ queryKey: ['maintenance'] });
              break;
          }

          // Show notification for important updates
          if (payload.eventType === 'INSERT' && table === 'maintenance_requests') {
            toast({
              title: 'New Maintenance Request',
              description: 'A new maintenance request has been created.',
            });
          }
          
          if (payload.eventType === 'UPDATE' && table === 'maintenance_requests') {
            const newData = payload.new as any;
            if (newData.status === 'completed') {
              toast({
                title: 'Maintenance Completed',
                description: 'A maintenance request has been completed.',
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log(`Cleaning up realtime subscription for ${table}`);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [table, event, filter, enabled, queryClient, toast]);

  return { isConnected };
};

// Hook for multiple table subscriptions
export const useRealtimeSubscriptions = (subscriptions: RealtimeOptions[]) => {
  const connections = subscriptions.map(sub => useRealtime(sub));
  
  return {
    isConnected: connections.every(conn => conn.isConnected),
    connectionStatus: connections.reduce((acc, conn, index) => {
      acc[subscriptions[index].table] = conn.isConnected;
      return acc;
    }, {} as Record<RealtimeTable, boolean>)
  };
};