
-- Create AI Agent Prompts table to store 500+ categorized prompts
CREATE TABLE public.ai_agent_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name text NOT NULL,
  prompt_title text NOT NULL,
  prompt_content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT ARRAY[]::text[],
  complexity_level text DEFAULT 'medium' CHECK (complexity_level IN ('easy', 'medium', 'advanced')),
  usage_count integer DEFAULT 0,
  success_rate numeric DEFAULT 0.0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create AI Agent Conversations table for persistent chat history
CREATE TABLE public.ai_agent_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_name text NOT NULL,
  conversation_title text DEFAULT 'New Conversation',
  messages jsonb DEFAULT '[]'::jsonb,
  context_data jsonb DEFAULT '{}'::jsonb,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create AI Agent Contexts table for cross-module context management
CREATE TABLE public.ai_agent_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  context_type text NOT NULL,
  context_key text NOT NULL,
  context_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, context_type, context_key)
);

-- Create AI Agent Recommendations table for intelligent suggestions
CREATE TABLE public.ai_agent_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  module_name text NOT NULL,
  recommendation_type text NOT NULL,
  recommendation_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_score numeric DEFAULT 0.0,
  priority integer DEFAULT 0,
  is_viewed boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create AI Agent Analytics table for usage tracking
CREATE TABLE public.ai_agent_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id uuid,
  module_name text NOT NULL,
  prompt_id uuid REFERENCES ai_agent_prompts(id),
  action_type text NOT NULL,
  action_data jsonb DEFAULT '{}'::jsonb,
  response_time_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agent_prompts
CREATE POLICY "Users can view active prompts" ON public.ai_agent_prompts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage prompts" ON public.ai_agent_prompts
  FOR ALL USING (is_app_admin(auth.uid()));

-- RLS Policies for ai_agent_conversations
CREATE POLICY "Users can manage their conversations" ON public.ai_agent_conversations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_agent_contexts
CREATE POLICY "Users can manage their contexts" ON public.ai_agent_contexts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_agent_recommendations
CREATE POLICY "Users can manage their recommendations" ON public.ai_agent_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_agent_analytics
CREATE POLICY "Users can view their analytics" ON public.ai_agent_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON public.ai_agent_analytics
  FOR INSERT WITH CHECK (true);

-- Insert initial prompts for Network module (30 prompts)
INSERT INTO public.ai_agent_prompts (module_name, prompt_title, prompt_content, category, tags) VALUES
('network', 'Connection Analysis', 'Analyze my network and suggest 5 influential people I should connect with based on my career goals.', 'analysis', ARRAY['connections', 'influence', 'career-goals']),
('network', 'Outreach Message', 'Write a high-engagement connection request message to a hiring manager in my field.', 'messaging', ARRAY['outreach', 'hiring-manager', 'engagement']),
('network', 'Referral Finder', 'Who in my network can refer me to product management roles in Bangalore?', 'referrals', ARRAY['referrals', 'product-management', 'location']),
('network', 'Activity Summary', 'Create a summary of my LinkedIn-like activity this month and its professional impact.', 'analytics', ARRAY['activity', 'impact', 'summary']),
('network', 'Community Suggestions', 'Suggest communities or groups where I can grow as a frontend developer.', 'growth', ARRAY['communities', 'frontend', 'growth']),
('network', 'Dormant Connections', 'Identify dormant connections that I should re-engage with professionally.', 're-engagement', ARRAY['dormant', 're-engagement', 'professional']),
('network', 'Network Benchmarking', 'Compare my professional network strength against industry benchmarks.', 'benchmarking', ARRAY['benchmarking', 'strength', 'industry']),
('network', 'Expansion Plan', 'Generate an outreach plan to expand my network in AI/ML within 30 days.', 'planning', ARRAY['expansion', 'ai-ml', 'planning']),
('network', 'FAANG Connections', 'Find people in my network working at FAANG companies.', 'company-search', ARRAY['faang', 'company', 'connections']),
('network', 'Content Analysis', 'What are the most liked posts in my network related to marketing?', 'content', ARRAY['posts', 'marketing', 'engagement']),
('network', 'Job Search Announcement', 'Generate a post to announce my job search to my network in a compelling way.', 'announcements', ARRAY['job-search', 'announcement', 'compelling']),
('network', 'Endorsement Thank You', 'Draft a message to thank someone for endorsing my skills.', 'gratitude', ARRAY['endorsement', 'gratitude', 'skills']),
('network', 'Networking Starters', 'List 10 meaningful conversation starters for networking events.', 'conversation', ARRAY['networking', 'conversation', 'events']),
('network', 'Mentor Simulation', 'Simulate a 1:1 conversation with a mentor in product management.', 'mentorship', ARRAY['mentorship', 'simulation', 'product-management']),
('network', 'Follow-up Message', 'Write a follow-up message after a virtual coffee chat.', 'follow-up', ARRAY['follow-up', 'coffee-chat', 'virtual']),
('network', 'Influence Scoring', 'Score the top 10 people in my network for their influence.', 'scoring', ARRAY['influence', 'scoring', 'ranking']),
('network', 'Recruiter Content', 'Generate content ideas I can post to attract recruiters.', 'content-strategy', ARRAY['recruiters', 'content', 'attraction']),
('network', 'Engagement Strategy', 'Highlight my most engaged posts and suggest content strategies.', 'strategy', ARRAY['engagement', 'strategy', 'content']),
('network', 'Alumni Network', 'Find peers from my college who are in executive roles.', 'alumni', ARRAY['alumni', 'executive', 'college']),
('network', 'Profile Viewer Response', 'Suggest a personalized message to a recruiter who viewed my profile.', 'response', ARRAY['profile-viewer', 'recruiter', 'personalized']),
('network', 'Connection Impact', 'Predict how connecting with [person] might impact my reach.', 'prediction', ARRAY['impact', 'prediction', 'reach']),
('network', 'Mutual Connections', 'Analyze mutual connections with a specific company's hiring team.', 'analysis', ARRAY['mutual', 'hiring-team', 'company']),
('network', 'Elevator Pitch', 'Craft an elevator pitch for a professional networking event.', 'pitch', ARRAY['elevator-pitch', 'networking', 'professional']),
('network', 'Keyword Analysis', 'What top keywords do my connections use in their titles?', 'keywords', ARRAY['keywords', 'titles', 'analysis']),
('network', 'Weak Ties', 'Identify 3 weak ties that could unlock new job leads.', 'weak-ties', ARRAY['weak-ties', 'job-leads', 'opportunities']),
('network', 'Introvert Strategies', 'Recommend network-building strategies specific to introverts.', 'strategies', ARRAY['introvert', 'strategies', 'building']),
('network', 'Local Events', 'Based on my interests, which local offline events should I attend?', 'events', ARRAY['local', 'events', 'offline']),
('network', 'Weekly Plan', 'Create a 7-day plan to boost my network score.', 'planning', ARRAY['weekly', 'boost', 'score']),
('network', 'Collaboration Potential', 'Evaluate who in my network is most likely to collaborate on a project.', 'collaboration', ARRAY['collaboration', 'project', 'evaluation']),
('network', 'Classmate Reconnect', 'Suggest a DM message to re-engage with an old classmate in tech.', 'reconnect', ARRAY['classmate', 'tech', 'dm']);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_agent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_agent_prompts_updated_at
  BEFORE UPDATE ON ai_agent_prompts
  FOR EACH ROW EXECUTE FUNCTION update_ai_agent_updated_at();

CREATE TRIGGER ai_agent_conversations_updated_at
  BEFORE UPDATE ON ai_agent_conversations
  FOR EACH ROW EXECUTE FUNCTION update_ai_agent_updated_at();

CREATE TRIGGER ai_agent_contexts_updated_at
  BEFORE UPDATE ON ai_agent_contexts
  FOR EACH ROW EXECUTE FUNCTION update_ai_agent_updated_at();

CREATE TRIGGER ai_agent_recommendations_updated_at
  BEFORE UPDATE ON ai_agent_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_ai_agent_updated_at();

-- Create indexes for performance
CREATE INDEX idx_ai_agent_prompts_module ON ai_agent_prompts(module_name) WHERE is_active = true;
CREATE INDEX idx_ai_agent_conversations_user ON ai_agent_conversations(user_id, created_at DESC);
CREATE INDEX idx_ai_agent_contexts_user_type ON ai_agent_contexts(user_id, context_type);
CREATE INDEX idx_ai_agent_recommendations_user ON ai_agent_recommendations(user_id, created_at DESC) WHERE is_dismissed = false;
CREATE INDEX idx_ai_agent_analytics_user_module ON ai_agent_analytics(user_id, module_name, created_at DESC);
