import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceRequest {
  id: string;
  cart_id: string;
  provider_id: string;
  store_id: string;
  request_type: 'routine' | 'emergency' | 'inspection' | 'repair';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  completed_date?: string;
  description?: string;
  notes?: any[];
  estimated_duration?: number;
  actual_duration?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  cart_id: string;
  provider_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequency: number;
  next_due_date: string;
  last_completed?: string;
  is_active: boolean;
  maintenance_type: string;
  estimated_duration: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Hook for fetching maintenance requests
export const useMaintenanceRequests = (filters?: { status?: string; priority?: string }) => {
  return useQuery({
    queryKey: ['maintenance-requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          carts!maintenance_requests_cart_id_fkey(qr_code, store, status),
          maintenance_providers!maintenance_requests_provider_id_fkey(company_name, contact_email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });
};

// Hook for fetching maintenance schedules
export const useMaintenanceSchedules = (cartId?: string) => {
  return useQuery({
    queryKey: ['maintenance-schedules', cartId],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_schedules')
        .select(`
          *,
          carts!maintenance_schedules_cart_id_fkey(qr_code, store, status),
          maintenance_providers!maintenance_schedules_provider_id_fkey(company_name, contact_email)
        `)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (cartId) {
        query = query.eq('cart_id', cartId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as MaintenanceSchedule[];
    },
  });
};

// Hook for creating maintenance requests
export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestData: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.functions.invoke('maintenance-scheduler', {
        body: {
          action: 'create_request',
          data: requestData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      toast({
        title: 'Success',
        description: 'Maintenance request created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create maintenance request.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating maintenance requests
export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<MaintenanceRequest> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('maintenance-scheduler', {
        body: {
          action: 'update_request',
          data: updates
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      toast({
        title: 'Success',
        description: 'Maintenance request updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update maintenance request.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for completing maintenance
export const useCompleteMaintenance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      notes, 
      actualDuration, 
      cost 
    }: { 
      requestId: string; 
      notes?: string; 
      actualDuration?: number; 
      cost?: number; 
    }) => {
      const { data, error } = await supabase.functions.invoke('maintenance-scheduler', {
        body: {
          action: 'complete_maintenance',
          data: {
            request_id: requestId,
            notes,
            actual_duration: actualDuration,
            cost
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      toast({
        title: 'Success',
        description: 'Maintenance completed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete maintenance.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for getting overdue maintenance
export const useOverdueMaintenance = () => {
  return useQuery({
    queryKey: ['maintenance', 'overdue'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('maintenance-scheduler', {
        body: {
          action: 'get_overdue_maintenance'
        }
      });

      if (error) throw error;
      return data.data as MaintenanceSchedule[];
    },
  });
};

// Hook for getting upcoming maintenance
export const useUpcomingMaintenance = (days: number = 7) => {
  return useQuery({
    queryKey: ['maintenance', 'upcoming', days],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('maintenance-scheduler', {
        body: {
          action: 'get_upcoming_maintenance',
          data: { days }
        }
      });

      if (error) throw error;
      return data.data as MaintenanceSchedule[];
    },
  });
};