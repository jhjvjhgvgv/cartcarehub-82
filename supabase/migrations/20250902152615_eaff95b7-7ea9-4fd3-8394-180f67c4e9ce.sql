-- Phase 1: Core Platform Stability - Security & Database Optimizations

-- Add password security configuration
UPDATE auth.config SET enable_password_leak_protection = true;

-- Create system logs table for audit trails
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system logs (admins only)
CREATE POLICY "Admins can view all system logs" ON public.system_logs
FOR SELECT USING (is_admin_user());

CREATE POLICY "System can insert logs" ON public.system_logs
FOR INSERT WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_store_id ON public.carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_last_maintenance ON public.carts(last_maintenance);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_cart_id ON public.maintenance_requests(cart_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_provider_id ON public.maintenance_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_store_provider_connections_store_id ON public.store_provider_connections(store_id);
CREATE INDEX IF NOT EXISTS idx_store_provider_connections_provider_id ON public.store_provider_connections(provider_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id_created_at ON public.system_logs(user_id, created_at);

-- Create function to log system actions
CREATE OR REPLACE FUNCTION public.log_system_action(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.system_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details
  ) VALUES (
    p_user_id, 
    p_action, 
    p_resource_type, 
    p_resource_id, 
    p_details
  );
END;
$$;

-- Create company settings table for multi-tenant features
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  company_type text NOT NULL CHECK (company_type IN ('store', 'maintenance')),
  settings jsonb DEFAULT '{}',
  branding jsonb DEFAULT '{}',
  subscription_tier text DEFAULT 'basic',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on company_settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company settings
CREATE POLICY "Users can view their company settings" ON public.company_settings
FOR SELECT USING (
  created_by = auth.uid() OR 
  is_admin_user()
);

CREATE POLICY "Users can create company settings" ON public.company_settings
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their company settings" ON public.company_settings
FOR UPDATE USING (created_by = auth.uid());

-- Create onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  current_step integer DEFAULT 1,
  completed_steps jsonb DEFAULT '[]',
  onboarding_data jsonb DEFAULT '{}',
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding progress
CREATE POLICY "Users can manage their own onboarding" ON public.onboarding_progress
FOR ALL USING (user_id = auth.uid());

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();