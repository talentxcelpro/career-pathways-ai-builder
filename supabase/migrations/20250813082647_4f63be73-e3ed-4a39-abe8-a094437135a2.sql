-- Enable UUID + helper
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Roles (check if exists first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE user_roles (
          user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          role text NOT NULL CHECK (role IN ('admin','contributor','user')) DEFAULT 'user',
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- Posts (reels & general posts)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
        CREATE TABLE posts (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          type text NOT NULL CHECK (type IN ('text','image','video_reel','podcast')),
          title text,
          description text,
          tags text[] DEFAULT '{}',
          location text,
          video_url text,           -- final YouTube URL
          yt_video_id text,         -- YouTube ID
          thumbnail_url text,
          visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','users_only','private')),
          promoted boolean DEFAULT false,
          deleted_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- Admin content
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_videos') THEN
        CREATE TABLE course_videos (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
          title text NOT NULL,
          description text,
          tags text[] DEFAULT '{}',
          video_url text,
          yt_video_id text,
          thumbnail_url text,
          visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','users_only','private')),
          featured boolean DEFAULT false,
          ad_placement text DEFAULT 'none' CHECK (ad_placement IN ('none','pre_roll','mid_roll')),
          deleted_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employer_videos') THEN
        CREATE TABLE employer_videos (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
          title text NOT NULL,
          description text,
          tags text[] DEFAULT '{}',
          video_url text,
          yt_video_id text,
          thumbnail_url text,
          visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','users_only','private')),
          featured boolean DEFAULT false,
          ad_placement text DEFAULT 'none' CHECK (ad_placement IN ('none','pre_roll','mid_roll')),
          deleted_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'college_videos') THEN
        CREATE TABLE college_videos (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
          title text NOT NULL,
          description text,
          tags text[] DEFAULT '{}',
          video_url text,
          yt_video_id text,
          thumbnail_url text,
          visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','users_only','private')),
          featured boolean DEFAULT false,
          ad_placement text DEFAULT 'none' CHECK (ad_placement IN ('none','pre_roll','mid_roll')),
          deleted_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- Podcasts
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcasts') THEN
        CREATE TABLE podcasts (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
          title text NOT NULL,
          description text,
          category text NOT NULL,   -- Careers, Jobs, Resume, Career Tools, ...
          tags text[] DEFAULT '{}',
          host_name text,
          video_url text,
          yt_video_id text,
          thumbnail_url text,
          visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','users_only','private')),
          promoted boolean DEFAULT false,
          deleted_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- YouTube connection (platform/admin account)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'youtube_connections') THEN
        CREATE TABLE youtube_connections (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          owner text NOT NULL DEFAULT 'platform', -- 'platform' or 'admin:<user_id>'
          access_token text,
          refresh_token text NOT NULL,
          token_scope text[],
          expires_at timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- Reports & moderation
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reports') THEN
        CREATE TABLE reports (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          table_name text NOT NULL,   -- posts|podcasts|course_videos|employer_videos|college_videos
          row_id uuid NOT NULL,
          reason text NOT NULL,
          details text,
          status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','rejected')),
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'moderation_actions') THEN
        CREATE TABLE moderation_actions (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          admin_id uuid NOT NULL REFERENCES auth.users(id),
          table_name text NOT NULL,
          row_id uuid NOT NULL,
          action text NOT NULL CHECK (action IN ('approve','remove','restrict','shadow_hide')),
          notes text,
          created_at timestamptz DEFAULT now()
        );
    END IF;
END$$;

-- Storage bucket for raw videos (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw_videos', 'raw_videos', false)
ON CONFLICT (id) DO NOTHING;