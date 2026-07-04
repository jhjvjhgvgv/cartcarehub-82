
-- Tighten safe_user_setup: only self or corp_admin
CREATE OR REPLACE FUNCTION public.safe_user_setup(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_org_id UUID;
  user_email TEXT;
  user_meta JSONB;
  org_name TEXT;
  v_org_type org_type;
  mem_role membership_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() <> user_id_param AND NOT public.is_corp_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT email, raw_user_meta_data INTO user_email, user_meta
  FROM auth.users WHERE id = user_id_param;

  INSERT INTO user_profiles (id) VALUES (user_id_param)
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM org_memberships WHERE user_id = user_id_param) THEN
    v_org_type := CASE
      WHEN user_meta->>'role' = 'maintenance' THEN 'provider'::org_type
      ELSE 'store'::org_type
    END;
    mem_role := CASE
      WHEN v_org_type = 'provider' THEN 'provider_admin'::membership_role
      ELSE 'store_admin'::membership_role
    END;
    org_name := COALESCE(
      user_meta->>'company_name',
      SPLIT_PART(user_email, '@', 1) || '''s Organization'
    );
    INSERT INTO organizations (name, type) VALUES (org_name, v_org_type)
    RETURNING id INTO new_org_id;
    INSERT INTO org_memberships (user_id, org_id, role)
    VALUES (user_id_param, new_org_id, mem_role);
    RETURN json_build_object('success', true, 'message', 'User setup with new org completed', 'org_id', new_org_id);
  END IF;
  RETURN json_build_object('success', true, 'message', 'User already has membership');
END;
$function$;

-- Convenience wrapper the client can call without knowing its own id
CREATE OR REPLACE FUNCTION public.ensure_my_setup()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.safe_user_setup(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_setup() TO authenticated;
