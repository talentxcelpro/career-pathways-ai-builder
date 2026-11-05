-- ============================================================================
-- Migration: 20261103500000_txc_network_rls_hardening.sql
-- Mission: TXC-NETWORK-ACCEPTANCE-002
-- Description: Expand visibility check constraint, create post_shares table,
--              add notifications.action_url column & trigger sync,
--              add post_comments identity sync trigger,
--              create group_memberships and group_posts tables with RLS,
--              and harden RLS & feed v2.
-- ============================================================================

-- 1. Relax/Expand posts_visibility_check constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_visibility_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_visibility_check
  CHECK (visibility IS NULL OR visibility = ANY (ARRAY['public'::text, 'private'::text, 'followers'::text, 'connections'::text]));

-- 2. Post shares table for recording sharing interactions
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_shares_select" ON public.post_shares;
CREATE POLICY "post_shares_select" ON public.post_shares
FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_shares_insert" ON public.post_shares;
CREATE POLICY "post_shares_insert" ON public.post_shares
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Group Memberships Table
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_memberships_select" ON public.group_memberships;
CREATE POLICY "group_memberships_select" ON public.group_memberships
FOR SELECT USING (true);

DROP POLICY IF EXISTS "group_memberships_insert" ON public.group_memberships;
CREATE POLICY "group_memberships_insert" ON public.group_memberships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_memberships_delete" ON public.group_memberships;
CREATE POLICY "group_memberships_delete" ON public.group_memberships
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 4. Group Discussion Posts Table
CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_posts_select" ON public.group_posts;
CREATE POLICY "group_posts_select" ON public.group_posts
FOR SELECT USING (true);

DROP POLICY IF EXISTS "group_posts_insert" ON public.group_posts;
CREATE POLICY "group_posts_insert" ON public.group_posts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 5. Notification action_url column & sync trigger
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

CREATE OR REPLACE FUNCTION public.sync_notification_link_action_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action_url IS NOT NULL AND NEW.link IS NULL THEN
    NEW.link := NEW.action_url;
  ELSIF NEW.link IS NOT NULL AND NEW.action_url IS NULL THEN
    NEW.action_url := NEW.link;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notification_link ON public.notifications;
CREATE TRIGGER trg_sync_notification_link
BEFORE INSERT OR UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.sync_notification_link_action_url();

-- 6. Post Comments Identity Sync Trigger
CREATE OR REPLACE FUNCTION public.sync_comments_author_identity()
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

DROP TRIGGER IF EXISTS trg_sync_comments_author_identity ON public.post_comments;
CREATE TRIGGER trg_sync_comments_author_identity
BEFORE INSERT OR UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_comments_author_identity();

-- 7. Hardened RLS Policy
DROP POLICY IF EXISTS "posts_select_authorized" ON public.posts;

CREATE POLICY "posts_select_authorized" ON public.posts
FOR SELECT
USING (
  -- 1. Public, published, not deleted, and NOT conflicting private/connections/followers
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND COALESCE(is_public, true) = true
    AND COALESCE(visibility, 'public') = 'public'
    AND (visibility IS NULL OR visibility NOT IN ('private', 'connections', 'followers'))
  )
  OR
  -- 2. Author can view all their own posts (draft, private, deleted)
  (
    auth.uid() IS NOT NULL
    AND (auth.uid() = author_id OR auth.uid() = user_id)
  )
  OR
  -- 3. Connections-only or Followers-only posts viewable by accepted connections or followers
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND visibility IN ('connections', 'followers')
    AND auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.connections
        WHERE (
          (requester_id = auth.uid() AND recipient_id = posts.author_id)
          OR
          (recipient_id = auth.uid() AND requester_id = posts.author_id)
        )
        AND status = 'accepted'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.user_follows
        WHERE follower_id = auth.uid() AND following_id = posts.author_id
      )
    )
  )
  OR
  -- 4. App Admin override
  (
    auth.uid() IS NOT NULL
    AND public.is_app_admin(auth.uid())
  )
);

-- 8. Update get_network_feed_v2 with identical hardened logic
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
      -- Visibility alignment:
      (
        -- 1. Published, public, not deleted, no conflict
        (
          p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND COALESCE(p.is_public, true) = true
          AND COALESCE(p.visibility, 'public') = 'public'
          AND (p.visibility IS NULL OR p.visibility NOT IN ('private', 'connections', 'followers'))
        )
        OR
        -- 2. Author view
        (p_user_id IS NOT NULL AND (p.author_id = p_user_id OR p.user_id = p_user_id))
        OR
        -- 3. Connections-only or followers-only view
        (
          p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND p.visibility IN ('connections', 'followers')
          AND p_user_id IS NOT NULL
          AND (
            EXISTS (
              SELECT 1 FROM public.connections c
              WHERE ((c.requester_id = p_user_id AND c.recipient_id = p.author_id) OR (c.recipient_id = p_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
            )
            OR
            EXISTS (
              SELECT 1 FROM public.user_follows f
              WHERE f.follower_id = p_user_id AND f.following_id = p.author_id
            )
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

-- 8. profile_views compatibility column (created_at)
ALTER TABLE public.profile_views ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
UPDATE public.profile_views SET created_at = viewed_at WHERE created_at IS NULL AND viewed_at IS NOT NULL;
