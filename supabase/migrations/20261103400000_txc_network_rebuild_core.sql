-- ============================================================================
-- Migration: 20261103400000_txc_network_rebuild_core.sql
-- Mission: TXC-NETWORK-REBUILD-001
-- Description: Core security remediation, post-media storage, RLS policy hardening,
--              identity synchronization, unified follow architecture, threaded comments,
--              bookmark persistence, messaging settings, and aggregated feed RPC.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. STORAGE BUCKET: POST-MEDIA & SECURITY POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  104857600, -- 100 MB max
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

-- Storage RLS on storage.objects for post-media
DROP POLICY IF EXISTS "Public Read Post Media" ON storage.objects;
CREATE POLICY "Public Read Post Media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Authenticated Users Upload Post Media" ON storage.objects;
CREATE POLICY "Authenticated Users Upload Post Media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );

DROP POLICY IF EXISTS "Owners Delete Post Media" ON storage.objects;
CREATE POLICY "Owners Delete Post Media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (
      auth.uid() = owner
      OR auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_app_admin(auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- 2. IDENTITY SYNCHRONIZATION: AUTHOR_ID & USER_ID
-- ----------------------------------------------------------------------------
UPDATE public.posts
SET user_id = author_id
WHERE user_id IS NULL AND author_id IS NOT NULL;

UPDATE public.posts
SET author_id = user_id
WHERE author_id IS NULL AND user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_posts_author_identity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := NEW.author_id;
  ELSIF NEW.user_id IS NOT NULL AND NEW.author_id IS NULL THEN
    NEW.author_id := NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_posts_author_identity ON public.posts;
CREATE TRIGGER trg_sync_posts_author_identity
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_posts_author_identity();

-- ----------------------------------------------------------------------------
-- 3. RLS HARDENING ON PUBLIC.POSTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop obsolete or overly permissive read policies
DROP POLICY IF EXISTS "posts_public_read_access" ON public.posts;
DROP POLICY IF EXISTS "Allow realtime for posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Connected users can view each other's posts" ON public.posts;
DROP POLICY IF EXISTS "posts_select_authorized" ON public.posts;

CREATE POLICY "posts_select_authorized" ON public.posts
FOR SELECT
USING (
  -- 1. Public, published, and not deleted
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND (is_public = true OR visibility = 'public' OR visibility IS NULL)
  )
  OR
  -- 2. Author can view all their own posts (draft, private, deleted)
  (
    auth.uid() IS NOT NULL
    AND (auth.uid() = author_id OR auth.uid() = user_id)
  )
  OR
  -- 3. Connections-only posts viewable by accepted connections
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND visibility = 'connections'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.connections
      WHERE (
        (requester_id = auth.uid() AND recipient_id = posts.author_id)
        OR
        (recipient_id = auth.uid() AND requester_id = posts.author_id)
      )
      AND status = 'accepted'
    )
  )
  OR
  -- 4. App Admin override
  (
    auth.uid() IS NOT NULL
    AND public.is_app_admin(auth.uid())
  )
);

-- Manage policies (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "posts_author_manage" ON public.posts;
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_author" ON public.posts;
DROP POLICY IF EXISTS "posts_update_author" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_author" ON public.posts;

CREATE POLICY "posts_insert_author" ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id OR auth.uid() = user_id
);

CREATE POLICY "posts_update_author" ON public.posts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid())
);

CREATE POLICY "posts_delete_author" ON public.posts
FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid())
);

-- ----------------------------------------------------------------------------
-- 4. FOLLOW SYSTEM CONSOLIDATION ON PUBLIC.USER_FOLLOWS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Backfill from public.follows if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follows') THEN
    INSERT INTO public.user_follows (follower_id, following_id, created_at, updated_at)
    SELECT follower_id::uuid, followed_id::uuid, COALESCE(created_at, now()), now()
    FROM public.follows
    WHERE followed_type = 'user' AND follower_id IS NOT NULL AND followed_id IS NOT NULL
    ON CONFLICT (follower_id, following_id) DO NOTHING;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_follows_select" ON public.user_follows;
CREATE POLICY "user_follows_select" ON public.user_follows
FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_follows_insert" ON public.user_follows;
CREATE POLICY "user_follows_insert" ON public.user_follows
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "user_follows_delete" ON public.user_follows;
CREATE POLICY "user_follows_delete" ON public.user_follows
FOR DELETE TO authenticated
USING (auth.uid() = follower_id);

-- ----------------------------------------------------------------------------
-- 5. TWO-LEVEL THREADED COMMENTS (PARENT_COMMENT_ID)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'post_comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE public.post_comments ADD COLUMN parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- ----------------------------------------------------------------------------
-- 6. BOOKMARKING & SAVED COLLECTIONS: PUBLIC.POST_SAVES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'Saved Posts',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_saves_select" ON public.post_saves;
CREATE POLICY "post_saves_select" ON public.post_saves
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_saves_insert" ON public.post_saves;
CREATE POLICY "post_saves_insert" ON public.post_saves
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_saves_delete" ON public.post_saves;
CREATE POLICY "post_saves_delete" ON public.post_saves
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7. MESSAGING ENHANCEMENTS & SETTINGS TABLE
-- ----------------------------------------------------------------------------
-- Support archiving conversations per participant
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS archived_by UUID[] DEFAULT '{}';

-- Support full professional profile credentials on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.user_messaging_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sound_notifications BOOLEAN DEFAULT false,
  read_receipts BOOLEAN DEFAULT true,
  typing_indicators BOOLEAN DEFAULT true,
  online_status BOOLEAN DEFAULT true,
  auto_accept_connections BOOLEAN DEFAULT true,
  filter_requests BOOLEAN DEFAULT false,
  filter_unverified BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_messaging_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messaging_settings_owner" ON public.user_messaging_settings;
CREATE POLICY "messaging_settings_owner" ON public.user_messaging_settings
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. OPTIMIZED AGGREGATED FEED RPC FUNCTION (ELIMINATES N+1 CARD QUERIES)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_network_feed_v2(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_feed_type TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH filtered_posts AS (
    SELECT p.*
    FROM public.posts p
    WHERE
      -- Visibility RLS alignment
      (
        (p.status = 'published' AND (p.is_deleted IS NULL OR p.is_deleted = false) AND (p.is_public = true OR p.visibility = 'public' OR p.visibility IS NULL))
        OR (p_user_id IS NOT NULL AND (p.author_id = p_user_id OR p.user_id = p_user_id))
        OR (
          p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND p.visibility = 'connections'
          AND p_user_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.connections c
            WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id) OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
            AND c.status = 'accepted'
          )
        )
      )
      -- Feed type filtering
      AND (
        p_feed_type = 'all'
        OR (
          p_feed_type = 'connections'
          AND p_user_id IS NOT NULL
          AND (
            p.author_id = p_user_id
            OR EXISTS (
              SELECT 1 FROM public.connections c
              WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id) OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
            )
          )
        )
      )
      -- Search filtering
      AND (
        p_search IS NULL
        OR p_search = ''
        OR p.content ILIKE ('%' || p_search || '%')
        OR p.headline ILIKE ('%' || p_search || '%')
      )
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ),
  aggregated_posts AS (
    SELECT
      fp.*,
      COALESCE(
        (
          SELECT jsonb_build_object(
            'id', prof.id,
            'full_name', prof.full_name,
            'title', prof.title,
            'headline', prof.headline,
            'profile_picture_url', COALESCE(prof.profile_picture_url, prof.profile_photo_url),
            'current_company', prof.current_company,
            'location', prof.location,
            'username', prof.username,
            'is_verified', prof.verification_status = 'verified'
          )
          FROM public.profiles prof
          WHERE prof.id = fp.author_id OR prof.id = fp.user_id
          LIMIT 1
        ),
        jsonb_build_object(
          'id', COALESCE(fp.author_id, fp.user_id),
          'full_name', 'Professional Member',
          'title', 'Member',
          'profile_picture_url', NULL
        )
      ) AS author_profile,
      (SELECT COUNT(*)::INT FROM public.post_likes pl WHERE pl.post_id = fp.id) AS real_likes_count,
      (SELECT COUNT(*)::INT FROM public.post_comments pc WHERE pc.post_id = fp.id) AS real_comments_count,
      (SELECT COUNT(*)::INT FROM public.post_shares ps WHERE ps.post_id = fp.id) AS real_shares_count,
      CASE
        WHEN p_user_id IS NOT NULL THEN
          EXISTS(SELECT 1 FROM public.post_likes pl WHERE pl.post_id = fp.id AND pl.user_id = p_user_id)
        ELSE false
      END AS is_liked_by_me,
      CASE
        WHEN p_user_id IS NOT NULL THEN
          EXISTS(SELECT 1 FROM public.post_saves ps WHERE ps.post_id = fp.id AND ps.user_id = p_user_id)
        ELSE false
      END AS is_saved_by_me
    FROM filtered_posts fp
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ap.id,
      'content', ap.content,
      'headline', ap.headline,
      'tagline', ap.tagline,
      'created_at', ap.created_at,
      'updated_at', ap.updated_at,
      'author_id', ap.author_id,
      'user_id', ap.user_id,
      'post_type', ap.post_type,
      'media_urls', ap.media_urls,
      'tags', ap.tags,
      'hashtags', ap.hashtags,
      'location', ap.location,
      'visibility', ap.visibility,
      'is_public', ap.is_public,
      'status', ap.status,
      'likes_count', ap.real_likes_count,
      'comments_count', ap.real_comments_count,
      'shares_count', ap.real_shares_count,
      'is_liked', ap.is_liked_by_me,
      'is_saved', ap.is_saved_by_me,
      'profiles', ap.author_profile
    )
  ) INTO v_result
  FROM aggregated_posts ap;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT) TO anon, authenticated, service_role;
