-- TalentXcel Multi-Agent System Database Schema (Updated)

-- Check if task_status enum exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM ('pending','running','completed','failed','canceled','deadletter');
  END IF;
END $$;

-- Check if task_kind enum exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_kind') THEN
    CREATE TYPE public.task_kind AS ENUM (
      'plan_content','generate_content','optimize_seo','publish_content',
      'post_community','match_jobs','career_advice','learning_path','support_reply',
      'mentor_match','platform_announcement'
    );
  END IF;
END $$;

-- Update existing ai_agents table to match the new schema
ALTER TABLE public.ai_agents 
ADD COLUMN IF NOT EXISTS handle text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS departments text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_domains text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tone text DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS assigned_to uuid;

-- Add unique constraint for handle if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_agents_handle_key') THEN
    ALTER TABLE public.ai_agents ADD CONSTRAINT ai_agents_handle_key UNIQUE (handle);
  END IF;
END $$;

-- Update existing agent_tasks table structure
ALTER TABLE public.agent_tasks 
ADD COLUMN IF NOT EXISTS kind task_kind,
ADD COLUMN IF NOT EXISTS priority int DEFAULT 5,
ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS error text,
ADD COLUMN IF NOT EXISTS attempts int DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts int DEFAULT 3,
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS started_at timestamptz,
ADD COLUMN IF NOT EXISTS finished_at timestamptz,
ADD COLUMN IF NOT EXISTS created_by uuid;

-- Update status column type if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agent_tasks' AND column_name = 'status' AND data_type != 'USER-DEFINED') THEN
    ALTER TABLE public.agent_tasks ALTER COLUMN status TYPE task_status USING status::task_status;
  END IF;
END $$;

-- Create agent_events table
CREATE TABLE IF NOT EXISTS public.agent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  origin text NOT NULL,
  ref_task uuid REFERENCES public.agent_tasks(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update ai_drafts table structure
ALTER TABLE public.ai_drafts 
ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.ai_agents(id),
ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.agent_tasks(id),
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS body_md text,
ADD COLUMN IF NOT EXISTS seo jsonb;

-- Update ai_published table structure  
ALTER TABLE public.ai_published 
ADD COLUMN IF NOT EXISTS draft_id uuid REFERENCES public.ai_drafts(id),
ADD COLUMN IF NOT EXISTS url text,
ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS mobile_alt_url text;

-- Create sitemap_queue table
CREATE TABLE IF NOT EXISTS public.sitemap_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  mobile_alt_url text,
  lastmod timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Update ai_metrics table structure
ALTER TABLE public.ai_metrics 
ADD COLUMN IF NOT EXISTS ref_url text;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status_sched ON public.agent_tasks (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.agent_tasks (priority ASC);
CREATE INDEX IF NOT EXISTS idx_events_topic ON public.agent_events (topic);
CREATE INDEX IF NOT EXISTS idx_published_url ON public.ai_published (url);
CREATE INDEX IF NOT EXISTS idx_sitemap_processed ON public.sitemap_queue (processed, kind);

-- Seed the 10 AI agents (update existing or insert new)
INSERT INTO public.ai_agents (handle, display_name, email, role, departments, content_domains, tone, frequency, status)
VALUES
('adminbot','Admin Bot','adminbot@talentxcel.in','Admin Bot',ARRAY['Entire Platform'],ARRAY['Platform Updates','System Announcements','General Information'],'informative','as_needed','active'),
('ananya','Ananya','ananya@talentxcel.in','Community Manager',ARRAY['Marketing','Community'],ARRAY['Community Posts','Engagement','Social Media'],'professional','weekly','active'),
('arjun','Arjun','arjun@talentxcel.in','Application Support Specialist',ARRAY['Technical Support','Applications'],ARRAY['Technical Help','Application Support','Troubleshooting'],'friendly','daily','active'),
('ishaan','Ishaan','ishaan@talentxcel.in','Career Coach (Pro)',ARRAY['Career Development','Coaching'],ARRAY['Career Advice','Resume Tips','Interview Prep'],'professional','daily','active'),
('meera','Meera','meera@talentxcel.in','Mentorship Coordinator',ARRAY['Mentorship','Guidance'],ARRAY['Mentorship Programs','Guidance','Professional Development'],'professional','daily','active'),
('nikki','Nikki','nikki@talentxcel.in','Learning Path Assistant',ARRAY['Learning','Education'],ARRAY['Learning Paths','Course Recommendations','Skill Development'],'professional','daily','active'),
('raj','Raj','raj@talentxcel.in','Job Matching AI',ARRAY['Job Matching','AI'],ARRAY['Job Matching','Career Recommendations','Job Alerts'],'professional','daily','active'),
('sana','Sana','sana@talentxcel.in','Content Creator',ARRAY['Marketing','Community'],ARRAY['Community Posts','Engagement','Social Media'],'professional','daily','active'),
('shelly','Shelly Kappor','shelly@talentxcel.in','Customer Service Representative',ARRAY['Customer Service','Support'],ARRAY['Customer Support','FAQ','Help Articles'],'professional','daily','active'),
('zoya','Zoya','zoya@talentxcel.in','Upskilling Advisor',ARRAY['Skills Development','Training'],ARRAY['Upskilling','Training Programs','Skill Assessment'],'professional','daily','active')
ON CONFLICT (handle) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  departments = EXCLUDED.departments,
  content_domains = EXCLUDED.content_domains,
  tone = EXCLUDED.tone,
  frequency = EXCLUDED.frequency,
  status = EXCLUDED.status;