-- Fix the safe_user_setup function to properly handle duplicate maintenance providers
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
  -- Wrap in separate exception block to handle duplicates gracefully
  IF COALESCE(user_role, 'store') = 'maintenance' THEN
    BEGIN
      -- Check if maintenance provider already exists
      IF NOT EXISTS (SELECT 1 FROM public.maintenance_providers WHERE user_id = user_id_param) THEN
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
        WHERE id = user_id_param;
      END IF;
    EXCEPTION
      WHEN unique_violation THEN
        -- Maintenance provider already exists, this is fine
        NULL;
    END;
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