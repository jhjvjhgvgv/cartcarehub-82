-- Phase 3: Database Enhancements
-- Add proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_carts_store_id ON public.carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_qr_code ON public.carts(qr_code);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_cart_id ON public.maintenance_requests(cart_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_provider_id ON public.maintenance_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_store_id ON public.maintenance_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_scheduled_date ON public.maintenance_requests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_store_provider_connections_store_id ON public.store_provider_connections(store_id);
CREATE INDEX IF NOT EXISTS idx_store_provider_connections_provider_id ON public.store_provider_connections(provider_id);
CREATE INDEX IF NOT EXISTS idx_store_provider_connections_status ON public.store_provider_connections(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_maintenance_providers_user_id ON public.maintenance_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_providers_is_verified ON public.maintenance_providers(is_verified);

-- Add audit logging function
CREATE OR REPLACE FUNCTION public.audit_maintenance_request_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log maintenance request status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.log_system_action(
      auth.uid(),
      'maintenance_request_status_change',
      'maintenance_request',
      NEW.id::text,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'cart_id', NEW.cart_id,
        'provider_id', NEW.provider_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_maintenance_request_changes_trigger ON public.maintenance_requests;
CREATE TRIGGER audit_maintenance_request_changes_trigger
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_maintenance_request_changes();

-- Add stored procedure for bulk cart status updates
CREATE OR REPLACE FUNCTION public.bulk_update_cart_status(
  cart_ids uuid[],
  new_status text,
  updated_by uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_count integer;
  result jsonb;
BEGIN
  -- Validate status
  IF new_status NOT IN ('active', 'maintenance', 'inactive', 'retired') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid status. Must be one of: active, maintenance, inactive, retired'
    );
  END IF;
  
  -- Update carts
  UPDATE public.carts 
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = ANY(cart_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the bulk update
  PERFORM public.log_system_action(
    updated_by,
    'bulk_cart_status_update',
    'cart',
    array_to_string(cart_ids, ','),
    jsonb_build_object(
      'new_status', new_status,
      'updated_count', updated_count
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', format('Successfully updated %s carts', updated_count),
    'updated_count', updated_count
  );
  
  RETURN result;
END;
$$;

-- Add function to get cart analytics summary
CREATE OR REPLACE FUNCTION public.get_cart_analytics_summary(
  store_id_param text DEFAULT NULL,
  date_from date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  total_carts integer;
  active_carts integer;
  maintenance_carts integer;
  total_maintenance_cost numeric;
  avg_downtime numeric;
  total_issues integer;
BEGIN
  -- Get basic cart counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'maintenance')
  INTO total_carts, active_carts, maintenance_carts
  FROM public.carts
  WHERE (store_id_param IS NULL OR store_id = store_id_param);
  
  -- Get analytics data
  SELECT 
    COALESCE(SUM(maintenance_cost), 0),
    COALESCE(AVG(downtime_minutes), 0),
    COALESCE(SUM(issues_reported), 0)
  INTO total_maintenance_cost, avg_downtime, total_issues
  FROM public.cart_analytics ca
  JOIN public.carts c ON ca.cart_id = c.id
  WHERE 
    (store_id_param IS NULL OR c.store_id = store_id_param)
    AND ca.metric_date BETWEEN date_from AND date_to;
  
  result := jsonb_build_object(
    'summary', jsonb_build_object(
      'total_carts', total_carts,
      'active_carts', active_carts,
      'maintenance_carts', maintenance_carts,
      'cart_utilization_rate', CASE WHEN total_carts > 0 THEN ROUND((active_carts::numeric / total_carts::numeric) * 100, 2) ELSE 0 END
    ),
    'metrics', jsonb_build_object(
      'total_maintenance_cost', total_maintenance_cost,
      'avg_downtime_minutes', ROUND(avg_downtime, 2),
      'total_issues_reported', total_issues,
      'avg_cost_per_cart', CASE WHEN total_carts > 0 THEN ROUND(total_maintenance_cost / total_carts, 2) ELSE 0 END
    ),
    'period', jsonb_build_object(
      'from', date_from,
      'to', date_to
    )
  );
  
  RETURN result;
END;
$$;

-- Add function for automated maintenance scheduling
CREATE OR REPLACE FUNCTION public.schedule_maintenance_requests()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  schedule_record RECORD;
  new_request_id uuid;
  scheduled_count integer := 0;
  result jsonb;
BEGIN
  -- Find schedules that are due for maintenance
  FOR schedule_record IN
    SELECT 
      ms.*,
      c.store_id
    FROM public.maintenance_schedules ms
    JOIN public.carts c ON ms.cart_id = c.id
    WHERE 
      ms.is_active = true
      AND ms.next_due_date <= CURRENT_DATE + INTERVAL '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.maintenance_requests mr
        WHERE 
          mr.cart_id = ms.cart_id 
          AND mr.provider_id = ms.provider_id
          AND mr.status IN ('pending', 'scheduled', 'in_progress')
      )
  LOOP
    -- Create maintenance request
    INSERT INTO public.maintenance_requests (
      cart_id,
      provider_id,
      store_id,
      request_type,
      priority,
      scheduled_date,
      estimated_duration,
      description,
      status
    ) VALUES (
      schedule_record.cart_id,
      schedule_record.provider_id,
      schedule_record.store_id,
      schedule_record.maintenance_type,
      'medium',
      schedule_record.next_due_date,
      schedule_record.estimated_duration,
      format('Scheduled %s maintenance', schedule_record.maintenance_type),
      'pending'
    ) RETURNING id INTO new_request_id;
    
    scheduled_count := scheduled_count + 1;
    
    -- Log the scheduling
    PERFORM public.log_system_action(
      NULL, -- System generated
      'automated_maintenance_scheduled',
      'maintenance_request',
      new_request_id::text,
      jsonb_build_object(
        'cart_id', schedule_record.cart_id,
        'provider_id', schedule_record.provider_id,
        'scheduled_date', schedule_record.next_due_date,
        'maintenance_type', schedule_record.maintenance_type
      )
    );
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'message', format('Scheduled %s maintenance requests', scheduled_count),
    'scheduled_count', scheduled_count
  );
  
  RETURN result;
END;
$$;