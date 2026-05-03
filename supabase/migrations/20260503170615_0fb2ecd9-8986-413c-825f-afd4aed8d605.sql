-- 1. Unique qr_token (skip if a duplicate already exists; surface to user)
create unique index if not exists carts_qr_token_unique on public.carts (qr_token);

-- 2. Format constraint: reject UUIDs and enforce canonical shape
alter table public.carts
  drop constraint if exists carts_qr_token_format_chk;

alter table public.carts
  add constraint carts_qr_token_format_chk
  check (
    qr_token ~ '^[A-Z0-9-]{6,}$'
    and qr_token !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ) not valid;
-- 'not valid' so existing rows are not retroactively rejected; new/updated rows are checked.

-- 3. Asset tag normalization trigger
create or replace function public.normalize_cart_asset_tag()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.asset_tag is null then
    return new;
  end if;

  new.asset_tag := upper(
    btrim(
      regexp_replace(
        regexp_replace(new.asset_tag, '[\s\u2010-\u2015\u2212]+', '-', 'g'),
        '-+', '-', 'g'
      ),
      '-'
    )
  );

  if length(new.asset_tag) = 0 then
    new.asset_tag := null;
  end if;

  return new;
end
$$;

drop trigger if exists trg_normalize_cart_asset_tag on public.carts;
create trigger trg_normalize_cart_asset_tag
before insert or update of asset_tag on public.carts
for each row execute function public.normalize_cart_asset_tag();