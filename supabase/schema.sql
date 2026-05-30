-- Jodeh Chat MVP schema
-- Assumes Supabase Auth is enabled.

create extension if not exists pgcrypto;

-- Enums
create type public.app_language as enum ('ar', 'en');
create type public.chat_kind as enum ('dm', 'group', 'channel');
create type public.hierarchy_scope as enum ('country', 'governorate', 'district', 'village', 'clan', 'title');

-- Helpers
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

create or replace function public.hierarchy_part(hierarchy_id text, part_index int)
returns text
language sql
immutable
as $$
  select substring(hierarchy_id from (case when part_index = 1 then 1 else 4 + (part_index - 2) * 2 end) for (case when part_index = 1 then 3 else 2 end));
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

create or replace function public.hierarchy_scope_code(hierarchy_id text, scope hierarchy_scope)
returns text
language sql
immutable
as $$
  select case scope
    when 'country' then substring(hierarchy_id from 1 for 3)
    when 'governorate' then substring(hierarchy_id from 4 for 2)
    when 'district' then substring(hierarchy_id from 6 for 2)
    when 'village' then substring(hierarchy_id from 8 for 2)
    when 'clan' then substring(hierarchy_id from 10 for 2)
    when 'title' then substring(hierarchy_id from 12 for 2)
  end;
$$;

-- Core profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hierarchy_id text not null unique,
  language public.app_language not null default 'ar',
  first_name_ar text,
  first_name_en text,
  last_name_ar text,
  last_name_en text,
  display_name_ar text,
  display_name_en text,
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

-- Registration pipeline
create or replace function public.create_profile_and_memberships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  g_country uuid;
  g_governorate uuid;
  g_district uuid;
  g_village uuid;
  g_clan uuid;
  g_title uuid;
begin
  normalized := public.normalize_hierarchy_id(new.raw_user_meta_data->>'hierarchy_id');

  insert into public.profiles (
    id, hierarchy_id, language,
    first_name_ar, first_name_en, last_name_ar, last_name_en,
    display_name_ar, display_name_en,
    country_code, governorate_code, district_code, village_code, clan_code, title_code, grandfather_code, father_code, name_code
  ) values (
    new.id,
    normalized,
    coalesce((new.raw_user_meta_data->>'language')::public.app_language, 'ar'),
    new.raw_user_meta_data->>'first_name_ar',
    new.raw_user_meta_data->>'first_name_en',
    new.raw_user_meta_data->>'last_name_ar',
    new.raw_user_meta_data->>'last_name_en',
    new.raw_user_meta_data->>'display_name_ar',
    new.raw_user_meta_data->>'display_name_en',
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

-- Auto-trigger on auth registration
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_and_memberships();

-- Seed helper function for hierarchy groups
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

-- RLS
alter table public.profiles enable row level security;
alter table public.group_entities enable row level security;
alter table public.group_memberships enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "group entities readable" on public.group_entities for select using (true);
create policy "memberships self read" on public.group_memberships for select using (auth.uid() = profile_id);
create policy "conversations member read" on public.conversations for select using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversations.id and cm.profile_id = auth.uid()));
create policy "conversation members self read" on public.conversation_members for select using (auth.uid() = profile_id);
create policy "messages member read" on public.messages for select using (exists (
  select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.profile_id = auth.uid()
));
create policy "messages member insert" on public.messages for insert with check (sender_id = auth.uid());
