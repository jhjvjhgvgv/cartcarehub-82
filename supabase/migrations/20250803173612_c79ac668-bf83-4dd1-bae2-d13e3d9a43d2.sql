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