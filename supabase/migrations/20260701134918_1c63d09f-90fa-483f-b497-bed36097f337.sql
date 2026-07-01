
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_work_order_assigned()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_anon text;
begin
  if NEW.assigned_to is null then
    return NEW;
  end if;

  if TG_OP = 'UPDATE' and OLD.assigned_to is not distinct from NEW.assigned_to then
    return NEW;
  end if;

  v_url := 'https://qxutldpiaxfdicdsiomt.supabase.co/functions/v1/notify-work-order-assigned';
  v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXRsZHBpYXhmZGljZHNpb210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NjU5MTAsImV4cCI6MjA1MzI0MTkxMH0.GqZjfLjSo6CQfJc-ynvDGD4V6j2lFyBDHBXac0F92bw';

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body := jsonb_build_object(
      'work_order_id', NEW.id,
      'assigned_to', NEW.assigned_to,
      'status', NEW.status,
      'summary', NEW.summary,
      'store_org_id', NEW.store_org_id
    )
  );

  return NEW;
exception when others then
  -- never block the write on notification failure
  return NEW;
end;
$$;

drop trigger if exists trg_notify_work_order_assigned on public.work_orders;

create trigger trg_notify_work_order_assigned
after insert or update of assigned_to on public.work_orders
for each row
execute function public.notify_work_order_assigned();
