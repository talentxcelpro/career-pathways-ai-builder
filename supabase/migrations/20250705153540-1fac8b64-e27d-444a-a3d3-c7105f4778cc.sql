-- Create company posts table for content publishing
CREATE TABLE IF NOT EXISTS public.company_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'update',
  status TEXT NOT NULL DEFAULT 'draft',
  media_urls JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_posts_company_id ON public.company_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_posts_author_id ON public.company_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_company_posts_status ON public.company_posts(status);
CREATE INDEX IF NOT EXISTS idx_company_posts_published_at ON public.company_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_company_posts_post_type ON public.company_posts(post_type);

-- Enable RLS
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view published company posts" 
ON public.company_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Company team members can manage their company posts" 
ON public.company_posts 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_team_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin', 'recruiter')
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_company_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_company_posts_updated_at
  BEFORE UPDATE ON public.company_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_posts_updated_at();

-- Create company post interactions table
CREATE TABLE IF NOT EXISTS public.company_post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.company_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'view')),
  content TEXT, -- For comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Add indexes for interactions
CREATE INDEX IF NOT EXISTS idx_company_post_interactions_post_id ON public.company_post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_company_post_interactions_user_id ON public.company_post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_company_post_interactions_type ON public.company_post_interactions(interaction_type);

-- Enable RLS for interactions
ALTER TABLE public.company_post_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interactions
CREATE POLICY "Users can view interactions on published posts" 
ON public.company_post_interactions 
FOR SELECT 
USING (
  post_id IN (
    SELECT id FROM public.company_posts WHERE status = 'published'
  )
);

CREATE POLICY "Users can manage their own interactions" 
ON public.company_post_interactions 
FOR ALL 
USING (user_id = auth.uid());

-- Create function to update post stats
CREATE OR REPLACE FUNCTION public.update_company_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes count
  IF TG_TABLE_NAME = 'company_post_interactions' AND NEW.interaction_type = 'like' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.company_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.company_posts 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  -- Update comments count
  IF TG_TABLE_NAME = 'company_post_interactions' AND NEW.interaction_type = 'comment' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.company_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.company_posts 
      SET comments_count = GREATEST(comments_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  -- Update shares count
  IF TG_TABLE_NAME = 'company_post_interactions' AND NEW.interaction_type = 'share' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.company_posts 
      SET shares_count = shares_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.company_posts 
      SET shares_count = GREATEST(shares_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  -- Update views count
  IF TG_TABLE_NAME = 'company_post_interactions' AND NEW.interaction_type = 'view' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.company_posts 
      SET views_count = views_count + 1 
      WHERE id = NEW.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post stats
CREATE TRIGGER trigger_update_company_post_stats_insert
  AFTER INSERT ON public.company_post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_post_stats();

CREATE TRIGGER trigger_update_company_post_stats_delete
  AFTER DELETE ON public.company_post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_post_stats();