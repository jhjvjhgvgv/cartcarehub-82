import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PredictiveAnalysis {
  cart_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  ai_prediction: string;
  metrics: {
    total_usage_hours: number;
    total_issues: number;
    avg_downtime: number;
    total_cost: number;
    days_since_maintenance: number | null;
  };
}

export const usePredictiveMaintenance = (cartId: string) => {
  return useQuery({
    queryKey: ['predictive-maintenance', cartId],
    queryFn: async (): Promise<PredictiveAnalysis> => {
      const { data, error } = await supabase.functions.invoke('predictive-maintenance', {
        body: { cart_id: cartId }
      });

      if (error) throw error;
      if (!data?.success) throw new Error('Failed to analyze cart');

      return data;
    },
    enabled: !!cartId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAllCartsPredictive = () => {
  return useQuery({
    queryKey: ['all-carts-predictive'],
    queryFn: async () => {
      // Fetch all active carts
      const { data: carts, error: cartsError } = await supabase
        .from('carts')
        .select('id, qr_code, store_id, status')
        .eq('status', 'active');

      if (cartsError) throw cartsError;

      // Fetch predictive analysis for each cart
      const predictions = await Promise.all(
        (carts || []).map(async (cart) => {
          try {
            const { data } = await supabase.functions.invoke('predictive-maintenance', {
              body: { cart_id: cart.id }
            });
            return {
              ...cart,
              prediction: data?.success ? data : null
            };
          } catch {
            return { ...cart, prediction: null };
          }
        })
      );

      return predictions.filter(p => p.prediction);
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useTriggerAutoSchedule = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('auto-schedule-maintenance', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-carts-predictive'] });
      
      toast({
        title: "Automated Scheduling Complete",
        description: `Scheduled ${data.scheduled_from_schedules} maintenance requests. Created ${data.urgent_requests_created} urgent requests for ${data.high_risk_carts} high-risk carts.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to run automated scheduling",
        variant: "destructive"
      });
    }
  });
};
