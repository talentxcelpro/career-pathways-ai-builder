-- Create content generation queue table
CREATE TABLE public.content_generation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'article', 'seo_page', 'newsletter')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  prompt TEXT NOT NULL,
  target_audience TEXT,
  tone TEXT DEFAULT 'professional',
  keywords TEXT[],
  result TEXT,
  word_count INTEGER,
  error_message TEXT,
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_generation_queue ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins can manage content generation queue" 
ON public.content_generation_queue 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- System can update for processing
CREATE POLICY "System can update queue status" 
ON public.content_generation_queue 
FOR UPDATE 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_content_queue_status ON public.content_generation_queue(status);
CREATE INDEX idx_content_queue_scheduled ON public.content_generation_queue(scheduled_at);
CREATE INDEX idx_content_queue_bot_id ON public.content_generation_queue(bot_id);

-- Function to update timestamps
CREATE TRIGGER update_content_queue_updated_at
BEFORE UPDATE ON public.content_generation_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();