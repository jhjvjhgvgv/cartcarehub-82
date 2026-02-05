CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id UUID;
  user_email TEXT;
  user_meta JSONB;
  org_name TEXT;
  v_org_type org_type;
  mem_role membership_role;
BEGIN
  -- Get user email and metadata
  SELECT email, raw_user_meta_data INTO user_email, user_meta
  FROM auth.users WHERE id = user_id_param;
  
  -- Ensure profile exists
  INSERT INTO user_profiles (id)
  VALUES (user_id_param)
  ON CONFLICT (id) DO NOTHING;
  
  -- Check if user has any memberships
  IF NOT EXISTS (SELECT 1 FROM org_memberships WHERE user_id = user_id_param) THEN
    -- Determine org type from metadata (check 'role' key, not 'user_role')
    v_org_type := CASE 
      WHEN user_meta->>'role' = 'maintenance' THEN 'provider'::org_type
      ELSE 'store'::org_type
    END;
    
    -- Determine membership role
    mem_role := CASE 
      WHEN v_org_type = 'provider' THEN 'provider_admin'::membership_role
      ELSE 'store_admin'::membership_role
    END;
    
    -- Generate org name
    org_name := COALESCE(
      user_meta->>'company_name',
      SPLIT_PART(user_email, '@', 1) || '''s Organization'
    );
    
    -- Create default org
    INSERT INTO organizations (name, type)
    VALUES (org_name, v_org_type)
    RETURNING id INTO new_org_id;
    
    -- Create membership
    INSERT INTO org_memberships (user_id, org_id, role)
    VALUES (user_id_param, new_org_id, mem_role);
    
    RETURN json_build_object('success', true, 'message', 'User setup with new org completed', 'org_id', new_org_id);
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'User already has membership');
END;
$function$;