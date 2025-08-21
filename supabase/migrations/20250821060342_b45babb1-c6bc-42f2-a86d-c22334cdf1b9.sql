-- Ensure unique constraints exist for ON CONFLICT usage in code
-- These guards prevent errors like: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- user_suggestions: ON CONFLICT (user_id, title)
DO $$
BEGIN
  IF to_regclass('public.user_suggestions') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS user_suggestions_user_id_title_uidx
      ON public.user_suggestions (user_id, title);
  END IF;
END $$;

-- smart_feed_preferences: ON CONFLICT (user_id)
DO $$
BEGIN
  IF to_regclass('public.smart_feed_preferences') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS smart_feed_preferences_user_id_uidx
      ON public.smart_feed_preferences (user_id);
  END IF;
END $$;

-- subscribers: ON CONFLICT (user_id)
DO $$
BEGIN
  IF to_regclass('public.subscribers') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS subscribers_user_id_uidx
      ON public.subscribers (user_id);
  END IF;
END $$;

-- seo_cache: ON CONFLICT (cache_key)
DO $$
BEGIN
  IF to_regclass('public.seo_cache') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS seo_cache_cache_key_uidx
      ON public.seo_cache (cache_key);
  END IF;
END $$;

-- email_analytics_daily: ON CONFLICT (stat_date)
DO $$
BEGIN
  IF to_regclass('public.email_analytics_daily') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS email_analytics_daily_stat_date_uidx
      ON public.email_analytics_daily (stat_date);
  END IF;
END $$;

-- user_skills: ON CONFLICT (user_id, skill_id)
DO $$
BEGIN
  IF to_regclass('public.user_skills') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS user_skills_user_id_skill_id_uidx
      ON public.user_skills (user_id, skill_id);
  END IF;
END $$;