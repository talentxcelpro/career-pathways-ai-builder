-- ============================================================================
-- Migration: 20261114140000_txc_network_phase1_security_remediation.sql
-- Module: TalentXcel Professional Network Security Hardening (Phase 1)
-- Environment: Staging Verified (PVWWTQUUEXHYYDWIHJBI) -> Production Ready
-- Mission: SEC-01, SEC-02, SEC-03, SEC-04 Privacy & Authorization Hardening
-- Author: Antigravity Advanced Agentic Systems Architecture Team
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. POSTS & PROFILES SCHEMA HARMONIZATION & CONSTRAINTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS hashtags TEXT[];
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'feed';

-- Ensure profile columns referenced by feed exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Sync user_id and author_id
UPDATE public.posts SET user_id = author_id WHERE user_id IS NULL AND author_id IS NOT NULL;
UPDATE public.posts SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;

-- Visibility constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_visibility_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_visibility_check
  CHECK (visibility IS NULL OR visibility = ANY (ARRAY['public'::text, 'private'::text, 'followers'::text, 'connections'::text]));

-- ----------------------------------------------------------------------------
-- 2. SUPPORTING SOCIAL TABLES (POST_LIKES, POST_SAVES, POST_SHARES, USER_FOLLOWS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'Saved Posts',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Groups support
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'unlisted')),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS across all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. REMOVE UNSAFE PERMISSIVE POLICIES ON POSTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read access" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view appropriate posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "posts_public_read_access" ON public.posts;
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
DROP POLICY IF EXISTS "Allow realtime for posts" ON public.posts;
DROP POLICY IF EXISTS "Connected users can view each other's posts" ON public.posts;
DROP POLICY IF EXISTS "posts_select_authorized" ON public.posts;

-- ----------------------------------------------------------------------------
-- 4. INSTALL AUTHORITATIVE, SECURE SELECT POLICY ON POSTS
-- ----------------------------------------------------------------------------
CREATE POLICY "posts_select_authorized" ON public.posts
FOR SELECT
TO public
USING (
  -- Branch 1: Published public posts (Accessible to everyone, including anonymous visitors)
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND COALESCE(is_public, true) = true
    AND COALESCE(visibility, 'public') = 'public'
    AND (visibility IS NULL OR visibility NOT IN ('private', 'connections', 'followers'))
  )
  OR
  -- Branch 2: Author view (Authenticated author can view all their own posts: drafts, private, deleted)
  (
    auth.uid() IS NOT NULL
    AND (auth.uid() = author_id OR auth.uid() = user_id)
  )
  OR
  -- Branch 3: Connections-only or Followers-only posts (Strictly restricted to accepted connections / followers)
  (
    status = 'published'
    AND (is_deleted IS NULL OR is_deleted = false)
    AND visibility IN ('connections', 'followers')
    AND auth.uid() IS NOT NULL
    AND (
      (
        visibility = 'connections' AND EXISTS (
          SELECT 1 FROM public.connections c
          WHERE (
            (c.requester_id = auth.uid() AND c.recipient_id = posts.author_id)
            OR
            (c.recipient_id = auth.uid() AND c.requester_id = posts.author_id)
          )
          AND c.status = 'accepted'
        )
      )
      OR
      (
        visibility = 'followers' AND EXISTS (
          SELECT 1 FROM public.user_follows f
          WHERE f.follower_id = auth.uid() AND f.following_id = posts.author_id
        )
      )
    )
  )
  OR
  -- Branch 4: Application Admin override
  (
    auth.uid() IS NOT NULL
    AND public.is_app_admin(auth.uid())
  )
);

-- Ensure strict write policies on posts
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_author" ON public.posts;

CREATE POLICY "posts_insert_author" ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (auth.uid() = author_id OR auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Own records update" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_update_author" ON public.posts;

CREATE POLICY "posts_update_author" ON public.posts
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid()))
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid()))
);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_author" ON public.posts;

CREATE POLICY "posts_delete_author" ON public.posts
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (auth.uid() = author_id OR auth.uid() = user_id OR public.is_app_admin(auth.uid()))
);

-- ----------------------------------------------------------------------------
-- 5. SOCIAL TABLES RLS HARDENING (POST_LIKES, POST_SAVES, POST_SHARES, USER_FOLLOWS)
-- ----------------------------------------------------------------------------
-- post_likes
DROP POLICY IF EXISTS "post_likes_select" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "post_likes_select" ON public.post_likes
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "post_likes_insert" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
CREATE POLICY "post_likes_insert" ON public.post_likes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_likes_delete" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
CREATE POLICY "post_likes_delete" ON public.post_likes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- post_saves (Strictly Private to Owner)
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

-- post_shares
DROP POLICY IF EXISTS "post_shares_select" ON public.post_shares;
CREATE POLICY "post_shares_select" ON public.post_shares
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "post_shares_insert" ON public.post_shares;
CREATE POLICY "post_shares_insert" ON public.post_shares
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- user_follows
DROP POLICY IF EXISTS "user_follows_select" ON public.user_follows;
CREATE POLICY "user_follows_select" ON public.user_follows
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "user_follows_insert" ON public.user_follows;
CREATE POLICY "user_follows_insert" ON public.user_follows
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "user_follows_delete" ON public.user_follows;
CREATE POLICY "user_follows_delete" ON public.user_follows
FOR DELETE TO authenticated
USING (auth.uid() = follower_id);

-- ----------------------------------------------------------------------------
-- 6. GROUP PRIVACY MODEL RLS (GROUPS, GROUP_MEMBERSHIPS, GROUP_POSTS)
-- ----------------------------------------------------------------------------
-- groups
DROP POLICY IF EXISTS "groups_select" ON public.groups;
CREATE POLICY "groups_select" ON public.groups
FOR SELECT TO public
USING (
  privacy = 'public'
  OR (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
    )
  )
  OR (auth.uid() IS NOT NULL AND creator_id = auth.uid())
  OR (auth.uid() IS NOT NULL AND public.is_app_admin(auth.uid()))
);

-- group_memberships
DROP POLICY IF EXISTS "group_memberships_select" ON public.group_memberships;
CREATE POLICY "group_memberships_select" ON public.group_memberships
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (status = 'accepted')
  OR (auth.uid() IS NOT NULL AND public.is_app_admin(auth.uid()))
);

DROP POLICY IF EXISTS "group_memberships_insert" ON public.group_memberships;
CREATE POLICY "group_memberships_insert" ON public.group_memberships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_memberships_delete" ON public.group_memberships;
CREATE POLICY "group_memberships_delete" ON public.group_memberships
FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.group_memberships gm
    WHERE gm.group_id = group_memberships.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'owner')
  )
  OR public.is_app_admin(auth.uid())
);

-- group_posts
DROP POLICY IF EXISTS "group_posts_select" ON public.group_posts;
CREATE POLICY "group_posts_select" ON public.group_posts
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND author_id = auth.uid())
  OR (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_posts.group_id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
    )
  )
  OR (auth.uid() IS NOT NULL AND public.is_app_admin(auth.uid()))
);

DROP POLICY IF EXISTS "group_posts_insert" ON public.group_posts;
CREATE POLICY "group_posts_insert" ON public.group_posts
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.group_memberships gm
    WHERE gm.group_id = group_posts.group_id AND gm.user_id = auth.uid() AND gm.status = 'accepted'
  )
);

-- ----------------------------------------------------------------------------
-- 7. SECURE GET_NETWORK_FEED_V2 RPC WITH BULLETPROOF AUTHORIZATION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_network_feed_v2(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_feed_type TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_effective_user_id UUID;
  v_is_admin BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- ---------------------------------------------------------------------------
  -- IDENTITY RESOLUTION GUARD:
  -- Never trust caller-supplied p_user_id. The effective user identity is
  -- strictly derived from auth.uid(). Anonymous callers are treated as NULL.
  -- ---------------------------------------------------------------------------
  IF v_auth_uid IS NOT NULL THEN
    v_effective_user_id := v_auth_uid;
    v_is_admin := public.is_app_admin(v_auth_uid);
  ELSE
    v_effective_user_id := NULL;
    v_is_admin := false;
  END IF;

  WITH filtered_posts AS (
    SELECT p.*
    FROM public.posts p
    WHERE
      (
        -- Branch 1: Published public posts (Accessible to everyone, including anonymous)
        (
          p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND COALESCE(p.is_public, true) = true
          AND COALESCE(p.visibility, 'public') = 'public'
          AND (p.visibility IS NULL OR p.visibility NOT IN ('private', 'connections', 'followers'))
        )
        OR
        -- Branch 2: Author View (Only the verified authenticated author can view their own drafts/deleted)
        (
          v_effective_user_id IS NOT NULL 
          AND (p.author_id = v_effective_user_id OR p.user_id = v_effective_user_id)
        )
        OR
        -- Branch 3: Connections / Followers View (Strict relationship verification required)
        (
          p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND p.visibility IN ('connections', 'followers')
          AND v_effective_user_id IS NOT NULL
          AND (
            (
              p.visibility = 'connections' AND EXISTS (
                SELECT 1 FROM public.connections c
                WHERE ((c.requester_id = v_effective_user_id AND c.recipient_id = p.author_id)
                   OR (c.recipient_id = v_effective_user_id AND c.requester_id = p.author_id))
                AND c.status = 'accepted'
              )
            )
            OR
            (
              p.visibility = 'followers' AND EXISTS (
                SELECT 1 FROM public.user_follows f
                WHERE f.follower_id = v_effective_user_id AND f.following_id = p.author_id
              )
            )
          )
        )
        OR
        -- Branch 4: App Admin override
        (v_is_admin = true)
      )
      -- Feed Type Filtering
      AND (
        p_feed_type = 'all'
        OR (
          p_feed_type = 'connections'
          AND v_effective_user_id IS NOT NULL
          AND (
            p.author_id = v_effective_user_id
            OR EXISTS (
              SELECT 1 FROM public.connections c
              WHERE ((c.requester_id = v_effective_user_id AND c.recipient_id = p.author_id)
                 OR (c.recipient_id = v_effective_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
            )
          )
        )
      )
      -- Search Filtering
      AND (
        p_search IS NULL
        OR p_search = ''
        OR p.content ILIKE ('%' || p_search || '%')
        OR p.headline ILIKE ('%' || p_search || '%')
      )
    ORDER BY p.created_at DESC
    LIMIT LEAST(p_limit, 50)
    OFFSET GREATEST(p_offset, 0)
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
      -- Engagement flags derived strictly from verified identity
      CASE
        WHEN v_effective_user_id IS NOT NULL THEN
          EXISTS(SELECT 1 FROM public.post_likes pl WHERE pl.post_id = fp.id AND pl.user_id = v_effective_user_id)
        ELSE false
      END AS is_liked_by_me,
      CASE
        WHEN v_effective_user_id IS NOT NULL THEN
          EXISTS(SELECT 1 FROM public.post_saves ps WHERE ps.post_id = fp.id AND ps.user_id = v_effective_user_id)
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
$$;

-- Function Privileges
REVOKE EXECUTE ON FUNCTION public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT) TO anon, authenticated, service_role;
