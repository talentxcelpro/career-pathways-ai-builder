-- Create enhanced bot management tables for automated content generation (fixed)

-- Table for storing automation schedules
CREATE TABLE IF NOT EXISTS bot_automation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES ai_bots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('hourly', 'daily', 'weekly')), 
  frequency_value INTEGER NOT NULL DEFAULT 1,
  posts_per_cycle INTEGER NOT NULL DEFAULT 5,
  time_slots TEXT[] DEFAULT '{}',
  seo_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  next_execution_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for prompt library expansion
CREATE TABLE IF NOT EXISTS bot_prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES ai_bots(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  seo_focus TEXT[] DEFAULT '{}',
  engagement_type TEXT CHECK (engagement_type IN ('informational', 'motivational', 'question', 'tip', 'story', 'announcement')),
  priority INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  performance_score NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for content performance analytics
CREATE TABLE IF NOT EXISTS bot_content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES bot_generated_content(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES ai_bots(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES bot_prompt_library(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  click_through_rate NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  analytics_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for content queue management
CREATE TABLE IF NOT EXISTS bot_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES ai_bots(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES bot_prompt_library(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES bot_automation_schedule(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL DEFAULT 'post',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'generated', 'published', 'failed')),
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  generated_content TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_automation_schedule_bot_id ON bot_automation_schedule(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_automation_schedule_active ON bot_automation_schedule(is_active, next_execution_at);
CREATE INDEX IF NOT EXISTS idx_bot_prompt_library_bot_id ON bot_prompt_library(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_prompt_library_active ON bot_prompt_library(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_bot_content_analytics_bot_id ON bot_content_analytics(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_content_analytics_date ON bot_content_analytics(analytics_date);
CREATE INDEX IF NOT EXISTS idx_bot_content_queue_bot_id ON bot_content_queue(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_content_queue_status ON bot_content_queue(status, scheduled_for);

-- Enable RLS
ALTER TABLE bot_automation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_content_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage bot automation schedules" ON bot_automation_schedule FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage bot prompt library" ON bot_prompt_library FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can view bot content analytics" ON bot_content_analytics FOR SELECT TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "System can insert bot content analytics" ON bot_content_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage bot content queue" ON bot_content_queue FOR ALL TO authenticated USING (is_app_admin(auth.uid()));
CREATE POLICY "System can insert content queue" ON bot_content_queue FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_bot_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_bot_automation_schedule_updated_at
  BEFORE UPDATE ON bot_automation_schedule
  FOR EACH ROW EXECUTE FUNCTION update_bot_automation_updated_at();

CREATE TRIGGER update_bot_prompt_library_updated_at
  BEFORE UPDATE ON bot_prompt_library
  FOR EACH ROW EXECUTE FUNCTION update_bot_automation_updated_at();

CREATE TRIGGER update_bot_content_analytics_updated_at
  BEFORE UPDATE ON bot_content_analytics
  FOR EACH ROW EXECUTE FUNCTION update_bot_automation_updated_at();

CREATE TRIGGER update_bot_content_queue_updated_at
  BEFORE UPDATE ON bot_content_queue
  FOR EACH ROW EXECUTE FUNCTION update_bot_automation_updated_at();