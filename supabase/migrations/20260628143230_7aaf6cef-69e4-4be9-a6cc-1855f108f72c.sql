-- Harden views with security_invoker so they enforce caller's RLS
alter view public.cart_alerts                       set (security_invoker = true);
alter view public.cart_downtime_episodes            set (security_invoker = true);
alter view public.cart_downtime_windows             set (security_invoker = true);
alter view public.cart_issue_counts                 set (security_invoker = true);
alter view public.cart_last_inspection              set (security_invoker = true);
alter view public.cart_last_score                   set (security_invoker = true);
alter view public.cart_mtbf_segments                set (security_invoker = true);
alter view public.cart_predictions                  set (security_invoker = true);
alter view public.carts_with_store                  set (security_invoker = true);
alter view public.corp_kpis_30d                     set (security_invoker = true);
alter view public.corp_preventive_kpis              set (security_invoker = true);
alter view public.issues_with_cart                  set (security_invoker = true);
alter view public.store_current_availability        set (security_invoker = true);
alter view public.store_downtime_cost_30d           set (security_invoker = true);
alter view public.store_inspection_coverage_30d     set (security_invoker = true);
alter view public.store_inspection_coverage_7d      set (security_invoker = true);
alter view public.store_kpis_30d                    set (security_invoker = true);
alter view public.store_mtbf_30d                    set (security_invoker = true);
alter view public.store_mttr_30d                    set (security_invoker = true);
alter view public.store_preventive_kpis             set (security_invoker = true);
alter view public.store_uptime_kpis_30d             set (security_invoker = true);
alter view public.work_orders_with_store            set (security_invoker = true);

-- Extend work_orders to track originating cart / issue
alter table public.work_orders
  add column if not exists cart_id uuid references public.carts(id) on delete set null,
  add column if not exists source_issue_id uuid references public.issues(id) on delete set null;

create index if not exists idx_work_orders_cart_id        on public.work_orders(cart_id);
create index if not exists idx_work_orders_source_issue   on public.work_orders(source_issue_id);
create index if not exists idx_work_orders_status         on public.work_orders(status);

-- Work order state-machine RPC
create or replace function public.transition_work_order(
  p_work_order_id   uuid,
  p_to_status       public.work_order_status,
  p_notes           text          default null,
  p_scheduled_at    timestamptz   default null,
  p_provider_org_id uuid          default null,
  p_assigned_to     uuid          default null
)
returns public.work_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo      public.work_orders;
  v_from    public.work_order_status;
  v_allowed boolean := false;
begin
  select * into v_wo from public.work_orders where id = p_work_order_id for update;
  if not found then
    raise exception 'work_order_not_found';
  end if;
  v_from := v_wo.status;

  v_allowed := case
    when v_from = 'new'         and p_to_status in ('scheduled','canceled')         then true
    when v_from = 'scheduled'   and p_to_status in ('in_progress','canceled','new') then true
    when v_from = 'in_progress' and p_to_status in ('completed','scheduled')        then true
    when v_from = 'canceled'    and p_to_status = 'new'                              then true
    when v_from = p_to_status                                                        then true
    else false
  end;

  if not v_allowed then
    raise exception 'invalid_transition_%_to_%', v_from, p_to_status;
  end if;

  update public.work_orders
     set status          = p_to_status,
         notes           = coalesce(p_notes, notes),
         scheduled_at    = coalesce(p_scheduled_at, scheduled_at),
         provider_org_id = coalesce(p_provider_org_id, provider_org_id),
         assigned_to     = coalesce(p_assigned_to, assigned_to),
         updated_at      = now()
   where id = p_work_order_id
   returning * into v_wo;

  if p_to_status = 'completed' and v_wo.source_issue_id is not null then
    update public.issues
       set status      = 'resolved',
           resolved_at = now(),
           resolved_by = auth.uid()
     where id = v_wo.source_issue_id
       and status <> 'resolved';
  end if;

  return v_wo;
end;
$$;

grant execute on function public.transition_work_order(uuid, public.work_order_status, text, timestamptz, uuid, uuid) to authenticated;

-- Auto-create a work_order when a high/critical issue is reported
create or replace function public.create_work_order_from_issue()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_summary text;
begin
  if NEW.severity in ('high','critical') and NEW.status = 'open' then
    if exists (select 1 from public.work_orders where source_issue_id = NEW.id) then
      return NEW;
    end if;
    v_summary := coalesce(NEW.category, 'Issue') || ' (' || NEW.severity::text || ')';
    insert into public.work_orders (store_org_id, cart_id, source_issue_id, summary, notes, status)
    values (NEW.store_org_id, NEW.cart_id, NEW.id, v_summary, NEW.description, 'new');
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_issue_autocreate_work_order on public.issues;
create trigger trg_issue_autocreate_work_order
  after insert on public.issues
  for each row execute function public.create_work_order_from_issue();
