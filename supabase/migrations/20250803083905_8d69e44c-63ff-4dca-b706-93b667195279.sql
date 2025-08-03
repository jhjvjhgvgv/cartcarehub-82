-- Step 1: Add admin role and update existing users
-- First, let's see if we need to extend the role column to support 'admin'
-- Update profiles to include admin role for existing users
UPDATE public.profiles 
SET role = 'admin' 
WHERE email LIKE '%admin%' OR display_name LIKE '%admin%'
LIMIT 1;

-- If no admin users exist, create one from existing users
UPDATE public.profiles 
SET role = 'admin', display_name = 'System Admin'
WHERE id = (SELECT id FROM public.profiles LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin');

-- Step 2: Create sample maintenance providers
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
AND NOT EXISTS (SELECT 1 FROM public.maintenance_providers WHERE user_id = p.id)
LIMIT 3;

-- If no maintenance users exist, update some existing users to maintenance role
UPDATE public.profiles 
SET role = 'maintenance', company_name = 'Maintenance Provider ' || (ROW_NUMBER() OVER())
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE role != 'admin' 
  ORDER BY created_at 
  LIMIT 2
)
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'maintenance');

-- Insert maintenance providers for newly created maintenance users
INSERT INTO public.maintenance_providers (user_id, company_name, contact_email, contact_phone, is_verified, verification_date)
SELECT 
  p.id,
  COALESCE(p.company_name, 'Maintenance Provider ' || (ROW_NUMBER() OVER())),
  COALESCE(p.email, 'maintenance' || (ROW_NUMBER() OVER()) || '@example.com'),
  '+1-555-012' || (ROW_NUMBER() OVER()),
  true,
  now()
FROM public.profiles p
WHERE p.role = 'maintenance'
AND NOT EXISTS (SELECT 1 FROM public.maintenance_providers WHERE user_id = p.id);

-- Step 3: Create sample maintenance requests
INSERT INTO public.maintenance_requests (
  cart_id, provider_id, store_id, request_type, description, status, priority,
  scheduled_date, completed_date, estimated_duration, actual_duration, cost, notes
)
SELECT 
  c.id as cart_id,
  mp.id as provider_id,
  c.store_id,
  (ARRAY['routine', 'repair', 'inspection', 'cleaning'])[1 + (random() * 3)::int] as request_type,
  'Sample maintenance request for cart ' || c.qr_code,
  (ARRAY['pending', 'in_progress', 'completed', 'urgent'])[1 + (random() * 3)::int] as status,
  (ARRAY['low', 'medium', 'high', 'urgent'])[1 + (random() * 3)::int] as priority,
  now() + (random() * 30 || ' days')::interval as scheduled_date,
  CASE WHEN random() > 0.5 THEN now() - (random() * 10 || ' days')::interval ELSE NULL END as completed_date,
  30 + (random() * 120)::int as estimated_duration,
  CASE WHEN random() > 0.5 THEN 30 + (random() * 120)::int ELSE NULL END as actual_duration,
  100 + (random() * 400)::numeric as cost,
  '["Sample maintenance note", "Equipment checked", "All systems operational"]'::jsonb as notes
FROM (SELECT * FROM public.carts ORDER BY random() LIMIT 5) c
CROSS JOIN (SELECT * FROM public.maintenance_providers ORDER BY random() LIMIT 1) mp
WHERE NOT EXISTS (SELECT 1 FROM public.maintenance_requests LIMIT 1);

-- Step 4: Create sample cart analytics
INSERT INTO public.cart_analytics (
  cart_id, metric_date, usage_hours, distance_traveled, maintenance_cost,
  downtime_minutes, issues_reported, customer_satisfaction
)
SELECT 
  c.id as cart_id,
  CURRENT_DATE - (generate_series(1, 30)) as metric_date,
  2 + (random() * 10)::numeric as usage_hours,
  5 + (random() * 50)::numeric as distance_traveled,
  (random() * 100)::numeric as maintenance_cost,
  (random() * 60)::int as downtime_minutes,
  (random() * 3)::int as issues_reported,
  3.5 + (random() * 1.5)::numeric as customer_satisfaction
FROM (SELECT * FROM public.carts LIMIT 3) c
WHERE NOT EXISTS (SELECT 1 FROM public.cart_analytics LIMIT 1);

-- Step 5: Update RLS policies to allow admin access
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

-- Add admin access policies to key tables
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Admins can view all maintenance providers" 
ON public.maintenance_providers 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Admins can view all maintenance requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Admins can view all cart analytics" 
ON public.cart_analytics 
FOR SELECT 
USING (public.is_admin_user());