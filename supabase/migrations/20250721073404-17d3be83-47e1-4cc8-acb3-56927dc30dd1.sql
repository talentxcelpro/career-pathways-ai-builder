
-- Create public post access table for tracking public views
CREATE TABLE public.public_post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  viewer_ip INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  country_code TEXT,
  device_type TEXT
);

-- Create sharing analytics table
CREATE TABLE public.sharing_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'post', 'job', 'company', 'college', 'article', 'profile'
  content_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'whatsapp', 'telegram', 'linkedin', 'twitter', 'facebook', 'email', 'copy'
  shared_by UUID REFERENCES auth.users(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  share_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0
);

-- Create saved posts table (was missing)
CREATE TABLE public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Add RLS policies for public_post_views
ALTER TABLE public.public_post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert public post views" 
  ON public.public_post_views 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can view public post views" 
  ON public.public_post_views 
  FOR SELECT 
  USING (true);

-- Add RLS policies for sharing_analytics
ALTER TABLE public.sharing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert sharing analytics" 
  ON public.sharing_analytics 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view their own sharing analytics" 
  ON public.sharing_analytics 
  FOR SELECT 
  USING (shared_by = auth.uid());

CREATE POLICY "Admins can view all sharing analytics" 
  ON public.sharing_analytics 
  FOR SELECT 
  USING (is_app_admin(auth.uid()));

-- Add RLS policies for saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved posts" 
  ON public.saved_posts 
  FOR ALL 
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_public_post_views_post_id ON public.public_post_views(post_id);
CREATE INDEX idx_public_post_views_viewed_at ON public.public_post_views(viewed_at);
CREATE INDEX idx_sharing_analytics_content ON public.sharing_analytics(content_type, content_id);
CREATE INDEX idx_sharing_analytics_platform ON public.sharing_analytics(platform);
CREATE INDEX idx_sharing_analytics_shared_at ON public.sharing_analytics(shared_at);
CREATE INDEX idx_saved_posts_user_post ON public.saved_posts(user_id, post_id);

-- Add function to track public post views
CREATE OR REPLACE FUNCTION public.track_public_post_view(
  p_post_id UUID,
  p_viewer_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  view_id UUID;
BEGIN
  INSERT INTO public.public_post_views (
    post_id,
    viewer_ip,
    user_agent,
    referrer,
    session_id
  ) VALUES (
    p_post_id,
    p_viewer_ip,
    p_user_agent,
    p_referrer,
    p_session_id
  ) RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$;

-- Add function to track sharing analytics
CREATE OR REPLACE FUNCTION public.track_share_analytics(
  p_content_type TEXT,
  p_content_id UUID,
  p_platform TEXT,
  p_share_url TEXT,
  p_shared_by UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO public.sharing_analytics (
    content_type,
    content_id,
    platform,
    share_url,
    shared_by,
    referrer,
    user_agent
  ) VALUES (
    p_content_type,
    p_content_id,
    p_platform,
    p_share_url,
    p_shared_by,
    p_referrer,
    p_user_agent
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$;
