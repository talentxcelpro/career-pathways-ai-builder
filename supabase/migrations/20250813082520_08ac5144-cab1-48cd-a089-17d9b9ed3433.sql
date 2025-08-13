-- Enable UUID + helper
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','contributor','user')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Posts (reels & general posts)
CREATE TABLE IF NOT EXISTS posts (
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

-- Admin content
CREATE TABLE IF NOT EXISTS course_videos (
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

CREATE TABLE IF NOT EXISTS employer_videos (LIKE course_videos INCLUDING ALL);
CREATE TABLE IF NOT EXISTS college_videos (LIKE course_videos INCLUDING ALL);

-- Podcasts
CREATE TABLE IF NOT EXISTS podcasts (
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

-- YouTube connection (platform/admin account)
CREATE TABLE IF NOT EXISTS youtube_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner text NOT NULL DEFAULT 'platform', -- 'platform' or 'admin:<user_id>'
  access_token text,
  refresh_token text NOT NULL,
  token_scope text[],
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reports & moderation
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name text NOT NULL,   -- posts|podcasts|course_videos|employer_videos|college_videos
  row_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  table_name text NOT NULL,
  row_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('approve','remove','restrict','shadow_hide')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Storage bucket for raw videos (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw_videos', 'raw_videos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_connections ENABLE ROW LEVEL SECURITY;

-- Roles
CREATE POLICY "self read/write role"
ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- Posts: owner can manage; everyone can read public
CREATE POLICY "read public posts"
ON posts FOR SELECT USING (
  deleted_at IS NULL
  AND (
    visibility = 'public'
    OR (visibility = 'users_only' AND auth.uid() IS NOT NULL)
    OR (auth.uid() = user_id)
  )
);

CREATE POLICY "insert own post"
ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update/delete own post"
ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own post"
ON posts FOR DELETE USING (auth.uid() = user_id);

-- Podcasts: same pattern
CREATE POLICY "read public podcasts"
ON podcasts FOR SELECT USING (
  deleted_at IS NULL
  AND (
    visibility = 'public'
    OR (visibility = 'users_only' AND auth.uid() IS NOT NULL)
    OR (auth.uid() = user_id)
  )
);
CREATE POLICY "insert own podcast"
ON podcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update/delete own podcast"
ON podcasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own podcast"
ON podcasts FOR DELETE USING (auth.uid() = user_id);

-- Admin tables: only admins write; everyone reads per visibility
CREATE POLICY "read admin course videos"
ON course_videos FOR SELECT USING (
  deleted_at IS NULL
  AND (visibility = 'public' OR (visibility = 'users_only' AND auth.uid() IS NOT NULL))
);

CREATE POLICY "admin manage course videos"
ON course_videos FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- repeat for employer_videos & college_videos
CREATE POLICY "read admin employer videos"
ON employer_videos FOR SELECT USING (
  deleted_at IS NULL
  AND (visibility = 'public' OR (visibility = 'users_only' AND auth.uid() IS NOT NULL))
);
CREATE POLICY "admin manage employer videos"
ON employer_videos FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "read admin college videos"
ON college_videos FOR SELECT USING (
  deleted_at IS NULL
  AND (visibility = 'public' OR (visibility = 'users_only' AND auth.uid() IS NOT NULL))
);
CREATE POLICY "admin manage college videos"
ON college_videos FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- Reports: anyone can insert their report; admins can read/manage
CREATE POLICY "insert report"
ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "admin read reports"
ON reports FOR SELECT USING (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

CREATE POLICY "admin manage reports"
ON reports FOR UPDATE USING (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

-- Moderation actions: admins only
CREATE POLICY "admin manage moderation actions"
ON moderation_actions FOR ALL USING (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

-- YouTube connections: admins only (platform-wide token)
CREATE POLICY "admin manage youtube connections"
ON youtube_connections FOR ALL USING (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));