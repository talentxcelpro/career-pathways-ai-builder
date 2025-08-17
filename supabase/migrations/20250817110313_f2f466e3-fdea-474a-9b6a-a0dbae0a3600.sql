-- Enable better video/reels and social features

-- Create post_shares table for tracking shares
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  shared_to TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'whatsapp', 'copy_link'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comment_likes table for liking comments
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create post_bookmarks table for saving posts
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create video_views table for tracking video views
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID,
  ip_address INET,
  view_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_post_id ON public.video_views(post_id);
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON public.video_views(created_at);

-- Enable RLS
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_shares
CREATE POLICY "Users can manage their own shares" ON public.post_shares
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view shares for stats" ON public.post_shares
  FOR SELECT USING (true);

-- RLS Policies for comment_likes
CREATE POLICY "Users can manage their own comment likes" ON public.comment_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view comment likes for stats" ON public.comment_likes
  FOR SELECT USING (true);

-- RLS Policies for post_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.post_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for video_views
CREATE POLICY "Users can insert their own views" ON public.video_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Everyone can view video stats" ON public.video_views
  FOR SELECT USING (true);

-- Function to update post counters
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for counter updates
DROP TRIGGER IF EXISTS update_post_likes_counter ON public.post_likes;
CREATE TRIGGER update_post_likes_counter
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS update_post_comments_counter ON public.post_comments;
CREATE TRIGGER update_post_comments_counter
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

DROP TRIGGER IF EXISTS update_post_shares_counter ON public.post_shares;
CREATE TRIGGER update_post_shares_counter
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();