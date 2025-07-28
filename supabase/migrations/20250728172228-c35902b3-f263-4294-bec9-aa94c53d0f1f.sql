-- Create seo_generated_content table to store AI-generated SEO content
CREATE TABLE IF NOT EXISTS seo_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL, -- 'job_location', 'job_role', 'job_skill', 'company_location', 'salary', 'learning', 'industry'
    primary_slug TEXT NOT NULL,
    secondary_slug TEXT,
    tertiary_slug TEXT,
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    h1_title TEXT NOT NULL,
    intro_content TEXT NOT NULL,
    faqs JSONB DEFAULT '[]'::jsonb,
    structured_data JSONB DEFAULT '{}'::jsonb,
    content_blocks JSONB DEFAULT '{}'::jsonb,
    keywords TEXT[],
    last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    quality_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(page_type, primary_slug, secondary_slug, tertiary_slug)
);

-- Enable RLS
ALTER TABLE seo_generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active SEO content" ON seo_generated_content
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage SEO content" ON seo_generated_content
FOR ALL USING (is_app_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_seo_generated_content_updated_at
    BEFORE UPDATE ON seo_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create seo_page_combinations table to track all possible page combinations
CREATE TABLE IF NOT EXISTS seo_page_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL,
    url_pattern TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    estimated_traffic INTEGER DEFAULT 0,
    is_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE seo_page_combinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view page combinations" ON seo_page_combinations
FOR SELECT USING (true);

CREATE POLICY "Admins can manage page combinations" ON seo_page_combinations
FOR ALL USING (is_app_admin(auth.uid()));

-- Add trigger
CREATE TRIGGER update_seo_page_combinations_updated_at
    BEFORE UPDATE ON seo_page_combinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert only new skills that don't exist
INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active)
SELECT 'Angular', 'angular', 'Frontend', 'high', 5000, true
WHERE NOT EXISTS (SELECT 1 FROM seo_skills WHERE name = 'Angular');

INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active)
SELECT 'Vue.js', 'vuejs', 'Frontend', 'medium', 3000, true
WHERE NOT EXISTS (SELECT 1 FROM seo_skills WHERE name = 'Vue.js');

INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active)
SELECT 'TypeScript', 'typescript', 'Frontend', 'high', 7000, true
WHERE NOT EXISTS (SELECT 1 FROM seo_skills WHERE name = 'TypeScript');

INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active)
SELECT 'HTML5', 'html5', 'Frontend', 'high', 8000, true
WHERE NOT EXISTS (SELECT 1 FROM seo_skills WHERE name = 'HTML5');

INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active)
SELECT 'CSS3', 'css3', 'Frontend', 'high', 8000, true
WHERE NOT EXISTS (SELECT 1 FROM seo_skills WHERE name = 'CSS3');

-- Add the rest of the new skills
INSERT INTO seo_skills (name, slug, category, demand_level, job_count, is_active) VALUES
('Sass', 'sass', 'Frontend', 'medium', 3000, true),
('Tailwind CSS', 'tailwind-css', 'Frontend', 'high', 4000, true),
('Bootstrap', 'bootstrap', 'Frontend', 'medium', 3500, true),
('jQuery', 'jquery', 'Frontend', 'medium', 4000, true),
('Redux', 'redux', 'Frontend', 'high', 4500, true),
('Next.js', 'nextjs', 'Frontend', 'high', 3500, true),
('Nuxt.js', 'nuxtjs', 'Frontend', 'medium', 1500, true),
('Gatsby', 'gatsby', 'Frontend', 'low', 800, true),
('Svelte', 'svelte', 'Frontend', 'low', 600, true),
('Express.js', 'expressjs', 'Backend', 'high', 5000, true),
('Django', 'django', 'Backend', 'high', 4000, true),
('Flask', 'flask', 'Backend', 'medium', 2500, true),
('FastAPI', 'fastapi', 'Backend', 'high', 2000, true),
('Spring Boot', 'spring-boot', 'Backend', 'high', 4500, true),
('Laravel', 'laravel', 'Backend', 'medium', 3000, true),
('Ruby on Rails', 'ruby-on-rails', 'Backend', 'medium', 1500, true),
('ASP.NET', 'aspnet', 'Backend', 'medium', 2000, true),
('PHP', 'php', 'Backend', 'medium', 4000, true),
('C#', 'csharp', 'Backend', 'medium', 3000, true),
('Go', 'go', 'Backend', 'medium', 2000, true),
('Rust', 'rust', 'Backend', 'low', 800, true),
('Scala', 'scala', 'Backend', 'low', 1000, true),
('MongoDB', 'mongodb', 'Database', 'high', 6000, true),
('PostgreSQL', 'postgresql', 'Database', 'high', 5000, true),
('MySQL', 'mysql', 'Database', 'high', 7000, true),
('Redis', 'redis', 'Database', 'medium', 3000, true),
('Elasticsearch', 'elasticsearch', 'Database', 'medium', 2000, true),
('Azure', 'azure', 'Cloud', 'high', 5000, true),
('Jenkins', 'jenkins', 'DevOps', 'medium', 3000, true),
('Terraform', 'terraform', 'DevOps', 'high', 2000, true),
('TensorFlow', 'tensorflow', 'AI/ML', 'high', 3000, true),
('PyTorch', 'pytorch', 'AI/ML', 'high', 2500, true),
('Pandas', 'pandas', 'AI/ML', 'high', 3500, true),
('NumPy', 'numpy', 'AI/ML', 'high', 3000, true),
('Selenium', 'selenium', 'Testing', 'medium', 3000, true),
('Cypress', 'cypress', 'Testing', 'high', 2000, true),
('Jest', 'jest', 'Testing', 'medium', 2500, true),
('Git', 'git', 'Tools', 'high', 9000, true),
('GitHub', 'github', 'Tools', 'high', 8000, true),
('Jira', 'jira', 'Tools', 'high', 5000, true),
('GraphQL', 'graphql', 'API', 'high', 2500, true),
('REST API', 'rest-api', 'API', 'high', 6000, true),
('Microservices', 'microservices', 'Architecture', 'high', 3000, true),
('Serverless', 'serverless', 'Architecture', 'medium', 2000, true)
ON CONFLICT (name) DO NOTHING;