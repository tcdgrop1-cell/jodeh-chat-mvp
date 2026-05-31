-- Jodeh Chat MVP schema
-- Assumes Supabase Auth is enabled.

create extension if not exists pgcrypto;

create type public.app_language as enum ('ar', 'en');
create type public.chat_kind as enum ('dm', 'group', 'channel');
create type public.hierarchy_scope as enum ('country', 'governorate', 'district', 'village', 'clan', 'title');
create type public.gender_type as enum ('male', 'female');
create type public.attachment_kind as enum ('image', 'audio', 'file');
create type public.report_reason as enum ('spam', 'abuse', 'impersonation', 'privacy', 'other');

create or replace function public.normalize_hierarchy_id(raw text)
returns text
language plpgsql
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(raw, ''), '\D', '', 'g');
  if length(digits) <> 19 then
    raise exception 'hierarchy id must contain exactly 19 digits';
  end if;
  return digits;
end;
$$;

create or replace function public.build_hierarchy_id(
  country_code text,
  governorate_code text,
  district_code text,
  village_code text,
  clan_code text,
  title_code text,
  grandfather_code text,
  father_code text,
  name_code text
)
returns text
language sql
immutable
as $$
  select lpad(country_code, 3, '0') ||
         lpad(governorate_code, 2, '0') ||
         lpad(district_code, 2, '0') ||
         lpad(village_code, 2, '0') ||
         lpad(clan_code, 2, '0') ||
         lpad(title_code, 2, '0') ||
         lpad(grandfather_code, 2, '0') ||
         lpad(father_code, 2, '0') ||
         lpad(name_code, 2, '0');
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hierarchy_id text not null unique,
  language public.app_language not null default 'ar',
  phone_number text,
  quad_name_ar text,
  quad_name_en text,
  surname_ar text,
  surname_en text,
  age_or_dob text,
  gender public.gender_type,
  education_level text,
  recovery_phone text,
  recovery_email text,
  about_ar text,
  about_en text,
  is_private boolean not null default false,
  country_code text not null,
  governorate_code text not null,
  district_code text not null,
  village_code text not null,
  clan_code text not null,
  title_code text not null,
  grandfather_code text not null,
  father_code text not null,
  name_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hierarchy_id_format check (length(hierarchy_id) = 19),
  constraint hierarchy_parts_match check (
    hierarchy_id = public.build_hierarchy_id(country_code, governorate_code, district_code, village_code, clan_code, title_code, grandfather_code, father_code, name_code)
  )
);

create table if not exists public.account_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  show_last_seen boolean not null default true,
  show_online_status boolean not null default true,
  allow_calls boolean not null default true,
  recovery_phone text,
  recovery_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_entities (
  id uuid primary key default gen_random_uuid(),
  scope public.hierarchy_scope not null,
  hierarchy_code text not null,
  parent_id uuid references public.group_entities(id) on delete cascade,
  display_name_ar text not null,
  display_name_en text not null,
  is_channel boolean not null default false,
  created_at timestamptz not null default now(),
  unique(scope, hierarchy_code)
);

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_entities(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(group_id, profile_id)
);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason public.report_reason not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind public.chat_kind not null,
  title_ar text,
  title_en text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  encrypted_body text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key(message_id, profile_id)
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  kind public.attachment_kind not null,
  file_url text not null,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);

create or replace function public.create_profile_and_memberships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  normalized := public.normalize_hierarchy_id(new.raw_user_meta_data->>'hierarchy_id');

  insert into public.profiles (
    id, hierarchy_id, language,
    phone_number, quad_name_ar, quad_name_en, surname_ar, surname_en,
    age_or_dob, gender, education_level,
    recovery_phone, recovery_email, about_ar, about_en, is_private,
    country_code, governorate_code, district_code, village_code, clan_code, title_code, grandfather_code, father_code, name_code
  ) values (
    new.id,
    normalized,
    coalesce((new.raw_user_meta_data->>'language')::public.app_language, 'ar'),
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'quad_name_ar',
    new.raw_user_meta_data->>'quad_name_en',
    new.raw_user_meta_data->>'surname_ar',
    new.raw_user_meta_data->>'surname_en',
    new.raw_user_meta_data->>'age_or_dob',
    nullif(lower(new.raw_user_meta_data->>'gender'), '')::public.gender_type,
    new.raw_user_meta_data->>'education_level',
    new.raw_user_meta_data->>'recovery_phone',
    new.raw_user_meta_data->>'recovery_email',
    new.raw_user_meta_data->>'about_ar',
    new.raw_user_meta_data->>'about_en',
    coalesce((new.raw_user_meta_data->>'is_private')::boolean, false),
    substring(normalized from 1 for 3),
    substring(normalized from 4 for 2),
    substring(normalized from 6 for 2),
    substring(normalized from 8 for 2),
    substring(normalized from 10 for 2),
    substring(normalized from 12 for 2),
    substring(normalized from 14 for 2),
    substring(normalized from 16 for 2),
    substring(normalized from 18 for 2)
  );

  insert into public.account_settings(profile_id, recovery_phone, recovery_email)
  values (new.id, new.raw_user_meta_data->>'recovery_phone', new.raw_user_meta_data->>'recovery_email')
  on conflict (profile_id) do nothing;

  insert into public.group_memberships (group_id, profile_id)
  select ge.id, new.id
  from public.group_entities ge
  where ge.scope = any(array['country','governorate','district','village','clan','title']::public.hierarchy_scope[])
    and ge.hierarchy_code = case ge.scope
      when 'country' then substring(normalized from 1 for 3)
      when 'governorate' then substring(normalized from 4 for 2)
      when 'district' then substring(normalized from 6 for 2)
      when 'village' then substring(normalized from 8 for 2)
      when 'clan' then substring(normalized from 10 for 2)
      when 'title' then substring(normalized from 12 for 2)
    end
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_and_memberships();

create or replace function public.ensure_hierarchy_group(
  p_scope public.hierarchy_scope,
  p_code text,
  p_name_ar text,
  p_name_en text,
  p_parent uuid default null,
  p_is_channel boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  gid uuid;
begin
  insert into public.group_entities(scope, hierarchy_code, display_name_ar, display_name_en, parent_id, is_channel)
  values (p_scope, p_code, p_name_ar, p_name_en, p_parent, p_is_channel)
  on conflict (scope, hierarchy_code)
  do update set display_name_ar = excluded.display_name_ar, display_name_en = excluded.display_name_en
  returning id into gid;
  return gid;
end;
$$;

alter table public.profiles enable row level security;
alter table public.account_settings enable row level security;
alter table public.group_entities enable row level security;
alter table public.group_memberships enable row level security;
alter table public.blocked_users enable row level security;
alter table public.reports enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_receipts enable row level security;
alter table public.message_attachments enable row level security;

create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "account settings self read" on public.account_settings for select using (auth.uid() = profile_id);
create policy "account settings self write" on public.account_settings for update using (auth.uid() = profile_id);
create policy "group entities readable" on public.group_entities for select using (true);
create policy "memberships self read" on public.group_memberships for select using (auth.uid() = profile_id);
create policy "blocked self read" on public.blocked_users for select using (auth.uid() = blocker_id or auth.uid() = blocked_id);
create policy "blocked self write" on public.blocked_users for insert with check (auth.uid() = blocker_id);
create policy "reports self read" on public.reports for select using (auth.uid() = reporter_id);
create policy "reports self write" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "conversations member read" on public.conversations for select using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversations.id and cm.profile_id = auth.uid()));
create policy "conversation members self read" on public.conversation_members for select using (auth.uid() = profile_id);
create policy "messages member read" on public.messages for select using (exists (
  select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.profile_id = auth.uid()
));
create policy "messages member insert" on public.messages for insert with check (sender_id = auth.uid());
create policy "message receipts self read" on public.message_receipts for select using (auth.uid() = profile_id);
create policy "message receipts self write" on public.message_receipts for insert with check (auth.uid() = profile_id);
create policy "attachments member read" on public.message_attachments for select using (exists (
  select 1 from public.messages m
  join public.conversation_members cm on cm.conversation_id = m.conversation_id
  where m.id = message_attachments.message_id and cm.profile_id = auth.uid()
));
