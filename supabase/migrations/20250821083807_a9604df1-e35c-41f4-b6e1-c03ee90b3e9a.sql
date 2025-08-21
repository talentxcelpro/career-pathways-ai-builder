-- Core engagement and notification system for TalentXcel (building on existing schema)

-- Engagement events table (central event log)
CREATE TABLE public.engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'like', 'comment', 'share', 'follow', 'mention', 'view', 'apply', etc.
  actor_id UUID NOT NULL, -- who performed the action
  target_type TEXT NOT NULL, -- 'post', 'comment', 'profile', 'job', 'course', 'resume', etc.
  target_id UUID NOT NULL, -- the ID of the target object
  target_owner_id UUID, -- who owns the target (for notifications)
  module TEXT NOT NULL, -- 'network', 'jobs', 'learning', 'reels', 'resume', etc.
  metadata JSONB DEFAULT '{}', -- additional event data
  score_impact INTEGER DEFAULT 1, -- how much this affects content scoring
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE, -- for async processing
  is_active BOOLEAN DEFAULT true -- for soft deletes
);

-- Content scores table (for feed ranking)
CREATE TABLE public.content_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'post', 'job', 'course', etc.
  content_id UUID NOT NULL,
  module TEXT NOT NULL,
  base_score NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  time_decay_score NUMERIC DEFAULT 0,
  final_score NUMERIC GENERATED ALWAYS AS (base_score + engagement_score - time_decay_score) STORED,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  applies_count INTEGER DEFAULT 0, -- for jobs
  enrollments_count INTEGER DEFAULT 0, -- for courses
  last_engagement_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id, module)
);

-- User presence tracking
CREATE TABLE public.user_presence (
  user_id UUID NOT NULL PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_module TEXT, -- which part of app they're in
  current_page TEXT, -- specific page/route
  device_type TEXT DEFAULT 'web', -- 'web', 'mobile', 'app'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time subscriptions tracking
CREATE TABLE public.realtime_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  module TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, channel_name)
);

-- Add indexes for performance
CREATE INDEX idx_engagement_events_actor ON public.engagement_events(actor_id);
CREATE INDEX idx_engagement_events_target ON public.engagement_events(target_type, target_id);
CREATE INDEX idx_engagement_events_module ON public.engagement_events(module);
CREATE INDEX idx_engagement_events_created ON public.engagement_events(created_at DESC);

CREATE INDEX idx_content_scores_module ON public.content_scores(module);
CREATE INDEX idx_content_scores_final ON public.content_scores(final_score DESC);
CREATE INDEX idx_content_scores_content ON public.content_scores(content_type, content_id);

CREATE INDEX idx_user_presence_online ON public.user_presence(is_online) WHERE is_online = true;

-- Enable RLS
ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engagement_events
CREATE POLICY "Users can view engagement events" ON public.engagement_events
  FOR SELECT USING (true); -- Public events for feed ranking

CREATE POLICY "Users can create engagement events" ON public.engagement_events
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- RLS Policies for content_scores
CREATE POLICY "Everyone can view content scores" ON public.content_scores
  FOR SELECT USING (true); -- Needed for feed ranking

CREATE POLICY "System can manage content scores" ON public.content_scores
  FOR ALL USING (true); -- Will be managed by functions

-- RLS Policies for user_presence
CREATE POLICY "Users can view all presence" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for realtime_subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.realtime_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for all tables
ALTER TABLE public.engagement_events REPLICA IDENTITY FULL;
ALTER TABLE public.content_scores REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;