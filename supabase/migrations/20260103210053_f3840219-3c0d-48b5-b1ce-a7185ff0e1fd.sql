
-- Phase 1: Drop legacy triggers that reference broken functions
DROP TRIGGER IF EXISTS ensure_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_user_sign_in ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- Phase 2: Update safe_user_setup to use new schema
CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_exists boolean;
  result jsonb;
BEGIN
  -- Check if user_profile already exists
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = user_id_param) INTO profile_exists;
  
  -- Create user_profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.user_profiles (id, full_name, phone, created_at, updated_at)
    VALUES (user_id_param, NULL, NULL, now(), now())
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'User setup completed successfully'
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
$$;

-- Phase 3: Update get_admin_dashboard_stats to use new schema
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  total_users integer;
  total_providers integer;
  total_stores integer;
  total_carts integer;
  active_connections integer;
  pending_connections integer;
BEGIN
  -- Get user counts from user_profiles
  SELECT COUNT(*) INTO total_users FROM public.user_profiles;
  
  -- Get provider organization counts
  SELECT COUNT(*) INTO total_providers 
  FROM public.organizations WHERE type = 'provider'::public.org_type;
  
  -- Get store organization counts
  SELECT COUNT(*) INTO total_stores 
  FROM public.organizations WHERE type = 'store'::public.org_type;
  
  -- Get cart counts
  SELECT COUNT(*) INTO total_carts FROM public.carts;
  
  -- Get connection counts from provider_store_links
  SELECT COUNT(*) INTO active_connections 
  FROM public.provider_store_links WHERE status = 'active';
  
  SELECT COUNT(*) INTO pending_connections 
  FROM public.provider_store_links WHERE status = 'pending';

  result := jsonb_build_object(
    'users', jsonb_build_object(
      'total', total_users
    ),
    'organizations', jsonb_build_object(
      'providers', total_providers,
      'stores', total_stores
    ),
    'carts', jsonb_build_object(
      'total', total_carts
    ),
    'connections', jsonb_build_object(
      'active', active_connections,
      'pending', pending_connections,
      'total', active_connections + pending_connections
    )
  );

  RETURN result;
END;
$$;

-- Phase 4: Update admin_manage_user to use new schema
CREATE OR REPLACE FUNCTION public.admin_manage_user(
  p_user_id uuid, 
  p_action text, 
  p_new_role text DEFAULT NULL, 
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  target_user record;
BEGIN
  -- Get target user info from user_profiles
  SELECT * INTO target_user FROM public.user_profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  CASE p_action
    WHEN 'update_profile' THEN
      UPDATE public.user_profiles 
      SET updated_at = now() 
      WHERE id = p_user_id;
      result := jsonb_build_object('success', true, 'message', 'User profile updated');
      
    ELSE
      result := jsonb_build_object('success', false, 'message', 'Invalid action');
  END CASE;

  RETURN result;
END;
$$;

-- Phase 5: Drop legacy functions that reference old schema
DROP FUNCTION IF EXISTS public.sync_email_verification() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_last_sign_in() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_profile_exists() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_roles_from_metadata() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_role_from_metadata() CASCADE;
DROP FUNCTION IF EXISTS public.handle_maintenance_user_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_maintenance_profile_creation() CASCADE;
DROP FUNCTION IF EXISTS public.user_has_maintenance_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_maintenance_provider(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_admin_permission(text) CASCADE;
