
-- 1) Add search_path to 3 SQL helper functions
ALTER FUNCTION public.current_user_can_access_store_as_provider(uuid) SET search_path = public;
ALTER FUNCTION public.provider_has_store_access(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.user_can_access_store(uuid) SET search_path = public;

-- 2) Remove hard-coded anon JWT: drop the trigger + function.
--    In-app notifications for assignments are already handled by notify_work_order_events.
DROP TRIGGER IF EXISTS trg_notify_work_order_assigned ON public.work_orders;
DROP TRIGGER IF EXISTS notify_work_order_assigned_trigger ON public.work_orders;
DROP FUNCTION IF EXISTS public.notify_work_order_assigned() CASCADE;

-- 3) Drop legacy function that reads deprecated user_roles table
DROP FUNCTION IF EXISTS public.get_user_primary_role(uuid) CASCADE;

-- 4) Revoke anon access on every table/view in public schema.
--    RLS + policies already scope to auth.uid(); anon has no legitimate read path.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','v','m','f','p')
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', r.relname);
  END LOOP;
END $$;

-- 5) Lock down SECURITY DEFINER helpers: revoke from PUBLIC/anon,
--    grant EXECUTE only to authenticated (or service_role where appropriate).
DO $$
DECLARE r record;
DECLARE sig text;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef = true
  LOOP
    sig := format('public.%I(%s)', r.proname, r.args);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
  END LOOP;
END $$;

-- 6) Extra lockdown: master-admin auth helpers should be callable only by service_role
--    (edge function admin-auth uses service role key).
REVOKE EXECUTE ON FUNCTION public.authenticate_admin(text, text, inet, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_admin_session(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.logout_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_admin_activity(text, text, text, jsonb, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_admin(text, text, inet, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.logout_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_activity(text, text, text, jsonb, boolean, text) TO service_role;

-- 7) bootstrap_first_corp_admin: keep authenticated (needed for first-time setup) but no anon
--    (already covered by loop above; explicit for clarity)
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_corp_admin(text) FROM anon;
