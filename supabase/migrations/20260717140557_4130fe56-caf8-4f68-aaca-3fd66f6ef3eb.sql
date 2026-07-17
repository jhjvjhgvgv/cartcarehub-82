
CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.waitlist_signups TO anon, authenticated;
GRANT SELECT ON public.waitlist_signups TO authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can join waitlist" ON public.waitlist_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "corp admins read waitlist" ON public.waitlist_signups
  FOR SELECT TO authenticated USING (public.is_corp_admin());

CREATE TABLE public.investor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  firm text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.investor_leads TO anon, authenticated;
GRANT SELECT ON public.investor_leads TO authenticated;
GRANT ALL ON public.investor_leads TO service_role;
ALTER TABLE public.investor_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit investor lead" ON public.investor_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "corp admins read investor leads" ON public.investor_leads
  FOR SELECT TO authenticated USING (public.is_corp_admin());
