-- Fix Phase 1.2: Complete Role Assignment System (Fixed)
-- This migration fixes the critical role assignment issues

-- Step 1: Fix the handle_maintenance_user_signup function to handle duplicates
CREATE OR REPLACE FUNCTION public.handle_maintenance_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only create maintenance provider profile if user role is maintenance
  IF NEW.role = 'maintenance' THEN
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
    ON CONFLICT (user_id) DO NOTHING;  -- Handle duplicates gracefully
  END IF;
  RETURN NEW;
END;
$function$;

-- Step 2: Drop ALL existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS ensure_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS ensure_role_from_metadata ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
DROP TRIGGER IF EXISTS on_maintenance_profile_update ON public.profiles;

-- Step 3: Create trigger to handle new user signups
-- This ensures profiles are created with proper roles when users sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create trigger to ensure profile exists on any auth.users update
CREATE TRIGGER ensure_profile_on_signup
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_exists();

-- Step 5: Create trigger to ensure role is set from metadata on profile insert/update
CREATE TRIGGER ensure_role_from_metadata
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_role_from_metadata();

-- Step 6: Create trigger to handle maintenance profile creation when role changes
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_maintenance_profile_creation();

-- Step 7: Backfill existing users - sync roles from auth.users metadata to profiles
-- Use a more careful approach to avoid trigger conflicts
DO $$
DECLARE
  user_record RECORD;
  role_from_metadata text;
  updated_count integer := 0;
BEGIN
  -- First, disable the problematic trigger temporarily
  ALTER TABLE public.profiles DISABLE TRIGGER on_profile_role_change;
  
  -- Loop through all users and sync their roles
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, p.role as current_role
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
  LOOP
    -- Get role from metadata, default to 'store' if not set
    role_from_metadata := COALESCE(
      user_record.raw_user_meta_data->>'role',
      'store'
    );
    
    -- Update or insert profile with correct role
    INSERT INTO public.profiles (
      id,
      email,
      role,
      display_name,
      email_verified,
      onboarding_completed,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      user_record.email,
      role_from_metadata,
      COALESCE(user_record.raw_user_meta_data->>'display_name', user_record.email),
      true,  -- Mark existing users as verified
      true,  -- Mark existing users as onboarded
      true,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = COALESCE(public.profiles.role, EXCLUDED.role),
      email = COALESCE(public.profiles.email, EXCLUDED.email),
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
      updated_at = now();
    
    updated_count := updated_count + 1;
  END LOOP;
  
  -- Re-enable the trigger
  ALTER TABLE public.profiles ENABLE TRIGGER on_profile_role_change;
  
  RAISE NOTICE 'Backfilled % user profiles with roles', updated_count;
END $$;

-- Step 8: Ensure all maintenance users have maintenance_providers entries
INSERT INTO public.maintenance_providers (
  user_id,
  company_name,
  contact_email,
  contact_phone,
  is_verified,
  created_at,
  updated_at
)
SELECT 
  p.id,
  COALESCE(p.company_name, 'Company Name Required'),
  COALESCE(p.email, ''),
  p.contact_phone,
  false,  -- New providers need verification
  now(),
  now()
FROM public.profiles p
WHERE p.role = 'maintenance'
  AND NOT EXISTS (
    SELECT 1 FROM public.maintenance_providers mp 
    WHERE mp.user_id = p.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Step 9: Log the migration
INSERT INTO public.system_logs (
  action,
  resource_type,
  details
) VALUES (
  'role_assignment_fix_migration',
  'system',
  jsonb_build_object(
    'migration', 'phase_1_2_role_assignment_fixed',
    'timestamp', now(),
    'description', 'Fixed role assignment system and backfilled existing users'
  )
);