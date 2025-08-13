-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "self read/write role" ON user_roles;
DROP POLICY IF EXISTS "read public posts" ON posts;
DROP POLICY IF EXISTS "insert own post" ON posts;
DROP POLICY IF EXISTS "update/delete own post" ON posts;
DROP POLICY IF EXISTS "delete own post" ON posts;
DROP POLICY IF EXISTS "read public podcasts" ON podcasts;
DROP POLICY IF EXISTS "insert own podcast" ON podcasts;
DROP POLICY IF EXISTS "update/delete own podcast" ON podcasts;
DROP POLICY IF EXISTS "delete own podcast" ON podcasts;
DROP POLICY IF EXISTS "read admin course videos" ON course_videos;
DROP POLICY IF EXISTS "admin manage course videos" ON course_videos;
DROP POLICY IF EXISTS "read admin employer videos" ON employer_videos;
DROP POLICY IF EXISTS "admin manage employer videos" ON employer_videos;
DROP POLICY IF EXISTS "read admin college videos" ON college_videos;
DROP POLICY IF EXISTS "admin manage college videos" ON college_videos;
DROP POLICY IF EXISTS "insert report" ON reports;
DROP POLICY IF EXISTS "admin read reports" ON reports;
DROP POLICY IF EXISTS "admin manage reports" ON reports;
DROP POLICY IF EXISTS "admin manage moderation actions" ON moderation_actions;
DROP POLICY IF EXISTS "admin manage youtube connections" ON youtube_connections;

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