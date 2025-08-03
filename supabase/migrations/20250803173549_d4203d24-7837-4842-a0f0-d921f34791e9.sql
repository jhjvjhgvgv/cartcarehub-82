-- First, let's check the current role constraint and update it to include 'admin'
-- Drop the existing check constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add a new constraint that includes admin role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('store', 'maintenance', 'admin'));

-- Now update existing users to admin role
UPDATE public.profiles 
SET role = 'admin', display_name = 'System Admin'
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1);

-- Update some users to maintenance role
UPDATE public.profiles 
SET role = 'maintenance', company_name = 'Maintenance Provider'
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE role != 'admin'
  ORDER BY created_at 
  LIMIT 2
);

-- Insert maintenance providers for maintenance users
INSERT INTO public.maintenance_providers (user_id, company_name, contact_email, contact_phone, is_verified, verification_date)
SELECT 
  p.id,
  COALESCE(p.company_name, 'Sample Maintenance Co'),
  COALESCE(p.email, 'maintenance@example.com'),
  '+1-555-0123',
  true,
  now()
FROM public.profiles p
WHERE p.role = 'maintenance'
AND NOT EXISTS (SELECT 1 FROM public.maintenance_providers WHERE user_id = p.id);

-- Create sample maintenance requests (only if none exist)
INSERT INTO public.maintenance_requests (
  cart_id, provider_id, store_id, request_type, description, status, priority,
  scheduled_date, estimated_duration, cost, notes
)
SELECT 
  c.id as cart_id,
  mp.id as provider_id,
  c.store_id,
  'routine' as request_type,
  'Sample maintenance request for cart ' || c.qr_code,
  'pending' as status,
  'medium' as priority,
  now() + interval '7 days' as scheduled_date,
  60 as estimated_duration,
  150.00 as cost,
  '["Sample maintenance note", "Equipment checked"]'::jsonb as notes
FROM public.carts c
CROSS JOIN public.maintenance_providers mp
WHERE NOT EXISTS (SELECT 1 FROM public.maintenance_requests)
ORDER BY c.created_at, mp.created_at
LIMIT 5;

-- Create sample cart analytics (only if none exist)
INSERT INTO public.cart_analytics (
  cart_id, metric_date, usage_hours, distance_traveled, maintenance_cost,
  downtime_minutes, issues_reported, customer_satisfaction
)
SELECT 
  c.id as cart_id,
  CURRENT_DATE - interval '1 day' * generate_series(1, 10) as metric_date,
  5.5 as usage_hours,
  25.0 as distance_traveled,
  50.0 as maintenance_cost,
  15 as downtime_minutes,
  1 as issues_reported,
  4.2 as customer_satisfaction
FROM public.carts c
WHERE NOT EXISTS (SELECT 1 FROM public.cart_analytics)
ORDER BY c.created_at
LIMIT 3;

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;