-- Fix Issue #1: Modify handle_new_user trigger to defer org creation
-- The trigger now ONLY creates user_profiles and user_onboarding
-- Organization creation is deferred to safe_user_setup RPC which runs after role is known

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Insert user profile (this is safe to do immediately)
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 2. Create onboarding record (safe to do immediately)
  INSERT INTO public.user_onboarding (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- NOTE: Organization and membership creation is now DEFERRED
  -- It happens in safe_user_setup() RPC which is called after:
  -- - Email signup: role is in metadata immediately
  -- - OAuth signup: role is applied from localStorage, then safe_user_setup is called
  -- This ensures the correct org type is created based on actual user role
  
  RETURN NEW;
END;
$function$;

-- Fix Issue #4: Enable RLS on store_daily_rollups table
ALTER TABLE public.store_daily_rollups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for store_daily_rollups
CREATE POLICY "Users can view their store rollups" ON public.store_daily_rollups
  FOR SELECT
  USING (public.user_can_access_store(store_org_id));

CREATE POLICY "System can insert rollups" ON public.store_daily_rollups
  FOR INSERT
  WITH CHECK (public.user_can_access_store(store_org_id));

CREATE POLICY "System can update rollups" ON public.store_daily_rollups
  FOR UPDATE
  USING (public.user_can_access_store(store_org_id));

-- Fix Issue #28: Add search_path to functions that are missing it
CREATE OR REPLACE FUNCTION public.calculate_line_item_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.total_price = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.rollup_store_day(p_day date)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  insert into public.store_daily_rollups(store_org_id, day, total_carts, inspections_count, open_issues, downtime_minutes)
  select
    o.id as store_org_id,
    p_day as day,
    (select count(*) from public.carts c where c.store_org_id = o.id)::int as total_carts,
    (select count(*) from public.inspections i where i.store_org_id = o.id and i.created_at >= p_day and i.created_at < p_day + 1)::int as inspections_count,
    (select count(*) from public.issues iss where iss.store_org_id = o.id and iss.status in ('open','in_progress'))::int as open_issues,
    coalesce((
      select sum(dw.downtime_minutes)
      from public.cart_downtime_windows dw
      where dw.store_org_id = o.id
        and dw.down_start >= p_day and dw.down_start < p_day + 1
    ),0) as downtime_minutes
  from public.organizations o
  where o.type = 'store'::public.org_type
  on conflict (store_org_id, day) do update
  set total_carts = excluded.total_carts,
      inspections_count = excluded.inspections_count,
      open_issues = excluded.open_issues,
      downtime_minutes = excluded.downtime_minutes;
end $function$;