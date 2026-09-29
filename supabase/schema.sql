-- عداد مجتمع زاد المسلم — شغّل الملف مرة واحدة داخل Supabase SQL Editor.
-- لا يخزن أسماء أو بريدًا أو موقعًا أو سجل عبادة؛ فقط UUID عشوائي محفوظ محليًا في الجهاز.

create table if not exists public.zad_app_devices (
  device_id uuid primary key,
  first_seen_at timestamptz not null default now()
);

alter table public.zad_app_devices enable row level security;

revoke all on table public.zad_app_devices from anon, authenticated;

create or replace function public.register_zad_device(p_device_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  device_count bigint;
begin
  insert into public.zad_app_devices(device_id)
  values (p_device_id)
  on conflict (device_id) do nothing;

  select count(*) into device_count from public.zad_app_devices;
  return device_count;
end;
$$;

revoke all on function public.register_zad_device(uuid) from public;
grant execute on function public.register_zad_device(uuid) to anon, authenticated;
