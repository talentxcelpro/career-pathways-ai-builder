-- Create bot_wall table for manual and AI-generated posts
CREATE TABLE public.bot_wall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES public.ai_bots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('post', 'article', 'seo_page', 'newsletter')) DEFAULT 'post',
  source TEXT CHECK (source IN ('ai', 'manual')) DEFAULT 'manual',
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  is_draft BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_wall ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all wall posts" 
ON public.bot_wall 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view published wall posts" 
ON public.bot_wall 
FOR SELECT 
USING (published_at IS NOT NULL AND is_draft = false);

-- Create trigger for updated_at
CREATE TRIGGER update_bot_wall_updated_at
BEFORE UPDATE ON public.bot_wall
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_bot_wall_bot_id ON public.bot_wall(bot_id);
CREATE INDEX idx_bot_wall_published_at ON public.bot_wall(published_at DESC);
CREATE INDEX idx_bot_wall_source ON public.bot_wall(source);
CREATE INDEX idx_bot_wall_type ON public.bot_wall(type);