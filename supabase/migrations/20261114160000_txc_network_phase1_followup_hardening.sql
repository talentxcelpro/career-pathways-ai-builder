-- ============================================================================
-- Migration: 20261114160000_txc_network_phase1_followup_hardening.sql
-- Module: TalentXcel Network Security Hardening (Phase 1 Follow-Up)
-- Objectives:
--   1. Profiles PII Protection & public_profiles view
--   2. Group membership authorization & private group read prevention
--   3. Feed function enhancements: order by in jsonb_agg, draft isolation,
--      support for all frontend feed types ('all', 'trending', 'connections', 'following')
--   4. Engagement indexes & authenticated-only social reads
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES PII PROTECTION & PUBLIC_PROFILES VIEW
-- ----------------------------------------------------------------------------
-- Drop existing unsafe public select policy on base profiles table
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Ensure own-profile read policy exists for authenticated users
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_app_admin(auth.uid()));

-- Create secure public_profiles view with safe columns only
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  username,
  title,
  headline,
  about,
  location,
  profile_picture_url,
  profile_photo_url,
  cover_image_url,
  skills,
  experience_years,
  industry,
  current_company,
  linkedin_url,
  github_url,
  portfolio_url,
  website,
  verification_status,
  is_profile_public,
  created_at,
  updated_at
FROM public.profiles
WHERE (is_profile_public = true OR is_profile_public IS NULL);

-- Grant select on public_profiles view to anon and authenticated
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. SECURE GROUP MEMBERSHIP & GROUP POST PRIVACY MODEL
-- ----------------------------------------------------------------------------
-- Helper function to check group membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_accepted_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_memberships
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND status = 'accepted'
  );
$$;

-- Helper function to check group privacy
CREATE OR REPLACE FUNCTION public.get_group_privacy(p_group_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT privacy FROM public.groups WHERE id = p_group_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_group_accepted_member(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_group_privacy(UUID) TO anon, authenticated, service_role;

-- Hardened group_memberships RLS
DROP POLICY IF EXISTS "group_memberships_insert" ON public.group_memberships;
CREATE POLICY "group_memberships_insert" ON public.group_memberships
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'member'
  AND (
    (public.get_group_privacy(group_id) = 'public' AND status IN ('accepted', 'pending'))
    OR
    (public.get_group_privacy(group_id) IN ('private', 'unlisted') AND status = 'pending')
  )
);

DROP POLICY IF EXISTS "group_memberships_select" ON public.group_memberships;
CREATE POLICY "group_memberships_select" ON public.group_memberships
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (public.get_group_privacy(group_id) = 'public' AND status = 'accepted')
  OR (auth.uid() IS NOT NULL AND status = 'accepted' AND public.is_group_accepted_member(group_id, auth.uid()))
  OR (auth.uid() IS NOT NULL AND public.is_app_admin(auth.uid()))
);

-- Hardened group_posts RLS
DROP POLICY IF EXISTS "group_posts_select" ON public.group_posts;
CREATE POLICY "group_posts_select" ON public.group_posts
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND author_id = auth.uid())
  OR (public.get_group_privacy(group_id) = 'public')
  OR (auth.uid() IS NOT NULL AND public.is_group_accepted_member(group_id, auth.uid()))
  OR (auth.uid() IS NOT NULL AND public.is_app_admin(auth.uid()))
);

-- ----------------------------------------------------------------------------
-- 3. ENGAGEMENT INDEXES & PRIVACY HARDENING FOR SOCIAL TABLES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id_user_id ON public.post_saves(post_id, user_id);

-- Restrict post_likes and user_follows SELECT to authenticated users
DROP POLICY IF EXISTS "post_likes_select" ON public.post_likes;
CREATE POLICY "post_likes_select" ON public.post_likes
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "user_follows_select" ON public.user_follows;
CREATE POLICY "user_follows_select" ON public.user_follows
FOR SELECT TO authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- 4. HARDENED GET_NETWORK_FEED_V2 FUNCTION
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
  v_normalized_feed_type TEXT := COALESCE(LOWER(TRIM(p_feed_type)), 'all');
  v_result JSONB;
BEGIN
  -- Strict identity resolution: never trust caller-supplied p_user_id
  IF v_auth_uid IS NOT NULL THEN
    v_effective_user_id := v_auth_uid;
    v_is_admin := public.is_app_admin(v_auth_uid);
  ELSE
    v_effective_user_id := NULL;
    v_is_admin := false;
  END IF;

  -- Normalize aliases
  IF v_normalized_feed_type = 'following' THEN
    v_normalized_feed_type := 'connections';
  ELSIF v_normalized_feed_type = 'latest' THEN
    v_normalized_feed_type := 'all';
  END IF;

  WITH filtered_posts AS (
    SELECT 
      p.*,
      -- Compute dynamic engagement score for trending sorting
      (COALESCE(p.likes_count, 0) * 3 + COALESCE(p.comments_count, 0) * 5 + COALESCE(p.shares_count, 0) * 7) AS engagement_score
    FROM public.posts p
    WHERE
      (
        -- ---------------------------------------------------------------------
        -- FEED TYPE: 'drafts' (Owner-only drafts view)
        -- ---------------------------------------------------------------------
        (
          v_normalized_feed_type = 'drafts'
          AND v_effective_user_id IS NOT NULL
          AND p.status = 'draft'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND (p.author_id = v_effective_user_id OR p.user_id = v_effective_user_id)
        )
        OR
        -- ---------------------------------------------------------------------
        -- PUBLIC / FEED VIEW: ('all', 'trending', 'connections')
        -- In all standard feeds, drafts and deleted posts are STRICTLY EXCLUDED,
        -- even for the post owner and even for admins!
        -- ---------------------------------------------------------------------
        (
          v_normalized_feed_type IN ('all', 'trending', 'connections')
          AND p.status = 'published'
          AND (p.is_deleted IS NULL OR p.is_deleted = false)
          AND (
            -- Branch A: Public posts (accessible to everyone)
            (
              COALESCE(p.is_public, true) = true
              AND COALESCE(p.visibility, 'public') = 'public'
              AND (p.visibility IS NULL OR p.visibility NOT IN ('private', 'connections', 'followers'))
            )
            OR
            -- Branch B: Author's own published posts (including visibility='private')
            (
              v_effective_user_id IS NOT NULL
              AND (p.author_id = v_effective_user_id OR p.user_id = v_effective_user_id)
            )
            OR
            -- Branch C: Connections / Followers restricted posts
            (
              p.visibility IN ('connections', 'followers')
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
          )
        )
      )
      -- Connections tab filtering
      AND (
        v_normalized_feed_type <> 'connections'
        OR (
          v_effective_user_id IS NOT NULL
          AND (
            p.author_id = v_effective_user_id
            OR EXISTS (
              SELECT 1 FROM public.connections c
              WHERE ((c.requester_id = v_effective_user_id AND c.recipient_id = p.author_id)
                 OR (c.recipient_id = v_effective_user_id AND c.requester_id = p.author_id))
              AND c.status = 'accepted'
            )
            OR EXISTS (
              SELECT 1 FROM public.user_follows f
              WHERE f.follower_id = v_effective_user_id AND f.following_id = p.author_id
            )
          )
        )
      )
      -- Search filter
      AND (
        p_search IS NULL
        OR p_search = ''
        OR p.content ILIKE ('%' || p_search || '%')
        OR p.headline ILIKE ('%' || p_search || '%')
      )
    ORDER BY 
      CASE WHEN v_normalized_feed_type = 'trending' THEN (COALESCE(p.likes_count, 0) * 3 + COALESCE(p.comments_count, 0) * 5 + COALESCE(p.shares_count, 0) * 7) END DESC NULLS LAST,
      p.created_at DESC
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
          FROM public.public_profiles prof
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
    ORDER BY 
      CASE WHEN v_normalized_feed_type = 'trending' THEN ap.engagement_score END DESC NULLS LAST,
      ap.created_at DESC
  ) INTO v_result
  FROM aggregated_posts ap;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_network_feed_v2(UUID, INT, INT, TEXT, TEXT) TO anon, authenticated, service_role;
