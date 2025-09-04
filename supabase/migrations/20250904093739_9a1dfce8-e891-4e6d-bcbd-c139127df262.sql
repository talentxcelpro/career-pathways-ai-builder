-- Batch 9: Enable RLS on tables missing Row Level Security

-- Enable RLS on critical tables that are missing it
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_task_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations_india ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations_international ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_cache ENABLE ROW LEVEL SECURITY;

-- Add policies for agent_performance
CREATE POLICY "Admins can view agent performance"
ON public.agent_performance
FOR SELECT
USING (is_current_user_admin());

-- Add policies for agent_task_summary  
CREATE POLICY "Admins can view task summary"
ON public.agent_task_summary
FOR SELECT
USING (is_current_user_admin());

-- Add policies for job_locations_india
CREATE POLICY "Anyone can view India job locations"
ON public.job_locations_india
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage India job locations"
ON public.job_locations_india
FOR ALL
USING (is_current_user_admin());

-- Add policies for job_locations_international
CREATE POLICY "Anyone can view international job locations"
ON public.job_locations_international
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage international job locations"
ON public.job_locations_international
FOR ALL
USING (is_current_user_admin());

-- Add policies for seo_content_cache
CREATE POLICY "Anyone can read SEO cache"
ON public.seo_content_cache
FOR SELECT
USING (true);

CREATE POLICY "System can manage SEO cache"
ON public.seo_content_cache
FOR ALL
USING (true);