
-- 1) Core tables

-- Videos (single table for all types)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('reel','discussion','podcast','learning')),
  title text,
  caption text,
  user_id uuid, -- uploader
  storage_provider text not null default 'youtube',
  provider_video_id text,            -- youtube video id
  channel_index int,                 -- which YT channel was used (1..N)
  thumbnail_url text,
  duration_seconds int,
  privacy text not null default 'unlisted' check (privacy in ('private','unlisted','public')),
  status text not null default 'processing' check (status in ('processing','published','failed','blocked')),
  allow_on_wall boolean not null default true,
  created_at timestamptz not null default now()
);

-- Optional engagement tables
create table if not exists public.video_likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null,
  body text,
  created_at timestamptz not null default now()
);

-- Secure storage for YouTube refresh tokens (one row per connected channel)
create table if not exists public.youtube_channels (
  id bigserial primary key,
  label text,                         -- e.g., "TalentXcel Pro #1"
  refresh_token text not null,        -- stored encrypted at rest by Supabase
  created_at timestamptz not null default now()
);

-- 2) Indexes for common queries
create index if not exists idx_videos_status_created_at on public.videos (status, created_at desc);
create index if not exists idx_videos_wall on public.videos (allow_on_wall, created_at desc);
create index if not exists idx_videos_type_created_at on public.videos (type, created_at desc);

-- 3) RLS

-- Enable RLS
alter table public.videos enable row level security;
alter table public.youtube_channels enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;

-- POLICY: youtube_channels is service-role only (no one else can access)
drop policy if exists "service-only-youtube-channels" on public.youtube_channels;
create policy "service-only-youtube-channels"
on public.youtube_channels
as permissive
for all
to service_role
using (true)
with check (true);

-- POLICY: everyone (anon, authenticated) can read published videos shown on the wall
drop policy if exists "read-published-wall" on public.videos;
create policy "read-published-wall"
on public.videos for select
to anon, authenticated
using (status = 'published' and allow_on_wall = true);

-- POLICY: everyone can read all published videos (for lists like /learning; route filters by type)
drop policy if exists "read-learning" on public.videos;
create policy "read-learning"
on public.videos for select
to anon, authenticated
using (status = 'published');

-- POLICY: signed-in users can insert their own REELS (server still moderates/updates)
drop policy if exists "insert-reels" on public.videos;
create policy "insert-reels"
on public.videos for insert
to authenticated
with check (type = 'reel' and user_id = auth.uid());

-- Likes/comments minimal RLS:
-- Anyone can read likes/comments; only owners can insert/delete theirs

-- Likes
drop policy if exists "likes-select-public" on public.video_likes;
create policy "likes-select-public"
on public.video_likes for select
to anon, authenticated
using (true);

drop policy if exists "likes-insert-own" on public.video_likes;
create policy "likes-insert-own"
on public.video_likes for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "likes-delete-own" on public.video_likes;
create policy "likes-delete-own"
on public.video_likes for delete
to authenticated
using (user_id = auth.uid());

-- Comments
drop policy if exists "comments-select-public" on public.video_comments;
create policy "comments-select-public"
on public.video_comments for select
to anon, authenticated
using (true);

drop policy if exists "comments-insert-own" on public.video_comments;
create policy "comments-insert-own"
on public.video_comments for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "comments-delete-own" on public.video_comments;
create policy "comments-delete-own"
on public.video_comments for delete
to authenticated
using (user_id = auth.uid());
