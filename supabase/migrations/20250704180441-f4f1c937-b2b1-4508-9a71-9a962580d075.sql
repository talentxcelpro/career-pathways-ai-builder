-- Create locations table for SEO pages
CREATE TABLE IF NOT EXISTS public.seo_locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'city',
  state TEXT,
  country TEXT DEFAULT 'India',
  is_active BOOLEAN DEFAULT TRUE,
  job_count INTEGER DEFAULT 0,
  company_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles table for SEO pages
CREATE TABLE IF NOT EXISTS public.seo_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  job_count INTEGER DEFAULT 0,
  avg_salary DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skills table for SEO pages
CREATE TABLE IF NOT EXISTS public.seo_skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  job_count INTEGER DEFAULT 0,
  demand_level TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning paths table
CREATE TABLE IF NOT EXISTS public.seo_learning_paths (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  level TEXT DEFAULT 'Beginner',
  description TEXT,
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  enrollment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create salary insights table
CREATE TABLE IF NOT EXISTS public.seo_salary_insights (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES seo_roles(id),
  location_id INTEGER REFERENCES seo_locations(id),
  avg_salary DECIMAL(10,2),
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  experience_level TEXT DEFAULT 'mid',
  data_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, location_id, experience_level)
);

-- Create SEO meta tags table
CREATE TABLE IF NOT EXISTS public.seo_meta_tags (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  image_url TEXT,
  canonical_url TEXT,
  entity_type TEXT, -- 'location', 'role', 'skill', 'learning', 'company'
  entity_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  click_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin flags table for featured/trending content
CREATE TABLE IF NOT EXISTS public.admin_content_flags (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  flag TEXT NOT NULL, -- 'featured', 'trending', 'top_10', 'hot'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(entity_type, entity_id, flag)
);

-- Enable RLS
ALTER TABLE public.seo_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_salary_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_meta_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access for SEO pages
CREATE POLICY "Public can view active SEO locations" ON public.seo_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active SEO roles" ON public.seo_roles FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active SEO skills" ON public.seo_skills FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active learning paths" ON public.seo_learning_paths FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view salary insights" ON public.seo_salary_insights FOR SELECT USING (true);
CREATE POLICY "Public can view active SEO meta tags" ON public.seo_meta_tags FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view content flags" ON public.admin_content_flags FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage SEO locations" ON public.seo_locations FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage SEO roles" ON public.seo_roles FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage SEO skills" ON public.seo_skills FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage learning paths" ON public.seo_learning_paths FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage salary insights" ON public.seo_salary_insights FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage SEO meta tags" ON public.seo_meta_tags FOR ALL USING (is_app_admin(auth.uid()));
CREATE POLICY "Admins can manage content flags" ON public.admin_content_flags FOR ALL USING (is_app_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_seo_locations_slug ON public.seo_locations(slug);
CREATE INDEX idx_seo_roles_slug ON public.seo_roles(slug);
CREATE INDEX idx_seo_skills_slug ON public.seo_skills(slug);
CREATE INDEX idx_seo_learning_paths_slug ON public.seo_learning_paths(slug);
CREATE INDEX idx_seo_meta_tags_path ON public.seo_meta_tags(path);
CREATE INDEX idx_admin_content_flags_entity ON public.admin_content_flags(entity_type, entity_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_locations_updated_at BEFORE UPDATE ON public.seo_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_roles_updated_at BEFORE UPDATE ON public.seo_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_skills_updated_at BEFORE UPDATE ON public.seo_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_learning_paths_updated_at BEFORE UPDATE ON public.seo_learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_meta_tags_updated_at BEFORE UPDATE ON public.seo_meta_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();