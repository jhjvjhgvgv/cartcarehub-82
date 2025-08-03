-- Phase 2: Enhanced Backend Functionality

-- Create maintenance_requests table for tracking maintenance activities
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id),
  store_id TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('routine', 'emergency', 'inspection', 'repair')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create maintenance_schedules table for recurring maintenance
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  frequency INTEGER NOT NULL DEFAULT 1, -- Every X periods
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_completed TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  maintenance_type TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create cart_analytics table for tracking performance metrics
CREATE TABLE IF NOT EXISTS public.cart_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_hours DECIMAL(5,2) DEFAULT 0,
  distance_traveled DECIMAL(8,2) DEFAULT 0, -- in meters
  maintenance_cost DECIMAL(10,2) DEFAULT 0,
  downtime_minutes INTEGER DEFAULT 0,
  issues_reported INTEGER DEFAULT 0,
  customer_satisfaction DECIMAL(3,2), -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(cart_id, metric_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_cart_id ON public.maintenance_requests(cart_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_provider_id ON public.maintenance_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_scheduled_date ON public.maintenance_requests(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_cart_id ON public.maintenance_schedules(cart_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due ON public.maintenance_schedules(next_due_date) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_cart_analytics_cart_id ON public.cart_analytics(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_date ON public.cart_analytics(metric_date);

-- Create RLS policies for maintenance_requests
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance requests for their carts"
ON public.maintenance_requests FOR SELECT
USING (
  -- Maintenance providers can see requests assigned to them
  (public.get_user_role(auth.uid()) = 'maintenance' AND 
   provider_id IN (SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()))
  OR
  -- Store users can see requests for their carts (simplified for now)
  (public.get_user_role(auth.uid()) = 'store')
);

CREATE POLICY "Maintenance providers can update their requests"
ON public.maintenance_requests FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'maintenance' AND
  provider_id IN (SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid())
);

CREATE POLICY "Store users can create maintenance requests"
ON public.maintenance_requests FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) = 'store');

-- Create RLS policies for maintenance_schedules
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance schedules for their carts"
ON public.maintenance_schedules FOR SELECT
USING (
  (public.get_user_role(auth.uid()) = 'maintenance' AND 
   provider_id IN (SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()))
  OR
  (public.get_user_role(auth.uid()) = 'store')
);

CREATE POLICY "Maintenance providers can manage schedules"
ON public.maintenance_schedules FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'maintenance' AND
  provider_id IN (SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid())
);

-- Create RLS policies for cart_analytics
ALTER TABLE public.cart_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view cart analytics"
ON public.cart_analytics FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert analytics data"
ON public.cart_analytics FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to update maintenance schedules after completion
CREATE OR REPLACE FUNCTION public.update_maintenance_schedule_after_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a maintenance request is completed, update the corresponding schedule
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.maintenance_schedules 
    SET 
      last_completed = NEW.completed_date,
      next_due_date = CASE 
        WHEN schedule_type = 'daily' THEN NEW.completed_date + (frequency || ' days')::interval
        WHEN schedule_type = 'weekly' THEN NEW.completed_date + (frequency || ' weeks')::interval
        WHEN schedule_type = 'monthly' THEN NEW.completed_date + (frequency || ' months')::interval
        WHEN schedule_type = 'quarterly' THEN NEW.completed_date + (frequency * 3 || ' months')::interval
        WHEN schedule_type = 'yearly' THEN NEW.completed_date + (frequency || ' years')::interval
        ELSE next_due_date
      END,
      updated_at = now()
    WHERE cart_id = NEW.cart_id 
      AND maintenance_type = NEW.request_type
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating schedules
CREATE TRIGGER trigger_update_maintenance_schedule
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maintenance_schedule_after_completion();

-- Add updated_at triggers for all new tables
CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cart_analytics_updated_at
  BEFORE UPDATE ON public.cart_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for real-time updates
ALTER TABLE public.carts REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_requests REPLICA IDENTITY FULL;
ALTER TABLE public.maintenance_schedules REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.carts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedules;