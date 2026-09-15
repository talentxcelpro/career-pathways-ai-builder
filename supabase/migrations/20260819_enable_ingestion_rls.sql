-- Enable Ingestion Policies for Supabase DB
DROP POLICY IF EXISTS "Public Ingest Courses" ON public.aggregated_courses;
CREATE POLICY "Public Ingest Courses" ON public.aggregated_courses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Manage Providers" ON public.learning_providers;
CREATE POLICY "Public Manage Providers" ON public.learning_providers FOR ALL USING (true);
