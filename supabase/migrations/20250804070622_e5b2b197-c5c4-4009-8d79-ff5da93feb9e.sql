-- Create the missing user_has_maintenance_profile function
CREATE OR REPLACE FUNCTION public.user_has_maintenance_profile(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.maintenance_providers 
    WHERE user_id = $1
  );
$function$;

-- Update the handle_maintenance_profile_creation trigger function to use the new function
CREATE OR REPLACE FUNCTION public.handle_maintenance_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only create maintenance provider profile if user role is maintenance and profile doesn't exist
  IF NEW.role = 'maintenance' AND NOT public.user_has_maintenance_profile(NEW.id) THEN
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

-- Create triggers to ensure profile creation happens properly
DROP TRIGGER IF EXISTS on_profile_insert_maintenance ON public.profiles;
CREATE TRIGGER on_profile_insert_maintenance
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_maintenance_profile_creation();

DROP TRIGGER IF EXISTS on_profile_update_maintenance ON public.profiles;
CREATE TRIGGER on_profile_update_maintenance
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.handle_maintenance_profile_creation();