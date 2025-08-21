-- Core engagement system functions

-- Function to publish engagement events
CREATE OR REPLACE FUNCTION public.publish_engagement_event(
  p_event_type TEXT,
  p_actor_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_target_owner_id UUID,
  p_module TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_score_impact INTEGER DEFAULT 1
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_notification_id UUID;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_actor_name TEXT;
  v_target_url TEXT;
BEGIN
  -- Get actor name for notifications
  SELECT full_name INTO v_actor_name 
  FROM public.profiles 
  WHERE id = p_actor_id;
  
  IF v_actor_name IS NULL THEN
    v_actor_name := 'Someone';
  END IF;

  -- Insert engagement event
  INSERT INTO public.engagement_events (
    event_type, actor_id, target_type, target_id, target_owner_id, 
    module, metadata, score_impact
  ) VALUES (
    p_event_type, p_actor_id, p_target_type, p_target_id, p_target_owner_id,
    p_module, p_metadata, p_score_impact
  ) RETURNING id INTO v_event_id;

  -- Create notification if target has an owner (and it's not the actor)
  IF p_target_owner_id IS NOT NULL AND p_target_owner_id != p_actor_id THEN
    -- Generate notification content based on event type
    CASE p_event_type
      WHEN 'like' THEN
        v_notification_title := 'New Like';
        v_notification_message := v_actor_name || ' liked your ' || p_target_type;
        v_target_url := '/' || p_module || '/' || p_target_id;
      WHEN 'comment' THEN
        v_notification_title := 'New Comment';
        v_notification_message := v_actor_name || ' commented on your ' || p_target_type;
        v_target_url := '/' || p_module || '/' || p_target_id;
      WHEN 'share' THEN
        v_notification_title := 'Content Shared';
        v_notification_message := v_actor_name || ' shared your ' || p_target_type;
        v_target_url := '/' || p_module || '/' || p_target_id;
      WHEN 'follow' THEN
        v_notification_title := 'New Follower';
        v_notification_message := v_actor_name || ' started following you';
        v_target_url := '/profile/' || p_actor_id;
      WHEN 'mention' THEN
        v_notification_title := 'You were mentioned';
        v_notification_message := v_actor_name || ' mentioned you in a ' || p_target_type;
        v_target_url := '/' || p_module || '/' || p_target_id;
      WHEN 'apply' THEN
        v_notification_title := 'New Application';
        v_notification_message := v_actor_name || ' applied to your job posting';
        v_target_url := '/jobs/' || p_target_id;
      ELSE
        v_notification_title := 'New Activity';
        v_notification_message := v_actor_name || ' interacted with your ' || p_target_type;
        v_target_url := '/' || p_module || '/' || p_target_id;
    END CASE;

    -- Insert notification using existing notifications table
    INSERT INTO public.notifications (
      recipient_id, actor_id, notification_type, title, message,
      target_type, target_id, target_url, module, metadata
    ) VALUES (
      p_target_owner_id, p_actor_id, p_event_type, v_notification_title, v_notification_message,
      p_target_type, p_target_id, v_target_url, p_module, p_metadata
    ) RETURNING id INTO v_notification_id;
  END IF;

  -- Update content scores
  PERFORM public.update_content_score(p_target_type, p_target_id, p_module, p_event_type, p_score_impact);

  RETURN v_event_id;
END;
$$;

-- Function to update content scores
CREATE OR REPLACE FUNCTION public.update_content_score(
  p_content_type TEXT,
  p_content_id UUID,
  p_module TEXT,
  p_event_type TEXT,
  p_score_impact INTEGER DEFAULT 1
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score_increment NUMERIC := 0;
BEGIN
  -- Calculate score increment based on event type
  CASE p_event_type
    WHEN 'like' THEN v_score_increment := 1;
    WHEN 'comment' THEN v_score_increment := 3;
    WHEN 'share' THEN v_score_increment := 5;
    WHEN 'view' THEN v_score_increment := 0.1;
    WHEN 'apply' THEN v_score_increment := 10; -- High value for job applications
    WHEN 'enroll' THEN v_score_increment := 8; -- High value for course enrollments
    ELSE v_score_increment := 1;
  END CASE;

  -- Apply score impact multiplier
  v_score_increment := v_score_increment * p_score_impact;

  -- Upsert content score
  INSERT INTO public.content_scores (
    content_type, content_id, module, engagement_score, last_engagement_at,
    likes_count, comments_count, shares_count, views_count, applies_count, enrollments_count
  ) VALUES (
    p_content_type, p_content_id, p_module, v_score_increment, now(),
    CASE WHEN p_event_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'comment' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'share' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'apply' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'enroll' THEN 1 ELSE 0 END
  )
  ON CONFLICT (content_type, content_id, module) 
  DO UPDATE SET
    engagement_score = content_scores.engagement_score + v_score_increment,
    last_engagement_at = now(),
    updated_at = now(),
    likes_count = content_scores.likes_count + (CASE WHEN p_event_type = 'like' THEN 1 ELSE 0 END),
    comments_count = content_scores.comments_count + (CASE WHEN p_event_type = 'comment' THEN 1 ELSE 0 END),
    shares_count = content_scores.shares_count + (CASE WHEN p_event_type = 'share' THEN 1 ELSE 0 END),
    views_count = content_scores.views_count + (CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END),
    applies_count = content_scores.applies_count + (CASE WHEN p_event_type = 'apply' THEN 1 ELSE 0 END),
    enrollments_count = content_scores.enrollments_count + (CASE WHEN p_event_type = 'enroll' THEN 1 ELSE 0 END);
END;
$$;

-- Function to calculate time decay for content scores
CREATE OR REPLACE FUNCTION public.update_time_decay_scores()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.content_scores
  SET 
    time_decay_score = GREATEST(0, 
      EXTRACT(EPOCH FROM (now() - last_engagement_at)) / 3600 * 0.1 -- Decay by 0.1 per hour
    ),
    updated_at = now()
  WHERE last_engagement_at < now() - INTERVAL '1 hour';
END;
$$;

-- Function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_user_id UUID,
  p_is_online BOOLEAN DEFAULT true,
  p_current_module TEXT DEFAULT NULL,
  p_current_page TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'web'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_presence (
    user_id, is_online, last_seen, current_module, current_page, device_type
  ) VALUES (
    p_user_id, p_is_online, now(), p_current_module, p_current_page, p_device_type
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    is_online = p_is_online,
    last_seen = now(),
    current_module = COALESCE(p_current_module, user_presence.current_module),
    current_page = COALESCE(p_current_page, user_presence.current_page),
    device_type = COALESCE(p_device_type, user_presence.device_type),
    updated_at = now();
END;
$$;

-- Function to get ranked content for feeds
CREATE OR REPLACE FUNCTION public.get_ranked_content(
  p_module TEXT,
  p_content_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  content_id UUID,
  content_type TEXT,
  final_score NUMERIC,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  views_count INTEGER,
  last_engagement_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.content_id,
    cs.content_type,
    cs.final_score,
    cs.likes_count,
    cs.comments_count,
    cs.shares_count,
    cs.views_count,
    cs.last_engagement_at
  FROM public.content_scores cs
  WHERE 
    cs.module = p_module
    AND (p_content_type IS NULL OR cs.content_type = p_content_type)
  ORDER BY cs.final_score DESC, cs.last_engagement_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;