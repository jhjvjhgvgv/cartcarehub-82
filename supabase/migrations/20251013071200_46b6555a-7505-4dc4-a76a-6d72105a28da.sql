-- Fix foreign key references to use profiles instead of auth.users
-- This improves security by avoiding direct references to the auth schema

-- Drop existing foreign keys that reference auth.users
ALTER TABLE public.company_settings 
  DROP CONSTRAINT IF EXISTS company_settings_created_by_fkey;

ALTER TABLE public.maintenance_providers 
  DROP CONSTRAINT IF EXISTS maintenance_providers_user_id_fkey;

ALTER TABLE public.store_provider_connections 
  DROP CONSTRAINT IF EXISTS store_provider_connections_initiated_by_fkey;

ALTER TABLE public.system_logs 
  DROP CONSTRAINT IF EXISTS system_logs_user_id_fkey;

ALTER TABLE public.onboarding_progress 
  DROP CONSTRAINT IF EXISTS onboarding_progress_user_id_fkey;

-- Recreate foreign keys to reference profiles instead
ALTER TABLE public.company_settings 
  ADD CONSTRAINT company_settings_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.maintenance_providers 
  ADD CONSTRAINT maintenance_providers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.store_provider_connections 
  ADD CONSTRAINT store_provider_connections_initiated_by_fkey 
  FOREIGN KEY (initiated_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.system_logs 
  ADD CONSTRAINT system_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.onboarding_progress 
  ADD CONSTRAINT onboarding_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;