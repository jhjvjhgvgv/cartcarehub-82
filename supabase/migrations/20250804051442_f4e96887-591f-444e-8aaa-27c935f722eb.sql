-- Create security definer functions for better RLS policy handling
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create function to check if user has maintenance provider profile
CREATE OR REPLACE FUNCTION public.user_has_maintenance_profile(user_id uuid)
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.maintenance_providers 
    WHERE user_id = $1
  );
$$;

-- Enhance the handle_maintenance_user_signup trigger to work with new user creation
DROP TRIGGER IF EXISTS on_maintenance_profile_insert ON public.profiles;
CREATE OR REPLACE FUNCTION public.handle_maintenance_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only create maintenance provider profile if user role is maintenance and profile doesn't exist
  IF NEW.role = 'maintenance' AND NOT user_has_maintenance_profile(NEW.id) THEN
    INSERT INTO public.maintenance_providers (
      user_id, 
      company_name, 
      contact_email,
      contact_phone
    ) VALUES (
      NEW.id,
      COALESCE(NEW.company_name, 'Unnamed Company'),
      COALESCE(NEW.email, ''),
      NEW.contact_phone
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't block profile creation
    RAISE WARNING 'Failed to create maintenance provider profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger to automatically create maintenance provider profiles
CREATE TRIGGER on_maintenance_profile_insert
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'maintenance')
  EXECUTE FUNCTION public.handle_maintenance_profile_creation();

-- Update RLS policies to use security definer functions
DROP POLICY IF EXISTS "Maintenance providers can manage schedules" ON public.maintenance_schedules;
CREATE POLICY "Maintenance providers can manage schedules" 
ON public.maintenance_schedules 
FOR ALL 
USING (
  get_current_user_role() = 'maintenance' AND 
  provider_id IN (
    SELECT id FROM maintenance_providers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view maintenance schedules for their carts" ON public.maintenance_schedules;
CREATE POLICY "Users can view maintenance schedules for their carts" 
ON public.maintenance_schedules 
FOR SELECT 
USING (
  (get_current_user_role() = 'maintenance' AND 
   provider_id IN (SELECT id FROM maintenance_providers WHERE user_id = auth.uid())) OR
  get_current_user_role() = 'store'
);

-- Update maintenance requests policies
DROP POLICY IF EXISTS "Maintenance providers can update their requests" ON public.maintenance_requests;
CREATE POLICY "Maintenance providers can update their requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (
  get_current_user_role() = 'maintenance' AND 
  provider_id IN (
    SELECT id FROM maintenance_providers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view maintenance requests for their carts" ON public.maintenance_requests;
CREATE POLICY "Users can view maintenance requests for their carts" 
ON public.maintenance_requests 
FOR SELECT 
USING (
  (get_current_user_role() = 'maintenance' AND 
   provider_id IN (SELECT id FROM maintenance_providers WHERE user_id = auth.uid())) OR
  get_current_user_role() = 'store'
);

DROP POLICY IF EXISTS "Store users can create maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Store users can create maintenance requests" 
ON public.maintenance_requests 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'store');