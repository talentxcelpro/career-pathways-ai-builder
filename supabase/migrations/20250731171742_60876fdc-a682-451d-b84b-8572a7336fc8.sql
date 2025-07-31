-- Enhanced content generation system tables

-- Update bot_content_templates to match the specification
ALTER TABLE bot_content_templates 
ADD COLUMN IF NOT EXISTS min_words INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS max_words INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Create content generation queue for automated processing
CREATE TABLE IF NOT EXISTS content_generation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES bot_content_templates(id),
  bot_id UUID REFERENCES ai_bots(id),
  content_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create published content tracking table
CREATE TABLE IF NOT EXISTS published_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES bot_generated_content(id),
  bot_id UUID REFERENCES ai_bots(id),
  publication_type TEXT NOT NULL, -- 'wall', 'feed', 'seo_page', 'newsletter'
  url TEXT,
  slug TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  engagement_metrics JSONB DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content automation schedule
CREATE TABLE IF NOT EXISTS content_automation_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  content_types TEXT[] NOT NULL,
  target_count_per_day INTEGER DEFAULT 100,
  distribution_rules JSONB DEFAULT '{}',
  bot_weights JSONB DEFAULT '{}', -- Which bots get how much content
  time_slots TEXT[] DEFAULT '{"09:00", "12:00", "15:00", "18:00", "21:00"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content performance analytics
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES bot_generated_content(id),
  metric_type TEXT NOT NULL, -- 'views', 'likes', 'shares', 'comments', 'clicks'
  metric_value INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE content_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_automation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage content generation queue" ON content_generation_queue
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage published content" ON published_content
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can manage automation schedule" ON content_automation_schedule
  FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Admins can view content analytics" ON content_analytics
  FOR ALL USING (is_app_admin(auth.uid()));

-- Allow public reading of published content for SEO pages
CREATE POLICY "Public can view published SEO content" ON published_content
  FOR SELECT USING (publication_type = 'seo_page');

-- Add updated_at triggers
CREATE TRIGGER update_content_generation_queue_updated_at
  BEFORE UPDATE ON content_generation_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_automation_schedule_updated_at
  BEFORE UPDATE ON content_automation_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default automation schedule
INSERT INTO content_automation_schedule (
  schedule_name,
  content_types,
  target_count_per_day,
  distribution_rules,
  bot_weights
) VALUES (
  'Daily Content Generation',
  ARRAY['post', 'article', 'seo_page', 'newsletter'],
  500,
  '{
    "post": {"percentage": 60, "word_range": [150, 200]},
    "article": {"percentage": 25, "word_range": [500, 700]},
    "seo_page": {"percentage": 12, "word_range": [500, 700]},
    "newsletter": {"percentage": 3, "word_range": [1000, 1500]}
  }'::jsonb,
  '{
    "equal_distribution": true,
    "exclude_admin_bot": true
  }'::jsonb
) ON CONFLICT DO NOTHING;