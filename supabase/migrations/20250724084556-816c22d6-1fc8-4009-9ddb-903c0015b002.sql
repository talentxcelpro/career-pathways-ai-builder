-- Create career_articles table
CREATE TABLE public.career_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('Career Advice', 'Interview Tips', 'Resume Help', 'Skill Development', 'Industry Insights', 'Market Trends')),
  tags TEXT[],
  summary TEXT,
  content TEXT,
  author_name TEXT,
  read_time TEXT,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_prompts table for AI prompt history
CREATE TABLE public.admin_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  response TEXT,
  article_id UUID REFERENCES public.career_articles(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for career_articles
CREATE POLICY "Anyone can view published articles" 
ON public.career_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all articles" 
ON public.career_articles 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- RLS Policies for admin_prompts
CREATE POLICY "Admins can manage prompts" 
ON public.admin_prompts 
FOR ALL 
USING (is_app_admin(auth.uid()));

-- Create function to update views count
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.career_articles 
  SET views = views + 1 
  WHERE id = article_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate slug
CREATE OR REPLACE FUNCTION public.generate_article_slug(article_title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  base_slug := lower(regexp_replace(trim(article_title), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.career_articles WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slug trigger
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_article_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_article_slug_trigger
  BEFORE INSERT OR UPDATE ON public.career_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_article_slug();

-- Update timestamp trigger
CREATE TRIGGER update_career_articles_updated_at
  BEFORE UPDATE ON public.career_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();