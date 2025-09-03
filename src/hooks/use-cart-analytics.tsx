import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CartAnalyticsSummary {
  summary: {
    total_carts: number;
    active_carts: number;
    maintenance_carts: number;
    cart_utilization_rate: number;
  };
  metrics: {
    total_maintenance_cost: number;
    avg_downtime_minutes: number;
    total_issues_reported: number;
    avg_cost_per_cart: number;
  };
  period: {
    from: string;
    to: string;
  };
}

export interface BulkUpdateRequest {
  cart_ids: string[];
  new_status: string;
}

/**
 * Hook for fetching cart analytics summary
 */
export function useCartAnalyticsSummary(
  storeId?: string,
  dateFrom?: string,
  dateTo?: string
) {
  return useQuery({
    queryKey: ['cart-analytics-summary', storeId, dateFrom, dateTo],
    queryFn: async (): Promise<CartAnalyticsSummary> => {
      const { data, error } = await supabase.functions.invoke('cart-analytics', {
        body: {
          action: 'get_summary',
          store_id: storeId,
          date_from: dateFrom,
          date_to: dateTo
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch analytics');

      return data.data;
    },
    enabled: true, // Always enabled, will use defaults if no params provided
  });
}

/**
 * Hook for bulk updating cart status
 */
export function useBulkUpdateCartStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cart_ids, new_status }: BulkUpdateRequest) => {
      const { data, error } = await supabase.functions.invoke('cart-analytics', {
        body: {
          action: 'bulk_update_status',
          cart_ids,
          new_status
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to update cart status');

      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate cart-related queries
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      queryClient.invalidateQueries({ queryKey: ['cart-analytics-summary'] });

      toast({
        title: "Success",
        description: data.message || "Cart status updated successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Bulk update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart status",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for scheduling maintenance requests
 */
export function useScheduleMaintenanceRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cart-analytics', {
        body: {
          action: 'schedule_maintenance'
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to schedule maintenance');

      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate maintenance-related queries
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });

      toast({
        title: "Maintenance Scheduled",
        description: data.message || "Maintenance requests scheduled successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Schedule maintenance error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule maintenance",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for sending maintenance notifications
 */
export function useMaintenanceNotifications() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      type,
      recipient_emails,
      store_id,
      provider_id,
      maintenance_request_id
    }: {
      type: 'overdue_maintenance' | 'upcoming_maintenance' | 'maintenance_completed';
      recipient_emails?: string[];
      store_id?: string;
      provider_id?: string;
      maintenance_request_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('maintenance-notifications', {
        body: {
          type,
          recipient_emails,
          store_id,
          provider_id,
          maintenance_request_id
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send notifications');

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Notifications Sent",
        description: data.message || "Maintenance notifications sent successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Notification error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notifications",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
}