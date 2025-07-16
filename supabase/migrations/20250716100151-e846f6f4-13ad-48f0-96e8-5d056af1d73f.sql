-- Create smart_feed_preferences table
CREATE TABLE public.smart_feed_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content Types
  include_content_types text[] DEFAULT ARRAY['career_tips', 'job_posts', 'industry_news', 'peer_achievements', 'polls_opinions', 'skill_recommendations'],
  exclude_content_types text[] DEFAULT ARRAY[]::text[],
  
  -- Tags/Topics
  include_tags text[] DEFAULT ARRAY[]::text[],
  exclude_tags text[] DEFAULT ARRAY[]::text[],
  
  -- Industries and Roles
  preferred_industries text[] DEFAULT ARRAY[]::text[],
  preferred_roles text[] DEFAULT ARRAY[]::text[],
  
  -- Blocking
  blocked_users uuid[] DEFAULT ARRAY[]::uuid[],
  blocked_keywords text[] DEFAULT ARRAY[]::text[],
  
  -- Behavioral Settings
  prioritize_connections boolean DEFAULT true,
  show_trending_content boolean DEFAULT true,
  content_freshness_weight numeric DEFAULT 0.7,
  relevance_weight numeric DEFAULT 0.8,
  diversity_weight numeric DEFAULT 0.5,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure one record per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.smart_feed_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own smart feed preferences"
ON public.smart_feed_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_smart_feed_preferences_updated_at
  BEFORE UPDATE ON public.smart_feed_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add content_type to posts table for better categorization
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'general';

-- Add index for better performance
CREATE INDEX idx_smart_feed_preferences_user_id ON public.smart_feed_preferences(user_id);
CREATE INDEX idx_posts_content_type ON public.posts(content_type);
CREATE INDEX idx_posts_intent_tags ON public.posts USING GIN(intent_tags);