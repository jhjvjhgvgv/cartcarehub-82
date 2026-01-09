-- Create user_onboarding table to track onboarding progress
CREATE TABLE public.user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  profile_completed boolean DEFAULT false,
  location_completed boolean DEFAULT false,
  provider_connected boolean DEFAULT false,
  verification_submitted boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  skipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create provider_verifications table for maintenance provider verification
CREATE TABLE public.provider_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  license_number text,
  insurance_provider text,
  service_description text,
  service_areas text[],
  documents jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding"
  ON public.user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
  ON public.user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
  ON public.user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for provider_verifications
CREATE POLICY "Users can view their own verifications"
  ON public.provider_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
  ON public.provider_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verifications"
  ON public.provider_verifications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admin policy for provider_verifications (admins can view and update all)
CREATE POLICY "Admins can view all verifications"
  ON public.provider_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
      AND m.role IN ('corp_admin'::public.membership_role)
    )
  );

CREATE POLICY "Admins can update all verifications"
  ON public.provider_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
      AND m.role IN ('corp_admin'::public.membership_role)
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER set_user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_provider_verifications_updated_at
  BEFORE UPDATE ON public.provider_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to initialize onboarding for new users
CREATE OR REPLACE FUNCTION public.initialize_user_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create onboarding record on user creation
CREATE TRIGGER on_auth_user_created_init_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_onboarding();

-- Function to update email_verified when user confirms email
CREATE OR REPLACE FUNCTION public.update_onboarding_email_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.user_onboarding
    SET email_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update onboarding when email is verified
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_email_verified();