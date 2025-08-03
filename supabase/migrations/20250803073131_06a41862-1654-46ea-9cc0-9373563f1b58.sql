-- Phase 1: Core Authentication and User Management

-- Fix the existing functions to have proper search_path (addressing linter warnings)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'store'));
  RETURN NEW;
END;
$$;

-- Create enhanced profiles table with proper role management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure role is either 'maintenance' or 'store'
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('maintenance', 'store'));
    END IF;
END $$;

-- Create a function to safely get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create a function to check if user is maintenance provider
CREATE OR REPLACE FUNCTION public.is_maintenance_provider(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role = 'maintenance' FROM public.profiles WHERE id = user_id;
$$;

-- Update profiles RLS policies to be more secure
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Allow users to insert their own profile (for new signups)
CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure maintenance_providers table has proper RLS
ALTER TABLE public.maintenance_providers 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;

-- Update maintenance_providers policies to be more comprehensive
DROP POLICY IF EXISTS "Users can view their own provider profile" ON public.maintenance_providers;
DROP POLICY IF EXISTS "Users can update their own provider profile" ON public.maintenance_providers;

CREATE POLICY "Maintenance users can view own provider profile" 
ON public.maintenance_providers 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  public.get_user_role(auth.uid()) = 'maintenance'
);

CREATE POLICY "Maintenance users can update own provider profile" 
ON public.maintenance_providers 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  public.get_user_role(auth.uid()) = 'maintenance'
);

CREATE POLICY "Maintenance users can create provider profile" 
ON public.maintenance_providers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  public.get_user_role(auth.uid()) = 'maintenance'
);

-- Create a trigger to automatically create maintenance provider profile
CREATE OR REPLACE FUNCTION public.handle_maintenance_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
      COALESCE(NEW.company_name, 'Unnamed Company'),
      COALESCE(NEW.email, ''),
      NEW.contact_phone
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for maintenance provider creation
DROP TRIGGER IF EXISTS on_maintenance_user_created ON public.profiles;
CREATE TRIGGER on_maintenance_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'maintenance')
  EXECUTE FUNCTION public.handle_maintenance_user_signup();

-- Update the trigger to update last_sign_in on profile
CREATE OR REPLACE FUNCTION public.update_user_last_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_sign_in = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger for tracking last sign in
DROP TRIGGER IF EXISTS on_user_sign_in ON auth.users;
CREATE TRIGGER on_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_last_sign_in();