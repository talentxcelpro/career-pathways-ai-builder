-- Enable RLS on bot-related tables that are missing it
ALTER TABLE public.bot_content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_automation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_content_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bot_content_queue
CREATE POLICY "Admins can manage bot content queue" ON public.bot_content_queue
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view published bot content" ON public.bot_content_queue
FOR SELECT USING (status = 'published');

-- Create RLS policies for bot_prompt_library  
CREATE POLICY "Admins can manage bot prompt library" ON public.bot_prompt_library
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view active bot prompts" ON public.bot_prompt_library
FOR SELECT USING (is_active = true);

-- Create RLS policies for bot_automation_schedule
CREATE POLICY "Admins can manage bot automation schedule" ON public.bot_automation_schedule
FOR ALL USING (is_app_admin(auth.uid()));

-- Create RLS policies for bot_content_analytics
CREATE POLICY "Admins can manage bot content analytics" ON public.bot_content_analytics
FOR ALL USING (is_app_admin(auth.uid()));

CREATE POLICY "Anyone can view bot content analytics" ON public.bot_content_analytics
FOR SELECT USING (true);