-- Phase 3: Real-time Communication & Messaging
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type text NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'channel'
  name text,
  description text,
  avatar_url text,
  is_private boolean DEFAULT true,
  max_members integer DEFAULT 50,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at timestamp with time zone DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  is_muted boolean DEFAULT false,
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  message_type text DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  media_urls text[],
  metadata jsonb DEFAULT '{}',
  edited_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Phase 4: AI Content Recommendations
CREATE TABLE IF NOT EXISTS public.content_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL, -- 'post', 'user', 'job', 'event'
  content_id uuid NOT NULL,
  recommendation_type text NOT NULL, -- 'trending', 'personalized', 'similar', 'network'
  score numeric(5,2) DEFAULT 0,
  confidence_level text DEFAULT 'medium',
  reasoning jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days')
);

CREATE TABLE IF NOT EXISTS public.user_content_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  signal_type text NOT NULL, -- 'view', 'like', 'share', 'comment', 'skip', 'hide'
  signal_strength numeric(3,2) DEFAULT 1.0, -- -1.0 to 1.0
  context_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Phase 5: Advanced Analytics
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date date DEFAULT CURRENT_DATE,
  posts_created integer DEFAULT 0,
  posts_liked integer DEFAULT 0,
  posts_shared integer DEFAULT 0,
  comments_made integer DEFAULT 0,
  connections_made integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  search_queries integer DEFAULT 0,
  session_duration_minutes integer DEFAULT 0,
  features_used jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

CREATE TABLE IF NOT EXISTS public.network_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date DEFAULT CURRENT_DATE,
  dimensions jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Phase 6: Content Moderation
CREATE TABLE IF NOT EXISTS public.content_moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status text DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
  ai_confidence numeric(3,2),
  ai_flags jsonb DEFAULT '{}',
  moderator_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type text NOT NULL,
  severity text DEFAULT 'medium',
  content_id uuid,
  description text,
  action_taken text,
  created_at timestamp with time zone DEFAULT now()
);

-- Phase 7: Professional Network Features
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_message text,
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
  expertise_areas text[],
  duration_weeks integer DEFAULT 12,
  meeting_frequency text DEFAULT 'weekly',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  endorsement_strength integer DEFAULT 1, -- 1-5 scale
  context_note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endorser_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.professional_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  date_achieved date,
  verification_status text DEFAULT 'unverified',
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility text DEFAULT 'public',
  created_at timestamp with time zone DEFAULT now()
);

-- Phase 8: Performance & Integration
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  response_time_ms integer,
  status_code integer,
  error_message text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0,
  target_audience jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_user_score ON public.content_recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_user_content_signals_user_type ON public.user_content_signals(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_user_date ON public.user_engagement_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status_priority ON public.content_moderation_queue(status, priority);

-- RLS Policies
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Chat RLS Policies
CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room participants can view participants" ON public.chat_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp2 
      WHERE cp2.room_id = room_id AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

-- Content recommendations policies
CREATE POLICY "Users can view their recommendations" ON public.content_recommendations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage recommendations" ON public.content_recommendations
  FOR ALL USING (true);

-- User signals policies
CREATE POLICY "Users can manage their signals" ON public.user_content_signals
  FOR ALL USING (user_id = auth.uid());

-- Analytics policies
CREATE POLICY "Users can view their metrics" ON public.user_engagement_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage metrics" ON public.user_engagement_metrics
  FOR ALL USING (true);

CREATE POLICY "Admins can view network analytics" ON public.network_analytics
  FOR SELECT USING (is_app_admin(auth.uid()));

-- Moderation policies
CREATE POLICY "Users can report content" ON public.content_moderation_queue
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Moderators can manage queue" ON public.content_moderation_queue
  FOR ALL USING (is_app_admin(auth.uid()));

-- Professional features policies
CREATE POLICY "Users can manage mentorship requests" ON public.mentorship_requests
  FOR ALL USING (mentee_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Users can view endorsements" ON public.skill_endorsements
  FOR SELECT USING (true);

CREATE POLICY "Users can endorse others" ON public.skill_endorsements
  FOR INSERT WITH CHECK (endorser_id = auth.uid());

CREATE POLICY "Users can manage their achievements" ON public.professional_achievements
  FOR ALL USING (user_id = auth.uid());

-- Feature flags policies
CREATE POLICY "Anyone can view active feature flags" ON public.feature_flags
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (is_app_admin(auth.uid()));

-- Utility functions
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  views_count integer DEFAULT 0
) RETURNS numeric AS $$
BEGIN
  RETURN (
    COALESCE(likes_count, 0) * 1.0 +
    COALESCE(comments_count, 0) * 2.0 +
    COALESCE(shares_count, 0) * 3.0 +
    COALESCE(views_count, 0) * 0.1
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_interaction(
  p_user_id uuid,
  p_content_type text,
  p_content_id uuid,
  p_interaction_type text,
  p_weight numeric DEFAULT 1.0
) RETURNS void AS $$
BEGIN
  INSERT INTO public.user_interactions (user_id, content_type, content_id, interaction_type, weight)
  VALUES (p_user_id, p_content_type, p_content_id, p_interaction_type, p_weight)
  ON CONFLICT (user_id, content_type, content_id, interaction_type)
  DO UPDATE SET 
    weight = user_interactions.weight + p_weight,
    last_interaction = now();
END;
$$ LANGUAGE plpgsql;