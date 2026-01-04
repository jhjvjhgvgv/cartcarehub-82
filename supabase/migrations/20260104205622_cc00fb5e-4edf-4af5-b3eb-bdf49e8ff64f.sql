-- Update handle_new_user to create org + membership automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
  new_org_id UUID;
  org_type public.org_type;
  membership_role public.membership_role;
  org_name TEXT;
BEGIN
  -- 1. Insert user profile
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 2. Determine user role from signup metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'store');
  
  -- 3. Map to org type and membership role
  IF user_role IN ('maintenance', 'provider') THEN
    org_type := 'provider';
    membership_role := 'provider_admin';
  ELSIF user_role IN ('corp', 'admin') THEN
    org_type := 'corporation';
    membership_role := 'corp_admin';
  ELSE
    org_type := 'store';
    membership_role := 'store_admin';
  END IF;
  
  -- 4. Build org name from metadata or email
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    split_part(NEW.email, '@', 1) || '''s Organization'
  );
  
  -- 5. Create organization
  INSERT INTO public.organizations (name, type)
  VALUES (org_name, org_type)
  RETURNING id INTO new_org_id;
  
  -- 6. Create membership linking user as admin
  INSERT INTO public.org_memberships (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, membership_role);
  
  RETURN NEW;
END;
$$;

-- Backfill existing users who have profiles but no memberships
DO $$
DECLARE
  rec RECORD;
  new_org_id UUID;
  user_role TEXT;
  org_type_val public.org_type;
  membership_role_val public.membership_role;
  org_name TEXT;
BEGIN
  FOR rec IN 
    SELECT up.id, au.email, au.raw_user_meta_data
    FROM public.user_profiles up
    JOIN auth.users au ON au.id = up.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.org_memberships om WHERE om.user_id = up.id
    )
  LOOP
    -- Determine role from metadata
    user_role := COALESCE(rec.raw_user_meta_data->>'role', 'store');
    
    IF user_role IN ('maintenance', 'provider') THEN
      org_type_val := 'provider';
      membership_role_val := 'provider_admin';
    ELSIF user_role IN ('corp', 'admin') THEN
      org_type_val := 'corporation';
      membership_role_val := 'corp_admin';
    ELSE
      org_type_val := 'store';
      membership_role_val := 'store_admin';
    END IF;
    
    org_name := COALESCE(
      rec.raw_user_meta_data->>'company_name',
      split_part(rec.email, '@', 1) || '''s Organization'
    );
    
    -- Create org
    INSERT INTO public.organizations (name, type)
    VALUES (org_name, org_type_val)
    RETURNING id INTO new_org_id;
    
    -- Create membership
    INSERT INTO public.org_memberships (user_id, org_id, role)
    VALUES (rec.id, new_org_id, membership_role_val);
  END LOOP;
END $$;