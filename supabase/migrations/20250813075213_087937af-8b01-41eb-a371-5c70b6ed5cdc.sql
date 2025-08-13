
-- Phase 1: Core schema for YouTube publishing + moderation + storage RLS
-- Target project: https://bqajvzxrfakelxsovyxu.supabase.co

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Basic roles table + helper
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','contributor','user')) default 'user',
  created_at timestamptz not null default now()
);

-- Helper to check admin
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Secure table to store YouTube refresh tokens (admin connects 1..N channels)
create table if not exists public.youtube_channels (
  id bigserial primary key,
  label text,
  refresh_token text not null,
  created_at timestamptz not null default now()
);

-- Core videos table (single table for reels/discussion/podcast/learning)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('reel','discussion','podcast','learning')),
  title text,
  caption text,
  user_id uuid, -- uploader (nullable for admin-created)
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

-- Engagement (optional)
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

-- Moderation (reports) and audit logs
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('video')),
  target_id uuid not null, -- references videos(id) logically
  reason text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,      -- create_video, publish_youtube, delete_video, change_privacy, report_video, etc.
  entity_type text not null, -- video, report, etc.
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_videos_status_created_at on public.videos (status, created_at desc);
create index if not exists idx_videos_wall on public.videos (allow_on_wall, created_at desc);
create index if not exists idx_videos_type_created_at on public.videos (type, created_at desc);

-- RLS enable
alter table public.youtube_channels enable row level security;
alter table public.videos enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

-- youtube_channels: service role only
drop policy if exists "service-only-youtube-channels" on public.youtube_channels;
create policy "service-only-youtube-channels"
on public.youtube_channels
as permissive
for all
to service_role
using (true)
with check (true);

-- videos: read published (public)
drop policy if exists "read-published-videos" on public.videos;
create policy "read-published-videos"
on public.videos for select
to anon, authenticated
using (status = 'published');

-- videos: create reels (end-users); admin can create any via service role
drop policy if exists "insert-reels" on public.videos;
create policy "insert-reels"
on public.videos for insert
to authenticated
with check (type = 'reel' and (user_id = auth.uid()));

-- videos: update/delete own or admin
drop policy if exists "update-own-or-admin" on public.videos;
create policy "update-own-or-admin"
on public.videos for update
to authenticated
using ((user_id = auth.uid()) or is_admin());

drop policy if exists "delete-own-or-admin" on public.videos;
create policy "delete-own-or-admin"
on public.videos for delete
to authenticated
using ((user_id = auth.uid()) or is_admin());

-- Likes/comments: anyone can read; owners manage their rows
drop policy if exists "likes-select" on public.video_likes;
create policy "likes-select"
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

drop policy if exists "comments-select" on public.video_comments;
create policy "comments-select"
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

-- Reports: any authenticated can create; admin can read/update
drop policy if exists "create-reports" on public.reports;
create policy "create-reports"
on public.reports for insert
to authenticated
with check (true);

drop policy if exists "read-own-reports-or-admin" on public.reports;
create policy "read-own-reports-or-admin"
on public.reports for select
to authenticated
using (reporter_id = auth.uid() or is_admin());

drop policy if exists "admin-update-reports" on public.reports;
create policy "admin-update-reports"
on public.reports for update
to authenticated
using (is_admin());

-- Audit logs: admin read; inserts via service role
drop policy if exists "admin-read-audit-logs" on public.audit_logs;
create policy "admin-read-audit-logs"
on public.audit_logs for select
to authenticated
using (is_admin());

-- Storage buckets (private)
insert into storage.buckets (id, name, public) values
  ('videos', 'videos', false),
  ('thumbnails', 'thumbnails', false)
on conflict (id) do nothing;

-- Storage RLS: enable
alter table storage.objects enable row level security;

-- Storage policies:
-- Admins can manage all objects
drop policy if exists "admin-all-objects" on storage.objects;
create policy "admin-all-objects"
on storage.objects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Authenticated users can insert into their own folders: videos/{user_id}/..., thumbnails/{user_id}/...
drop policy if exists "user-insert-own-videos" on storage.objects;
create policy "user-insert-own-videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('videos','thumbnails')
  and (split_part(name, '/', 1))::text = auth.uid()::text
);

-- Authenticated users can read/update/delete their own objects
drop policy if exists "user-select-own-objects" on storage.objects;
create policy "user-select-own-objects"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('videos','thumbnails')
  and (split_part(name, '/', 1))::text = auth.uid()::text
  or public.is_admin()
);

drop policy if exists "user-update-own-objects" on storage.objects;
create policy "user-update-own-objects"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('videos','thumbnails')
  and (split_part(name, '/', 1))::text = auth.uid()::text
  or public.is_admin()
)
with check (
  bucket_id in ('videos','thumbnails')
  and (split_part(name, '/', 1))::text = auth.uid()::text
  or public.is_admin()
);

drop policy if exists "user-delete-own-objects" on storage.objects;
create policy "user-delete-own-objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('videos','thumbnails')
  and (split_part(name, '/', 1))::text = auth.uid()::text
  or public.is_admin()
);
