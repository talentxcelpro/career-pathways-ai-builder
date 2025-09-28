-- Add only existing tables to realtime publication
-- Skip tables that don't exist

DO $$
BEGIN
    -- Add ai_career_recommendations if it exists and not already in publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_career_recommendations' AND table_schema = 'public') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE ai_career_recommendations;
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table already in publication
        END;
    END IF;
    
    -- Add ai_job_matches if it exists and not already in publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_job_matches' AND table_schema = 'public') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE ai_job_matches;
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table already in publication
        END;
    END IF;
    
    -- Add job_applications if it exists and not already in publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications' AND table_schema = 'public') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table already in publication
        END;
    END IF;
    
    -- Add notifications if it exists and not already in publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table already in publication
        END;
    END IF;
    
    -- Add user_activities if it exists and not already in publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities' AND table_schema = 'public') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE user_activities;
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Table already in publication
        END;
    END IF;
END $$;

-- Enable REPLICA IDENTITY FULL for existing tables only
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_career_recommendations' AND table_schema = 'public') THEN
        ALTER TABLE ai_career_recommendations REPLICA IDENTITY FULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_job_matches' AND table_schema = 'public') THEN
        ALTER TABLE ai_job_matches REPLICA IDENTITY FULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications' AND table_schema = 'public') THEN
        ALTER TABLE job_applications REPLICA IDENTITY FULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE notifications REPLICA IDENTITY FULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities' AND table_schema = 'public') THEN
        ALTER TABLE user_activities REPLICA IDENTITY FULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'txc_transactions' AND table_schema = 'public') THEN
        ALTER TABLE txc_transactions REPLICA IDENTITY FULL;
    END IF;
END $$;