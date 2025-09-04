-- Create missing content_engagement table
CREATE TABLE public.content_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL, 
  content_type TEXT NOT NULL,
  engagement_type TEXT NOT NULL, -- like, share, view, comment
  engagement_value INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_engagement ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own engagement" 
ON public.content_engagement 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own engagement" 
ON public.content_engagement 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_content_engagement_user_id ON public.content_engagement(user_id);
CREATE INDEX idx_content_engagement_content_id ON public.content_engagement(content_id);
CREATE INDEX idx_content_engagement_type ON public.content_engagement(content_type, engagement_type);

-- Create trigger for updated_at
CREATE TRIGGER update_content_engagement_updated_at
BEFORE UPDATE ON public.content_engagement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();