-- Fix the get_profile_view_stats function
DROP FUNCTION IF EXISTS get_profile_view_stats(uuid);

CREATE OR REPLACE FUNCTION get_profile_view_stats(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_views', COUNT(*),
      'unique_viewers', COUNT(DISTINCT 
        CASE 
          WHEN viewer_id IS NOT NULL THEN viewer_id::text
          WHEN session_id IS NOT NULL THEN session_id
          WHEN ip_address IS NOT NULL THEN ip_address::text
          ELSE NULL
        END
      ),
      'today_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE),
      'week_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '7 days'),
      'month_views', COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - interval '30 days'),
      'avg_view_duration', COALESCE(AVG(view_duration_seconds) FILTER (WHERE view_duration_seconds > 0), 0)
    )
    FROM profile_views_v2
    WHERE profile_id = p_profile_id
  );
END;
$$;