import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRequest {
  cart_id: string;
  provider_id: string;
  store_id: string;
  request_type: string;
  priority: string;
  status: string;
  description?: string;
  scheduled_date?: string;
  estimated_duration?: number;
}

export const useCreateMaintenanceRequest = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: MaintenanceRequest) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating maintenance request:', error);
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive"
      });
    }
  });
};

export const useMaintenanceRequests = (storeId?: string) => {
  return useQuery({
    queryKey: ['maintenance-requests', storeId],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

export const useMaintenanceSchedules = (cartId?: string) => {
  return useQuery({
    queryKey: ['maintenance-schedules', cartId],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: true });

      if (cartId) {
        query = query.eq('cart_id', cartId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

export const useOverdueMaintenance = () => {
  return useQuery({
    queryKey: ['overdue-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*, carts(*)')
        .eq('is_active', true)
        .lt('next_due_date', new Date().toISOString());

      if (error) throw error;
      return data;
    }
  });
};

export const useUpcomingMaintenance = (days: number = 7) => {
  return useQuery({
    queryKey: ['upcoming-maintenance', days],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*, carts(*)')
        .eq('is_active', true)
        .gte('next_due_date', new Date().toISOString())
        .lte('next_due_date', futureDate.toISOString());

      if (error) throw error;
      return data;
    }
  });
};
