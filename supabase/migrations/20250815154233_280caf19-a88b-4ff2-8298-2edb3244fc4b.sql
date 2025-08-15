-- Create public_profiles if missing with proper RLS
create table if not exists public.public_profiles (
  user_id uuid primary key,
  public_url_slug text unique not null,
  qr_code_data text,
  is_active boolean default true,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Add FK to profiles if table exists
do $$ begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.public_profiles
    drop constraint if exists public_profiles_user_id_fkey;
    alter table public.public_profiles
    add constraint public_profiles_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

-- Trigger to keep updated_at fresh
create or replace function public.update_public_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_public_profiles_updated_at
before update on public.public_profiles
for each row execute function public.update_public_profiles_updated_at();

-- Enable RLS and policies
alter table public.public_profiles enable row level security;

-- Allow users to select their own row
create policy if not exists "Users can view their own public profile"
  on public.public_profiles
  for select
  using (auth.uid() = user_id);

-- Allow users to upsert their own row (optional, function uses service role anyway)
create policy if not exists "Users can insert their own public profile"
  on public.public_profiles
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own public profile"
  on public.public_profiles
  for update
  using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_public_profiles_slug on public.public_profiles (public_url_slug);
