-- Enable realtime for all TalentXcel tables
-- First, ensure the publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add all TalentXcel tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE 
  jobs,
  posts,
  profiles,
  companies,
  colleges,
  connections,
  job_applications,
  user_activities,
  ai_career_recommendations,
  ai_job_matches,
  messages,
  events,
  college_bookmarks,
  post_comments,
  post_likes;

-- Set replica identity to FULL for better realtime support
ALTER TABLE jobs REPLICA IDENTITY FULL;
ALTER TABLE posts REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE companies REPLICA IDENTITY FULL;
ALTER TABLE colleges REPLICA IDENTITY FULL;
ALTER TABLE connections REPLICA IDENTITY FULL;
ALTER TABLE job_applications REPLICA IDENTITY FULL;
ALTER TABLE user_activities REPLICA IDENTITY FULL;
ALTER TABLE ai_career_recommendations REPLICA IDENTITY FULL;
ALTER TABLE ai_job_matches REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE college_bookmarks REPLICA IDENTITY FULL;
ALTER TABLE post_comments REPLICA IDENTITY FULL;
ALTER TABLE post_likes REPLICA IDENTITY FULL;