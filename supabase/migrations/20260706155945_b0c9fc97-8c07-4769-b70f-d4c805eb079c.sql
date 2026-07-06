
-- 1. Table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id) WHERE read_at IS NULL;

-- 2. Grants
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 3. RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages notifications"
  ON public.notifications FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 4. Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. Helper: insert notification for all admins of a store org
CREATE OR REPLACE FUNCTION public.notify_store_admins(
  _store_org_id uuid,
  _type text,
  _title text,
  _body text,
  _link text,
  _metadata jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  SELECT m.user_id, _type, _title, _body, _link, COALESCE(_metadata, '{}'::jsonb)
  FROM public.org_memberships m
  WHERE m.org_id = _store_org_id
    AND m.role IN ('store_admin'::public.membership_role, 'corp_admin'::public.membership_role);
END;
$$;

-- 6. Work order triggers
CREATE OR REPLACE FUNCTION public.notify_work_order_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link text;
BEGIN
  v_link := '/customer/work-orders';

  -- Assignment (INSERT with assignee, or UPDATE where assignee changed)
  IF NEW.assigned_to IS NOT NULL AND (
    TG_OP = 'INSERT' OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to
  ) THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
    VALUES (
      NEW.assigned_to,
      'work_order_assigned',
      'Work order assigned to you',
      COALESCE(NEW.summary, 'A new work order was assigned to you.'),
      '/provider/queue',
      jsonb_build_object('work_order_id', NEW.id, 'status', NEW.status)
    );
  END IF;

  -- Status change (UPDATE only): notify store admins
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.notify_store_admins(
      NEW.store_org_id,
      'work_order_status_change',
      'Work order status: ' || NEW.status::text,
      COALESCE(NEW.summary, 'Work order status updated.'),
      v_link,
      jsonb_build_object('work_order_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_work_order_events ON public.work_orders;
CREATE TRIGGER trg_notify_work_order_events
AFTER INSERT OR UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_work_order_events();

-- 7. Issue trigger: high/critical severity notifies store admins
CREATE OR REPLACE FUNCTION public.notify_issue_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.severity IN ('high'::public.issue_severity, 'critical'::public.issue_severity)
     AND NEW.status = 'open' THEN
    PERFORM public.notify_store_admins(
      NEW.store_org_id,
      'issue_high_severity',
      'New ' || NEW.severity::text || ' issue reported',
      COALESCE(NEW.description, NEW.category, 'A high-severity issue was reported.'),
      '/customer/report-issue',
      jsonb_build_object('issue_id', NEW.id, 'cart_id', NEW.cart_id, 'severity', NEW.severity)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_issue_created ON public.issues;
CREATE TRIGGER trg_notify_issue_created
AFTER INSERT ON public.issues
FOR EACH ROW EXECUTE FUNCTION public.notify_issue_created();
