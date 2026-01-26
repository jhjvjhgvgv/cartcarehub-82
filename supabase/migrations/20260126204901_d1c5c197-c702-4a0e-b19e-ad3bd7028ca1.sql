-- Create trigger to ensure user_profiles and user_onboarding records exist
-- This supplements the handle_new_user trigger with a more defensive approach

CREATE OR REPLACE FUNCTION public.ensure_user_records()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure user_profiles record exists
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    updated_at = now();
  
  -- Ensure user_onboarding record exists
  INSERT INTO public.user_onboarding (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups (if not exists)
-- Note: We check if trigger exists to avoid errors
DO $$
BEGIN
  -- Drop existing trigger if it exists with different definition
  DROP TRIGGER IF EXISTS on_auth_user_created_ensure_records ON auth.users;
  
  -- Create the trigger
  CREATE TRIGGER on_auth_user_created_ensure_records
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_records();
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Trigger creation skipped or modified: %', SQLERRM;
END;
$$;