import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Work order based maintenance (canonical schema)
interface WorkOrderInput {
  store_org_id: string;
  provider_org_id?: string;
  assigned_to?: string;
  status?: 'new' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  scheduled_at?: string;
  summary?: string;
  notes?: string;
}

export const useCreateWorkOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrder: WorkOrderInput) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([workOrder])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order",
        variant: "destructive"
      });
    }
  });
};

export const useWorkOrders = (storeOrgId?: string) => {
  return useQuery({
    queryKey: ['work-orders', storeOrgId],
    queryFn: async () => {
      let query = supabase
        .from('work_orders_with_store')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeOrgId) {
        query = query.eq('store_org_id', storeOrgId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
};

// Legacy hooks - return empty arrays for backward compatibility
export const useMaintenanceRequests = (storeId?: string) => {
  // Use work_orders as the source for "maintenance requests"
  return useQuery({
    queryKey: ['maintenance-requests', storeId],
    queryFn: async () => {
      let query = supabase
        .from('work_orders_with_store')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_org_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map work_orders to maintenance request-like structure
      return (data || []).map(wo => ({
        id: wo.id,
        request_type: wo.summary || 'Maintenance',
        priority: 'medium',
        status: wo.status,
        scheduled_date: wo.scheduled_at,
        estimated_duration: 60,
        store_name: wo.store_name,
      }));
    }
  });
};

export const useMaintenanceSchedules = (cartId?: string) => {
  // Return inspections as "schedules" for calendar display
  return useQuery({
    queryKey: ['maintenance-schedules', cartId],
    queryFn: async () => {
      let query = supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (cartId) {
        query = query.eq('cart_id', cartId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map inspections to schedule-like structure
      return (data || []).map(insp => ({
        id: insp.id,
        maintenance_type: 'Inspection',
        next_due_date: insp.created_at,
        estimated_duration: 30,
        cart_id: insp.cart_id,
      }));
    }
  });
};

export const useOverdueMaintenance = () => {
  // Use cart_alerts view to find overdue inspections
  return useQuery({
    queryKey: ['overdue-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_alerts')
        .select('*')
        .eq('alert_overdue_inspection', true);

      if (error) throw error;
      return data || [];
    }
  });
};

export const useUpcomingMaintenance = (days: number = 7) => {
  // Use work_orders scheduled in the next N days
  return useQuery({
    queryKey: ['upcoming-maintenance', days],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .neq('status', 'completed')
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', futureDate.toISOString());

      if (error) throw error;
      return data || [];
    }
  });
};
