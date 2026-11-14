-- ============================================================================
-- Migration: 20261114160000_txc_network_phase1_followup_hardening_rollback.sql
-- Module: TalentXcel Network Security Hardening (Phase 1 Fix-Forward Rollback)
-- Safety: Never restores USING (true) or unauthenticated PII leakage.
-- Maintains full JSON shape (author profile, counts, flags) without breaking UI.
-- ============================================================================

-- Fix-Forward safe baseline for get_network_feed_v2
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
  v_effective_user_id UUID := v_auth_uid;
  v_result JSONB;
BEGIN
  WITH filtered_posts AS (
    SELECT p.*
    FROM public.posts p
    WHERE
      p.status = 'published'
      AND (p.is_deleted IS NULL OR p.is_deleted = false)
      AND COALESCE(p.is_public, true) = true
      AND COALESCE(p.visibility, 'public') = 'public'
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
    ORDER BY ap.created_at DESC
  ) INTO v_result
  FROM aggregated_posts ap;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;
