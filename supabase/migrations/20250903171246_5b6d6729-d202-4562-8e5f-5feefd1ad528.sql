-- Phase 4: Master Admin Interface
-- Create admin roles and permissions system
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  granted_by uuid REFERENCES public.profiles(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add admin activity tracking
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES public.profiles(id),
  action text NOT NULL,
  target_type text NOT NULL, -- 'user', 'provider', 'cart', 'system'
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create system configuration table
CREATE TABLE IF NOT EXISTS public.system_configuration (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configuration ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_permissions
CREATE POLICY "Admins can view all permissions" ON public.admin_permissions
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Super admins can manage permissions" ON public.admin_permissions
  FOR ALL USING (
    is_admin_user() AND EXISTS (
      SELECT 1 FROM public.admin_permissions ap 
      WHERE ap.user_id = auth.uid() 
      AND ap.permissions ? 'super_admin' 
      AND ap.is_active = true
    )
  );

-- Create policies for admin_activities
CREATE POLICY "Admins can view admin activities" ON public.admin_activities
  FOR SELECT USING (is_admin_user());

CREATE POLICY "System can insert admin activities" ON public.admin_activities
  FOR INSERT WITH CHECK (true);

-- Create policies for system_configuration
CREATE POLICY "Anyone can view public config" ON public.system_configuration
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all config" ON public.system_configuration
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Super admins can manage config" ON public.system_configuration
  FOR ALL USING (
    is_admin_user() AND EXISTS (
      SELECT 1 FROM public.admin_permissions ap 
      WHERE ap.user_id = auth.uid() 
      AND ap.permissions ? 'super_admin' 
      AND ap.is_active = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_active ON public.admin_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_user ON public.admin_activities(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON public.admin_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activities_action ON public.admin_activities(action);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_configuration(config_key);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_system_configuration_updated_at
  BEFORE UPDATE ON public.system_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if user has specific admin permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions 
    WHERE user_id = auth.uid() 
    AND permissions ? permission_name
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  p_action text,
  p_target_type text,
  p_target_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_activities (
    admin_user_id,
    action,
    target_type,
    target_id,
    details,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    p_success,
    p_error_message
  );
END;
$$;

-- Function to get system stats for admin dashboard
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  total_users integer;
  total_maintenance_providers integer;
  total_carts integer;
  active_connections integer;
  pending_requests integer;
  recent_activities integer;
BEGIN
  -- Check admin permissions
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  -- Get user counts
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Get maintenance provider counts
  SELECT COUNT(*) INTO total_maintenance_providers FROM public.maintenance_providers WHERE is_verified = true;
  
  -- Get cart counts
  SELECT COUNT(*) INTO total_carts FROM public.carts;
  
  -- Get connection counts
  SELECT COUNT(*) INTO active_connections FROM public.store_provider_connections WHERE status = 'accepted';
  SELECT COUNT(*) INTO pending_requests FROM public.store_provider_connections WHERE status = 'pending';
  
  -- Get recent activities (last 24 hours)
  SELECT COUNT(*) INTO recent_activities FROM public.admin_activities WHERE created_at > now() - interval '24 hours';

  result := jsonb_build_object(
    'users', jsonb_build_object(
      'total', total_users,
      'breakdown', (
        SELECT jsonb_object_agg(role, count)
        FROM (
          SELECT COALESCE(role, 'unassigned') as role, COUNT(*) as count
          FROM public.profiles 
          GROUP BY role
        ) role_counts
      )
    ),
    'maintenance_providers', jsonb_build_object(
      'total', total_maintenance_providers,
      'verified', (SELECT COUNT(*) FROM public.maintenance_providers WHERE is_verified = true),
      'unverified', (SELECT COUNT(*) FROM public.maintenance_providers WHERE is_verified = false OR is_verified IS NULL)
    ),
    'carts', jsonb_build_object(
      'total', total_carts,
      'by_status', (
        SELECT jsonb_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM public.carts 
          GROUP BY status
        ) status_counts
      )
    ),
    'connections', jsonb_build_object(
      'active', active_connections,
      'pending', pending_requests,
      'total', active_connections + pending_requests
    ),
    'system', jsonb_build_object(
      'recent_admin_activities', recent_activities,
      'uptime_hours', EXTRACT(EPOCH FROM (now() - (SELECT created_at FROM public.profiles ORDER BY created_at LIMIT 1))) / 3600
    )
  );

  -- Log the dashboard access
  PERFORM public.log_admin_activity(
    'dashboard_accessed',
    'system',
    'dashboard',
    jsonb_build_object('timestamp', now())
  );

  RETURN result;
END;
$$;

-- Function to manage user accounts (activate/deactivate/update roles)
CREATE OR REPLACE FUNCTION public.admin_manage_user(
  p_user_id uuid,
  p_action text, -- 'activate', 'deactivate', 'update_role', 'delete'
  p_new_role text DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  target_user record;
BEGIN
  -- Check admin permissions
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;

  -- Get target user info
  SELECT * INTO target_user FROM public.profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Prevent admins from modifying other admins without super admin permissions
  IF target_user.role = 'admin' AND NOT public.has_admin_permission('super_admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient permissions');
  END IF;

  CASE p_action
    WHEN 'activate' THEN
      UPDATE public.profiles SET is_active = true, updated_at = now() WHERE id = p_user_id;
      PERFORM public.log_admin_activity('user_activated', 'user', p_user_id::text, 
        jsonb_build_object('reason', p_reason, 'target_email', target_user.email));
      result := jsonb_build_object('success', true, 'message', 'User activated successfully');
      
    WHEN 'deactivate' THEN
      UPDATE public.profiles SET is_active = false, updated_at = now() WHERE id = p_user_id;
      PERFORM public.log_admin_activity('user_deactivated', 'user', p_user_id::text, 
        jsonb_build_object('reason', p_reason, 'target_email', target_user.email));
      result := jsonb_build_object('success', true, 'message', 'User deactivated successfully');
      
    WHEN 'update_role' THEN
      IF p_new_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'New role required');
      END IF;
      
      UPDATE public.profiles SET role = p_new_role, updated_at = now() WHERE id = p_user_id;
      PERFORM public.log_admin_activity('user_role_updated', 'user', p_user_id::text, 
        jsonb_build_object('old_role', target_user.role, 'new_role', p_new_role, 'reason', p_reason));
      result := jsonb_build_object('success', true, 'message', 'User role updated successfully');
      
    ELSE
      result := jsonb_build_object('success', false, 'message', 'Invalid action');
  END CASE;

  RETURN result;
END;
$$;

-- Insert default system configuration
INSERT INTO public.system_configuration (config_key, config_value, description, is_public, created_by) 
VALUES 
  ('maintenance_schedule_buffer_days', '7', 'Number of days in advance to schedule maintenance', true, NULL),
  ('max_cart_downtime_minutes', '120', 'Maximum allowed downtime before alert', true, NULL),
  ('notification_email_enabled', 'true', 'Enable email notifications', false, NULL),
  ('system_maintenance_mode', 'false', 'Enable system maintenance mode', false, NULL)
ON CONFLICT (config_key) DO NOTHING;