-- Add analytics and networking tables
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_views_count INTEGER DEFAULT 0,
  post_impressions_count INTEGER DEFAULT 0,
  connection_requests_sent INTEGER DEFAULT 0,
  connection_requests_received INTEGER DEFAULT 0,
  posts_this_month INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profile views tracking
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create communities/groups
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community memberships
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create connection suggestions
CREATE TABLE IF NOT EXISTS public.connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_reason TEXT,
  suggestion_score DECIMAL(3,2) DEFAULT 0.5,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, suggested_user_id)
);

-- Create user presence tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  activity TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON public.profile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_user ON public.profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community ON public.community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_connection_suggestions_user ON public.connection_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);

-- Enable RLS
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_analytics
CREATE POLICY "Users can view their own analytics" ON public.profile_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON public.profile_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.profile_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profile_views
CREATE POLICY "Users can view profile views of their profile" ON public.profile_views
  FOR SELECT USING (auth.uid() = viewed_user_id);

CREATE POLICY "Anyone can insert profile views" ON public.profile_views
  FOR INSERT WITH CHECK (true);

-- RLS Policies for communities
CREATE POLICY "Anyone can view public communities" ON public.communities
  FOR SELECT USING (NOT is_private OR EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = communities.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for community_memberships
CREATE POLICY "Members can view community memberships" ON public.community_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.community_memberships cm 
      WHERE cm.community_id = community_memberships.community_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join communities" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for connection_suggestions
CREATE POLICY "Users can view their own suggestions" ON public.connection_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" ON public.connection_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_presence
CREATE POLICY "Anyone can view user presence" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence" ON public.user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for analytics updates
CREATE OR REPLACE FUNCTION public.increment_profile_views(target_user_id UUID, viewer_ip INET DEFAULT NULL, viewer_agent TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_viewer_id UUID;
BEGIN
  current_viewer_id := auth.uid();
  
  -- Don't count self-views
  IF current_viewer_id = target_user_id THEN
    RETURN;
  END IF;
  
  -- Insert profile view record
  INSERT INTO public.profile_views (viewer_id, viewed_user_id, ip_address, user_agent)
  VALUES (current_viewer_id, target_user_id, viewer_ip, viewer_agent);
  
  -- Update analytics
  INSERT INTO public.profile_analytics (user_id, profile_views_count)
  VALUES (target_user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    profile_views_count = profile_analytics.profile_views_count + 1,
    last_updated = now();
END;
$$;

-- Function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence_status(
  p_user_id UUID, 
  p_is_online BOOLEAN, 
  p_status TEXT DEFAULT 'online',
  p_activity TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, status, activity, last_seen, updated_at)
  VALUES (p_user_id, p_is_online, p_status, p_activity, now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    is_online = p_is_online,
    status = p_status,
    activity = p_activity,
    last_seen = CASE WHEN p_is_online THEN now() ELSE user_presence.last_seen END,
    updated_at = now();
END;
$$;

-- Function to generate connection suggestions
CREATE OR REPLACE FUNCTION public.generate_connection_suggestions(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing suggestions
  DELETE FROM public.connection_suggestions WHERE user_id = p_user_id;
  
  -- Generate new suggestions based on mutual connections and similar profiles
  INSERT INTO public.connection_suggestions (user_id, suggested_user_id, suggestion_reason, suggestion_score)
  SELECT DISTINCT
    p_user_id,
    p.id,
    CASE 
      WHEN mutual_count > 0 THEN 'You have ' || mutual_count || ' mutual connections'
      ELSE 'Similar professional background'
    END,
    LEAST(1.0, 0.1 + (mutual_count * 0.2))
  FROM public.profiles p
  LEFT JOIN (
    -- Count mutual connections
    SELECT 
      target_user.id,
      COUNT(*) as mutual_count
    FROM public.profiles target_user
    JOIN public.connections c1 ON (
      (c1.requester_id = target_user.id OR c1.recipient_id = target_user.id)
      AND c1.status = 'accepted'
    )
    JOIN public.connections c2 ON (
      (c2.requester_id = p_user_id OR c2.recipient_id = p_user_id)
      AND c2.status = 'accepted'
      AND (
        (c1.requester_id = c2.requester_id AND c1.requester_id != p_user_id AND c1.requester_id != target_user.id) OR
        (c1.requester_id = c2.recipient_id AND c1.requester_id != p_user_id AND c1.requester_id != target_user.id) OR
        (c1.recipient_id = c2.requester_id AND c1.recipient_id != p_user_id AND c1.recipient_id != target_user.id) OR
        (c1.recipient_id = c2.recipient_id AND c1.recipient_id != p_user_id AND c1.recipient_id != target_user.id)
      )
    )
    WHERE target_user.id != p_user_id
    GROUP BY target_user.id
  ) mutual ON mutual.id = p.id
  WHERE p.id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.connections
      WHERE ((requester_id = p_user_id AND recipient_id = p.id) 
             OR (requester_id = p.id AND recipient_id = p_user_id))
    )
  ORDER BY COALESCE(mutual_count, 0) DESC, RANDOM()
  LIMIT 10;
END;
$$;