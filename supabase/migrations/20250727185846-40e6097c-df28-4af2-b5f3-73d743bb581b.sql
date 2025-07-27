-- Set REPLICA IDENTITY FULL for realtime tables to enable complete row data capture
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.job_applications REPLICA IDENTITY FULL;
ALTER TABLE public.job_views REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.employer_requests REPLICA IDENTITY FULL;
ALTER TABLE public.company_access_requests REPLICA IDENTITY FULL;
ALTER TABLE public.admin_activity_log REPLICA IDENTITY FULL;