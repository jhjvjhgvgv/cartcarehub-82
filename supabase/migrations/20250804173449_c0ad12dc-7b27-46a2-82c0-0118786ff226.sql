-- Fix RLS policies for maintenance_providers table
-- Drop existing restrictive policy and create more permissive ones for profile creation

DROP POLICY IF EXISTS "Maintenance users can create provider profile" ON public.maintenance_providers;

-- Allow maintenance users to insert their own provider profile
CREATE POLICY "Maintenance users can create provider profile" 
ON public.maintenance_providers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  (
    get_user_role(auth.uid()) = 'maintenance' OR
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'maintenance'
  )
);

-- Fix the trigger to be more defensive
CREATE OR REPLACE FUNCTION public.handle_maintenance_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only create maintenance provider profile if user role is maintenance and profile doesn't exist
  IF (NEW.role = 'maintenance' OR 
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = NEW.id) = 'maintenance') 
     AND NOT public.user_has_maintenance_profile(NEW.id) THEN
    
    -- Try to insert, but don't fail if it already exists
    INSERT INTO public.maintenance_providers (
      user_id, 
      company_name, 
      contact_email,
      contact_phone
    ) VALUES (
      NEW.id,
      COALESCE(NEW.company_name, 'Company Name Required'),
      COALESCE(NEW.email, ''),
      NEW.contact_phone
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't block profile creation
    RAISE WARNING 'Failed to create maintenance provider profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Add unique constraint to prevent duplicates
ALTER TABLE public.maintenance_providers 
ADD CONSTRAINT maintenance_providers_user_id_unique UNIQUE (user_id);

-- Create a function to safely sync user roles and create profiles
CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role text;
  result jsonb := '{"success": false, "message": "Unknown error"}'::jsonb;
BEGIN
  -- Get user role from auth metadata
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users 
  WHERE id = user_id_param;
  
  -- Update profile with role if not set
  UPDATE public.profiles 
  SET 
    role = COALESCE(role, user_role, 'store'),
    updated_at = now()
  WHERE id = user_id_param;
  
  -- If maintenance user, ensure provider profile exists
  IF user_role = 'maintenance' THEN
    INSERT INTO public.maintenance_providers (
      user_id, 
      company_name, 
      contact_email,
      contact_phone
    ) 
    SELECT 
      user_id_param,
      'Company Name Required',
      COALESCE(email, ''),
      contact_phone
    FROM public.profiles 
    WHERE id = user_id_param
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  result := '{"success": true, "message": "User setup completed", "role": "' || COALESCE(user_role, 'store') || '"}'::jsonb;
  RETURN result;
  
EXCEPTION
  WHEN others THEN
    result := ('{"success": false, "message": "' || SQLERRM || '"}')::jsonb;
    RETURN result;
END;
$function$;