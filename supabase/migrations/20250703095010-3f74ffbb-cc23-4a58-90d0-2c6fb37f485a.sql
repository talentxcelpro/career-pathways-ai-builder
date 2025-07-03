-- Enable realtime for key tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.job_applications REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.employer_requests REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employer_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;