import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminDashboardStats {
  users: {
    total: number;
    breakdown: Record<string, number>;
  };
  maintenance_providers: {
    total: number;
    verified: number;
    unverified: number;
  };
  carts: {
    total: number;
    by_status: Record<string, number>;
  };
  connections: {
    active: number;
    pending: number;
    total: number;
  };
  system: {
    recent_admin_activities: number;
    uptime_hours: number;
  };
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  company_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in?: string;
}

export interface AdminActivity {
  id: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: any;
  success: boolean;
  error_message?: string;
  created_at: string;
  profiles: {
    email: string;
    display_name?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Hook for fetching admin dashboard statistics
 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_dashboard_stats' }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch dashboard stats');

      return data.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook for fetching paginated user list
 */
export function useAdminUsers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin-users', page, limit],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'get_users',
          page,
          limit
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch users');

      return {
        data: data.data.users,
        pagination: data.data.pagination
      };
    },
  });
}

/**
 * Hook for fetching admin activities
 */
export function useAdminActivities(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin-activities', page, limit],
    queryFn: async (): Promise<PaginatedResponse<AdminActivity>> => {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'get_activities',
          page,
          limit
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch activities');

      return {
        data: data.data.activities,
        pagination: data.data.pagination
      };
    },
  });
}

/**
 * Hook for managing users (activate/deactivate/update role)
 */
export function useAdminManageUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      user_id,
      user_action,
      new_role,
      reason
    }: {
      user_id: string;
      user_action: 'activate' | 'deactivate' | 'update_role';
      new_role?: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'manage_user',
          user_id,
          user_action,
          new_role,
          reason
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to manage user');

      return data.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });

      toast({
        title: "Success",
        description: data.message || "User managed successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('User management error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to manage user",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for updating system configuration
 */
export function useAdminUpdateConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      config_key,
      config_value
    }: {
      config_key: string;
      config_value: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'update_config',
          config_key,
          config_value
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to update configuration');

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });

      toast({
        title: "Configuration Updated",
        description: data.message || "System configuration updated successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Config update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update configuration",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
}