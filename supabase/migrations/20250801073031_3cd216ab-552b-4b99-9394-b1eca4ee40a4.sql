-- Fix RLS policies for remaining tables only
CREATE POLICY "Admins can view SEO performance tracking"
ON public.seo_performance_tracking FOR SELECT
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert SEO performance data"
ON public.seo_performance_tracking FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage SEO bulk jobs"
ON public.seo_bulk_jobs FOR ALL
USING (is_app_admin(auth.uid()));