-- Fix the JSON syntax error in safe_user_setup function
CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role text;
  profile_exists boolean;
  result jsonb;
BEGIN
  -- Get user role from auth metadata
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users 
  WHERE id = user_id_param;
  
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id_param) INTO profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      id,
      role,
      email,
      is_active,
      created_at,
      updated_at
    )
    SELECT 
      user_id_param,
      COALESCE(user_role, 'store'),
      email,
      true,
      now(),
      now()
    FROM auth.users 
    WHERE id = user_id_param;
  ELSE
    -- Update existing profile with role if not set
    UPDATE public.profiles 
    SET 
      role = COALESCE(role, user_role, 'store'),
      updated_at = now()
    WHERE id = user_id_param;
  END IF;
  
  -- If maintenance user, ensure provider profile exists
  IF COALESCE(user_role, 'store') = 'maintenance' THEN
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
  
  -- Build result JSON properly
  result := jsonb_build_object(
    'success', true,
    'message', 'User setup completed successfully',
    'role', COALESCE(user_role, 'store')
  );
  
  RETURN result;
  
EXCEPTION
  WHEN others THEN
    result := jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$function$;

-- Add constraint to ensure profiles have required fields
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'maintenance', 'store'));

-- Create trigger to ensure profile exists when user signs up
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Call safe_user_setup to ensure profile is created
  PERFORM public.safe_user_setup(NEW.id);
  RETURN NEW;
END;
$function$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_exists();