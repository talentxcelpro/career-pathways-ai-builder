-- Create functions for engagement features

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now()
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (
    user_id, notification_type, title, message, data, action_url, priority, scheduled_at
  ) VALUES (
    p_user_id, p_notification_type, p_title, p_message, p_data, p_action_url, p_priority, p_scheduled_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to award badges
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id UUID,
  p_badge_type TEXT,
  p_badge_name TEXT,
  p_description TEXT,
  p_points INTEGER DEFAULT 0,
  p_icon_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  badge_id UUID;
  existing_badge UUID;
BEGIN
  -- Check if user already has this badge
  SELECT id INTO existing_badge 
  FROM public.user_badges 
  WHERE user_id = p_user_id AND badge_type = p_badge_type;
  
  IF existing_badge IS NOT NULL THEN
    RETURN existing_badge;
  END IF;
  
  -- Award new badge
  INSERT INTO public.user_badges (
    user_id, badge_type, badge_name, description, points_awarded, icon_url, metadata
  ) VALUES (
    p_user_id, p_badge_type, p_badge_name, p_description, p_points, p_icon_url, p_metadata
  ) RETURNING id INTO badge_id;
  
  -- Create notification for badge award
  PERFORM public.create_notification(
    p_user_id,
    'badge_earned',
    'New Badge Earned!',
    'Congratulations! You earned the "' || p_badge_name || '" badge.',
    jsonb_build_object('badge_id', badge_id, 'points', p_points),
    '/achievements',
    'medium'
  );
  
  RETURN badge_id;
END;
$$;

-- Function to update engagement metrics
CREATE OR REPLACE FUNCTION public.update_engagement_metrics(
  p_user_id UUID,
  p_metric_type TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_engagement_metrics (
    user_id, metric_date, profile_views, job_applications, connections_made, 
    posts_created, learning_minutes, login_streak
  ) VALUES (
    p_user_id, CURRENT_DATE,
    CASE WHEN p_metric_type = 'profile_view' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'job_application' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'connection_made' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'post_created' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'learning_minutes' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'login' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, metric_date)
  DO UPDATE SET
    profile_views = user_engagement_metrics.profile_views + 
      CASE WHEN p_metric_type = 'profile_view' THEN p_increment ELSE 0 END,
    job_applications = user_engagement_metrics.job_applications + 
      CASE WHEN p_metric_type = 'job_application' THEN p_increment ELSE 0 END,
    connections_made = user_engagement_metrics.connections_made + 
      CASE WHEN p_metric_type = 'connection_made' THEN p_increment ELSE 0 END,
    posts_created = user_engagement_metrics.posts_created + 
      CASE WHEN p_metric_type = 'post_created' THEN p_increment ELSE 0 END,
    learning_minutes = user_engagement_metrics.learning_minutes + 
      CASE WHEN p_metric_type = 'learning_minutes' THEN p_increment ELSE 0 END,
    updated_at = now();
END;
$$;

-- Function to generate connection suggestions
CREATE OR REPLACE FUNCTION public.generate_connection_suggestions(p_user_id UUID)
RETURNS TABLE(
  suggested_user_id UUID,
  reason TEXT,
  score NUMERIC,
  common_connections INTEGER,
  common_skills TEXT[],
  common_companies TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT skills, company_name, location, university
    FROM public.profiles
    WHERE id = p_user_id
  ),
  user_connections AS (
    SELECT CASE 
      WHEN requester_id = p_user_id THEN recipient_id
      ELSE requester_id
    END as connected_user_id
    FROM public.connections
    WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
    AND status = 'accepted'
  ),
  potential_connections AS (
    SELECT 
      p.id,
      p.skills,
      p.company_name,
      p.location,
      p.university,
      -- Calculate common skills
      (
        SELECT array_agg(skill)
        FROM unnest(up.skills) AS skill
        WHERE skill = ANY(p.skills)
      ) as common_skills_arr,
      -- Calculate common companies
      CASE 
        WHEN p.company_name = up.company_name THEN ARRAY[p.company_name]
        ELSE ARRAY[]::TEXT[]
      END as common_companies_arr,
      -- Calculate common connections
      (
        SELECT COUNT(*)::INTEGER
        FROM user_connections uc1
        JOIN user_connections uc2 ON uc1.connected_user_id = uc2.connected_user_id
        WHERE uc2.connected_user_id = p.id
      ) as common_conn_count
    FROM public.profiles p
    CROSS JOIN user_profile up
    WHERE p.id != p_user_id
    AND p.id NOT IN (SELECT connected_user_id FROM user_connections)
    AND p.id NOT IN (SELECT suggested_user_id FROM public.connection_suggestions WHERE user_id = p_user_id AND is_dismissed = false)
  )
  SELECT 
    pc.id,
    CASE 
      WHEN array_length(pc.common_skills_arr, 1) > 0 THEN 'Common skills: ' || array_to_string(pc.common_skills_arr, ', ')
      WHEN array_length(pc.common_companies_arr, 1) > 0 THEN 'Works at ' || pc.company_name
      WHEN pc.common_conn_count > 0 THEN pc.common_conn_count || ' mutual connections'
      ELSE 'Similar profile'
    END,
    (
      COALESCE(array_length(pc.common_skills_arr, 1), 0) * 2 +
      COALESCE(array_length(pc.common_companies_arr, 1), 0) * 3 +
      pc.common_conn_count * 1.5
    )::NUMERIC,
    pc.common_conn_count,
    COALESCE(pc.common_skills_arr, ARRAY[]::TEXT[]),
    COALESCE(pc.common_companies_arr, ARRAY[]::TEXT[])
  FROM potential_connections pc
  ORDER BY 3 DESC
  LIMIT 10;
END;
$$;

-- Function to check and award achievement badges
CREATE OR REPLACE FUNCTION public.check_achievement_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_completion NUMERIC;
  connection_count INTEGER;
  application_count INTEGER;
  post_count INTEGER;
BEGIN
  -- Calculate profile completion
  SELECT 
    (CASE WHEN full_name IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN title IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN about IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN profile_picture_url IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN linkedin_url IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN location IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN array_length(skills, 1) > 0 THEN 1 ELSE 0 END) * 100.0 / 7
  INTO profile_completion
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get connection count
  SELECT COUNT(*) INTO connection_count
  FROM public.connections
  WHERE (requester_id = p_user_id OR recipient_id = p_user_id)
  AND status = 'accepted';
  
  -- Get application count
  SELECT COUNT(*) INTO application_count
  FROM public.job_applications
  WHERE user_id = p_user_id;
  
  -- Get post count
  SELECT COUNT(*) INTO post_count
  FROM public.posts
  WHERE author_id = p_user_id;
  
  -- Award badges based on achievements
  IF profile_completion >= 100 THEN
    PERFORM public.award_badge(p_user_id, 'profile_complete', 'Profile Master', 'Completed 100% of profile', 50);
  ELSIF profile_completion >= 80 THEN
    PERFORM public.award_badge(p_user_id, 'profile_80', 'Profile Builder', 'Completed 80% of profile', 30);
  END IF;
  
  IF connection_count >= 50 THEN
    PERFORM public.award_badge(p_user_id, 'networking_pro', 'Networking Pro', 'Connected with 50+ professionals', 100);
  ELSIF connection_count >= 10 THEN
    PERFORM public.award_badge(p_user_id, 'connector', 'Connector', 'Made 10+ connections', 50);
  ELSIF connection_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'first_connection', 'First Connection', 'Made your first connection', 20);
  END IF;
  
  IF application_count >= 50 THEN
    PERFORM public.award_badge(p_user_id, 'job_hunter', 'Job Hunter', 'Applied to 50+ jobs', 100);
  ELSIF application_count >= 10 THEN
    PERFORM public.award_badge(p_user_id, 'active_applicant', 'Active Applicant', 'Applied to 10+ jobs', 50);
  ELSIF application_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'first_application', 'First Application', 'Submitted your first job application', 20);
  END IF;
  
  IF post_count >= 10 THEN
    PERFORM public.award_badge(p_user_id, 'content_creator', 'Content Creator', 'Created 10+ posts', 75);
  ELSIF post_count >= 1 THEN
    PERFORM public.award_badge(p_user_id, 'first_post', 'First Post', 'Created your first post', 25);
  END IF;
END;
$$;

-- Insert some default career insights
INSERT INTO public.career_insights (title, content, insight_type, category, tags, is_trending) VALUES
('Top Skills for 2025', 'AI/ML, Cloud Computing, and Data Analysis continue to be the most in-demand skills. Consider upskilling in these areas to boost your career prospects.', 'trend', 'skills', ARRAY['ai', 'cloud', 'data', '2025'], true),
('Perfecting Your Resume', 'Keep your resume to 1-2 pages, use action verbs, and quantify your achievements. Tailor it for each job application to increase your chances.', 'tip', 'resume', ARRAY['resume', 'tips', 'job-search'], false),
('Ace Your Virtual Interview', 'Test your tech setup beforehand, maintain eye contact with the camera, and prepare examples using the STAR method (Situation, Task, Action, Result).', 'tip', 'interview', ARRAY['interview', 'virtual', 'tips'], true),
('Salary Negotiation Strategies', 'Research market rates, highlight your value, and be prepared to negotiate beyond just salary - consider benefits, PTO, and growth opportunities.', 'tip', 'career', ARRAY['salary', 'negotiation', 'career-growth'], false),
('The Future of Remote Work', 'Hybrid and remote work models are here to stay. Develop strong communication skills and invest in a good home office setup.', 'trend', 'workplace', ARRAY['remote-work', 'future', 'workplace'], true);

-- Create some initial groups
INSERT INTO public.groups (name, description, group_type, category, is_public, created_by) VALUES
('Software Engineers India', 'Connect with fellow software engineers across India. Share job opportunities, discuss tech trends, and grow your network.', 'industry', 'technology', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)),
('Product Managers Network', 'A community for product managers to share insights, best practices, and career advice.', 'industry', 'product', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)),
('Data Science Professionals', 'For data scientists, analysts, and ML engineers to discuss trends, tools, and opportunities.', 'industry', 'data-science', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)),
('Fresh Graduates 2025', 'A supportive community for recent graduates starting their career journey.', 'college', 'career-start', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)),
('Bangalore Tech Hub', 'Connect with tech professionals in Bangalore. Share local job opportunities and networking events.', 'location', 'bangalore', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1));