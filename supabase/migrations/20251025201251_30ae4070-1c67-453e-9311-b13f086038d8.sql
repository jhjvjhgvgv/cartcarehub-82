-- Phase 1.1: User Onboarding Flow - Database Schema

-- Add email verification and onboarding tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for email verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- Update existing users to mark as verified and onboarded (grandfather clause)
UPDATE public.profiles 
SET 
  email_verified = TRUE, 
  email_verified_at = COALESCE(created_at, now()),
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(created_at, now())
WHERE (display_name IS NOT NULL OR company_name IS NOT NULL) 
  AND email_verified IS NOT TRUE;

-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, step_number)
);

-- Enable RLS on onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'onboarding_progress' 
    AND policyname = 'Users can view own onboarding progress'
  ) THEN
    CREATE POLICY "Users can view own onboarding progress"
      ON public.onboarding_progress FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'onboarding_progress' 
    AND policyname = 'Users can insert own onboarding progress'
  ) THEN
    CREATE POLICY "Users can insert own onboarding progress"
      ON public.onboarding_progress FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'onboarding_progress' 
    AND policyname = 'Users can update own onboarding progress'
  ) THEN
    CREATE POLICY "Users can update own onboarding progress"
      ON public.onboarding_progress FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Function to sync email verification from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When auth.users email is confirmed, update profiles
  IF NEW.email_confirmed_at IS NOT NULL AND 
     (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    
    UPDATE public.profiles
    SET 
      email_verified = TRUE,
      email_verified_at = NEW.email_confirmed_at,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync verification status
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_verification();

-- Add trigger to update onboarding_progress updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON public.onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_onboarding();