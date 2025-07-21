
-- Extend public content views to support all content types
CREATE TABLE IF NOT EXISTS public.public_content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'post', 'job', 'company', 'service', 'course', 'college', 'resume', 'career_path', 'tool_result'
  content_id UUID NOT NULL,
  viewer_ip INET,
  viewer_location TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  view_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_content_views_content ON public.public_content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_public_content_views_date ON public.public_content_views(created_at);

-- Extend sharing analytics to support all content types
CREATE TABLE IF NOT EXISTS public.sharing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'whatsapp', 'telegram', 'linkedin', 'twitter', 'facebook', 'email', 'copy'
  share_url TEXT NOT NULL,
  shared_by UUID REFERENCES auth.users(id),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for sharing analytics
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_content ON public.sharing_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_platform ON public.sharing_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_date ON public.sharing_analytics(created_at);

-- Create public content settings for privacy controls
CREATE TABLE IF NOT EXISTS public.public_content_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  allow_indexing BOOLEAN DEFAULT true,
  custom_slug TEXT,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(content_type, content_id)
);

-- Add indexes for content settings
CREATE INDEX IF NOT EXISTS idx_public_content_settings_owner ON public.public_content_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_public_content_settings_public ON public.public_content_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_public_content_settings_slug ON public.public_content_settings(custom_slug);

-- Create function to track public content views
CREATE OR REPLACE FUNCTION public.track_public_content_view(
  p_content_type TEXT,
  p_content_id UUID,
  p_viewer_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  view_id UUID;
BEGIN
  INSERT INTO public.public_content_views (
    content_type,
    content_id,
    viewer_ip,
    user_agent,
    referrer,
    session_id
  ) VALUES (
    p_content_type,
    p_content_id,
    p_viewer_ip,
    p_user_agent,
    p_referrer,
    p_session_id
  ) RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track sharing analytics
CREATE OR REPLACE FUNCTION public.track_share_analytics(
  p_content_type TEXT,
  p_content_id TEXT,
  p_platform TEXT,
  p_share_url TEXT,
  p_shared_by UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
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
    p_content_id::UUID,
    p_platform,
    p_share_url,
    p_shared_by,
    p_referrer,
    p_user_agent
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.public_content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_content_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for public content views (allow all to insert for analytics)
CREATE POLICY "Allow public content view tracking" ON public.public_content_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view analytics of their content" ON public.public_content_views
  FOR SELECT TO authenticated
  USING (
    content_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
      UNION
      SELECT id FROM jobs WHERE created_by = auth.uid()
      UNION
      SELECT id FROM companies WHERE created_by = auth.uid()
      UNION
      SELECT id FROM resumes WHERE user_id = auth.uid()
      UNION
      SELECT id FROM courses WHERE created_by = auth.uid()
      UNION
      SELECT id FROM colleges WHERE created_by = auth.uid()
      UNION
      SELECT id FROM career_goals WHERE user_id = auth.uid()
    )
  );

-- RLS policies for sharing analytics
CREATE POLICY "Allow sharing analytics tracking" ON public.sharing_analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view sharing analytics of their content" ON public.sharing_analytics
  FOR SELECT TO authenticated
  USING (
    content_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
      UNION
      SELECT id FROM jobs WHERE created_by = auth.uid()
      UNION
      SELECT id FROM companies WHERE created_by = auth.uid()
      UNION
      SELECT id FROM resumes WHERE user_id = auth.uid()
      UNION
      SELECT id FROM courses WHERE created_by = auth.uid()
      UNION
      SELECT id FROM colleges WHERE created_by = auth.uid()
      UNION
      SELECT id FROM career_goals WHERE user_id = auth.uid()
    )
  );

-- RLS policies for public content settings
CREATE POLICY "Users can manage their content settings" ON public.public_content_settings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Public can view public content settings" ON public.public_content_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_public_content_settings_updated_at
  BEFORE UPDATE ON public.public_content_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
