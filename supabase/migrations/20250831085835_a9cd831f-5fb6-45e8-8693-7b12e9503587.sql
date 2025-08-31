
-- 1) Generic likes table (used by reels UI)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('reel','post','video','comment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id, content_type)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Anyone can read likes'
  ) THEN
    CREATE POLICY "Anyone can read likes" ON public.likes
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Users can like/unlike as themselves'
  ) THEN
    CREATE POLICY "Users can like/unlike as themselves" ON public.likes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Users can delete their own likes'
  ) THEN
    CREATE POLICY "Users can delete their own likes" ON public.likes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Generic shares table (used by reels UI)
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('reel','post','video')),
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'shares' AND policyname = 'Anyone can read shares'
  ) THEN
    CREATE POLICY "Anyone can read shares" ON public.shares
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'shares' AND policyname = 'Users can insert own shares'
  ) THEN
    CREATE POLICY "Users can insert own shares" ON public.shares
      FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
  END IF;
END $$;

-- 3) Reel views normalization (unique pair for upsert)
-- Ensure table exists (some environments already created it)
CREATE TABLE IF NOT EXISTS public.reel_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id UUID NOT NULL,
  user_id UUID,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  duration_watched INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reel_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reel_views' AND policyname = 'Anyone can read reel views'
  ) THEN
    CREATE POLICY "Anyone can read reel views" ON public.reel_views
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reel_views' AND policyname = 'Users can insert their own reel views'
  ) THEN
    CREATE POLICY "Users can insert their own reel views" ON public.reel_views
      FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- Add unique constraint for upsert behavior used by increment_reel_view()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'reel_views' AND indexname = 'reel_views_reel_user_uniq'
  ) THEN
    CREATE UNIQUE INDEX reel_views_reel_user_uniq ON public.reel_views(reel_id, user_id);
  END IF;
END $$;

-- 4) Ensure reels has engagement counters expected by UI
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- 5) Trigger to keep views_count synced on inserts to reel_views (idempotent)
CREATE OR REPLACE FUNCTION public.update_reel_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.reels 
  SET views_count = (
    SELECT COUNT(*) FROM public.reel_views WHERE reel_id = NEW.reel_id
  )
  WHERE id = NEW.reel_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_reel_views_count ON public.reel_views;
CREATE TRIGGER trg_update_reel_views_count
  AFTER INSERT ON public.reel_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reel_views_count();

-- 6) Replace get_reel_feed to only return VIDEO reels and match UI fields
CREATE OR REPLACE FUNCTION public.get_reel_feed(
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 10,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  tags TEXT[],
  user_id UUID,
  created_at TIMESTAMPTZ,
  views_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  is_following BOOLEAN,
  has_liked BOOLEAN,
  user_name TEXT,
  user_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.video_url,
    r.thumbnail_url,
    r.duration_seconds,
    COALESCE(r.tags, '{}'::text[]) as tags,
    r.user_id,
    r.created_at,
    COALESCE(r.views_count, 0) as views_count,
    COALESCE(r.likes_count, 0) as likes_count,
    COALESCE(r.comments_count, 0) as comments_count,
    COALESCE(r.shares_count, 0) as shares_count,
    CASE 
      WHEN user_id_param IS NULL THEN FALSE
      ELSE EXISTS (
        SELECT 1 FROM public.follows f 
        WHERE f.follower_id = user_id_param AND f.following_id = r.user_id
      )
    END AS is_following,
    CASE 
      WHEN user_id_param IS NULL THEN FALSE
      ELSE EXISTS (
        SELECT 1 FROM public.likes l 
        WHERE l.user_id = user_id_param AND l.content_id = r.id AND l.content_type = 'reel'
      )
    END AS has_liked,
    COALESCE(p.full_name, 'Anonymous') as user_name,
    p.profile_picture_url as user_avatar
  FROM public.reels r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.status = 'published'
    AND r.video_url IS NOT NULL
  ORDER BY r.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- 7) Replace increment_reel_view with safe upsert and counter update
CREATE OR REPLACE FUNCTION public.increment_reel_view(
  reel_id_param UUID,
  user_id_param UUID DEFAULT NULL,
  duration_watched_param INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.reel_views (reel_id, user_id, duration_watched, completed, user_agent, ip_address)
  VALUES (
    reel_id_param,
    user_id_param,
    GREATEST(duration_watched_param, 0),
    (duration_watched_param > 5),
    current_setting('request.headers', true)::json->>'user-agent',
    inet_client_addr()
  )
  ON CONFLICT (reel_id, user_id)
  DO UPDATE SET 
    duration_watched = GREATEST(EXCLUDED.duration_watched, public.reel_views.duration_watched),
    completed = (EXCLUDED.duration_watched > 5),
    viewed_at = now();

  -- Keep counter in sync
  UPDATE public.reels 
  SET views_count = (
    SELECT COUNT(*) FROM public.reel_views WHERE reel_id = reel_id_param
  )
  WHERE id = reel_id_param;
END;
$$;

-- 8) Realtime: ensure full row images and publication
ALTER TABLE public.reels REPLICA IDENTITY FULL;
ALTER TABLE public.reel_views REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.shares REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reels;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reel_views'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reel_views;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'shares'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shares;
  END IF;
END $$;
