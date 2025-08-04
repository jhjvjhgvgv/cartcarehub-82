-- Fix role synchronization for users with null roles
-- Update profiles table to sync roles from auth metadata

-- First, create a function to sync user roles from auth metadata
CREATE OR REPLACE FUNCTION public.sync_user_roles_from_metadata()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Update profiles where role is null but user exists in auth.users
  UPDATE public.profiles 
  SET 
    role = COALESCE(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = profiles.id),
      'store'  -- Default to store if no role in metadata
    ),
    updated_at = now()
  WHERE role IS NULL 
    AND EXISTS (SELECT 1 FROM auth.users WHERE id = profiles.id);

  -- Log the number of updated records
  RAISE NOTICE 'Updated % user profiles with roles', (
    SELECT COUNT(*) FROM public.profiles 
    WHERE role IS NOT NULL AND updated_at >= now() - interval '1 minute'
  );
END;
$$;

-- Execute the role sync function
SELECT public.sync_user_roles_from_metadata();

-- Create a trigger to ensure new users always get proper roles
CREATE OR REPLACE FUNCTION public.ensure_user_role_from_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If role is null during insert/update, try to get it from auth metadata
  IF NEW.role IS NULL THEN
    NEW.role := COALESCE(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = NEW.id),
      'store'  -- Default to store role
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire before insert or update on profiles
DROP TRIGGER IF EXISTS ensure_role_from_metadata ON public.profiles;
CREATE TRIGGER ensure_role_from_metadata
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_role_from_metadata();