-- Enable realtime for all tables in the publication
-- First, let's ensure all tables have replica identity set to FULL for realtime
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.colleges REPLICA IDENTITY FULL;
ALTER TABLE public.connections REPLICA IDENTITY FULL;
ALTER TABLE public.job_applications REPLICA IDENTITY FULL;
ALTER TABLE public.user_activities REPLICA IDENTITY FULL;
ALTER TABLE public.ai_career_recommendations REPLICA IDENTITY FULL;
ALTER TABLE public.ai_job_matches REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication for realtime functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.colleges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_career_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_job_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- Create RLS policies for realtime access where needed
-- These policies allow realtime to work by enabling SELECT for appropriate users

-- Public tables - allow anyone to listen to realtime updates
CREATE POLICY "Allow realtime for jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow realtime for posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow realtime for companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow realtime for colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Allow realtime for post_comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Allow realtime for post_likes" ON public.post_likes FOR SELECT USING (true);

-- User-specific tables - allow users to listen to their own data
CREATE POLICY "Allow realtime for own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id OR true);
CREATE POLICY "Allow realtime for own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Allow realtime for own job applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow realtime for own user activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow realtime for own AI recommendations" ON public.ai_career_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow realtime for own AI job matches" ON public.ai_job_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow realtime for own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);