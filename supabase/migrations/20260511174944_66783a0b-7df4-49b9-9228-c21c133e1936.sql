
-- 1. First-run bootstrap: any signed-in user can claim corp_admin if none exists.
create or replace function public.bootstrap_first_corp_admin(
  p_org_name text default 'Master Corporation'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_uid uuid := auth.uid();
  v_existing_count int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into v_existing_count
  from public.org_memberships
  where role = 'corp_admin';

  if v_existing_count > 0 then
    raise exception 'A corp_admin already exists. Bootstrap is disabled.';
  end if;

  insert into public.organizations (name, type)
  values (coalesce(nullif(trim(p_org_name), ''), 'Master Corporation'), 'corporation')
  returning id into v_org_id;

  insert into public.org_memberships (org_id, user_id, role)
  values (v_org_id, v_uid, 'corp_admin');

  insert into public.audit_log (actor_user_id, action, entity_type, entity_id, details)
  values (v_uid, 'bootstrap_corp_admin', 'organization', v_org_id,
          jsonb_build_object('org_name', p_org_name));

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_first_corp_admin(text) from public;
grant execute on function public.bootstrap_first_corp_admin(text) to authenticated;

-- Helper: is the calling user any corp_admin?
create or replace function public.is_corp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_memberships
    where user_id = auth.uid() and role = 'corp_admin'
  );
$$;

revoke all on function public.is_corp_admin() from public;
grant execute on function public.is_corp_admin() to authenticated;

-- 2. Create organization (corp_admin only)
create or replace function public.admin_create_organization(
  p_name text,
  p_type org_type,
  p_parent_org_id uuid default null,
  p_market text default null,
  p_region text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if not public.is_corp_admin() then
    raise exception 'Only corp_admin can create organizations';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Organization name is required';
  end if;

  insert into public.organizations (name, type, parent_org_id, market, region)
  values (trim(p_name), p_type, p_parent_org_id, p_market, p_region)
  returning id into v_org_id;

  insert into public.audit_log (actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'create_organization', 'organization', v_org_id,
          jsonb_build_object('name', p_name, 'type', p_type));

  return v_org_id;
end;
$$;

revoke all on function public.admin_create_organization(text, org_type, uuid, text, text) from public;
grant execute on function public.admin_create_organization(text, org_type, uuid, text, text) to authenticated;

-- 3. Assign membership
create or replace function public.admin_assign_membership(
  p_user_id uuid,
  p_org_id uuid,
  p_role membership_role
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_corp_admin() then
    raise exception 'Only corp_admin can assign memberships';
  end if;

  insert into public.org_memberships (user_id, org_id, role)
  values (p_user_id, p_org_id, p_role)
  on conflict (user_id, org_id, role) do update set role = excluded.role
  returning id into v_id;

  insert into public.audit_log (actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'assign_membership', 'org_membership', v_id,
          jsonb_build_object('user_id', p_user_id, 'org_id', p_org_id, 'role', p_role));

  return v_id;
end;
$$;

-- ensure unique constraint exists for ON CONFLICT
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'org_memberships_user_org_role_uniq'
  ) then
    alter table public.org_memberships
      add constraint org_memberships_user_org_role_uniq unique (user_id, org_id, role);
  end if;
end$$;

revoke all on function public.admin_assign_membership(uuid, uuid, membership_role) from public;
grant execute on function public.admin_assign_membership(uuid, uuid, membership_role) to authenticated;

-- 4. Remove membership
create or replace function public.admin_remove_membership(p_membership_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_corp_admin() then
    raise exception 'Only corp_admin can remove memberships';
  end if;

  delete from public.org_memberships where id = p_membership_id;

  insert into public.audit_log (actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'remove_membership', 'org_membership', p_membership_id, '{}'::jsonb);

  return true;
end;
$$;

revoke all on function public.admin_remove_membership(uuid) from public;
grant execute on function public.admin_remove_membership(uuid) to authenticated;

-- 5. List users + memberships (corp_admin only)
create or replace function public.admin_list_users_with_memberships()
returns table (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  memberships jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_corp_admin() then
    raise exception 'Only corp_admin can list users';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text,
    coalesce(p.full_name, '')::text as full_name,
    u.created_at,
    u.last_sign_in_at,
    coalesce(
      (select jsonb_agg(jsonb_build_object(
        'membership_id', m.id,
        'org_id', m.org_id,
        'org_name', o.name,
        'org_type', o.type,
        'role', m.role
      ) order by o.name)
       from public.org_memberships m
       join public.organizations o on o.id = m.org_id
       where m.user_id = u.id),
      '[]'::jsonb
    ) as memberships
  from auth.users u
  left join public.user_profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

revoke all on function public.admin_list_users_with_memberships() from public;
grant execute on function public.admin_list_users_with_memberships() to authenticated;
