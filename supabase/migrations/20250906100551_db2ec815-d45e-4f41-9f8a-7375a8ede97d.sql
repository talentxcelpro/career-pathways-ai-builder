-- Create missing engagement tables for real-time interactions
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all likes" ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON public.post_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all comments" ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Users can manage their own shares" ON public.post_shares FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all shares" ON public.post_shares FOR SELECT USING (true);

CREATE POLICY "Users can manage their own saves" ON public.post_saves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all saves" ON public.post_saves FOR SELECT USING (true);

CREATE POLICY "Users can manage their own bookmarks" ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Enable real-time updates
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_shares REPLICA IDENTITY FULL;
ALTER TABLE public.post_saves REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_saves;

-- Function to increment post likes count
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$;