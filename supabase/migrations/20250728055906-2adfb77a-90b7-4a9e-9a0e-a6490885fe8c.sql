-- Create user activities table for tracking all user interactions
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'profile_updated', 'post_created', 'post_liked', 'post_commented', 
    'connection_made', 'connection_requested', 'job_applied', 
    'course_enrolled', 'skill_added', 'resume_updated', 'profile_viewed'
  )),
  activity_title text NOT NULL,
  activity_description text,
  metadata jsonb DEFAULT '{}',
  related_entity_type text, -- 'post', 'user', 'job', 'course', etc.
  related_entity_id uuid,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public activities of others" 
ON public.user_activities 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view all their own activities" 
ON public.user_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_public ON public.user_activities(is_public, created_at DESC);

-- Function to create activity logs
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_title text,
  p_activity_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_related_entity_type text DEFAULT NULL,
  p_related_entity_id uuid DEFAULT NULL,
  p_is_public boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    metadata,
    related_entity_type,
    related_entity_id,
    is_public
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_metadata,
    p_related_entity_type,
    p_related_entity_id,
    p_is_public
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Update existing triggers to log activities

-- Profile updates
CREATE OR REPLACE FUNCTION public.log_profile_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log profile updates (except for login tracking)
  IF TG_OP = 'UPDATE' AND (
    OLD.full_name IS DISTINCT FROM NEW.full_name OR
    OLD.headline IS DISTINCT FROM NEW.headline OR
    OLD.about IS DISTINCT FROM NEW.about OR
    OLD.location IS DISTINCT FROM NEW.location OR
    OLD.profile_photo_url IS DISTINCT FROM NEW.profile_photo_url
  ) THEN
    PERFORM public.log_user_activity(
      NEW.id,
      'profile_updated',
      'Updated profile',
      'Made updates to their profile information',
      jsonb_build_object(
        'updated_fields', CASE
          WHEN OLD.full_name IS DISTINCT FROM NEW.full_name THEN jsonb_build_array('name')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.headline IS DISTINCT FROM NEW.headline THEN jsonb_build_array('headline')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.about IS DISTINCT FROM NEW.about THEN jsonb_build_array('about')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.location IS DISTINCT FROM NEW.location THEN jsonb_build_array('location')
          ELSE '[]'::jsonb
        END ||
        CASE
          WHEN OLD.profile_photo_url IS DISTINCT FROM NEW.profile_photo_url THEN jsonb_build_array('photo')
          ELSE '[]'::jsonb
        END
      ),
      'profile',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile activities
CREATE TRIGGER trigger_log_profile_activity
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_activity();

-- Post activities
CREATE OR REPLACE FUNCTION public.log_post_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_user_activity(
      NEW.author_id,
      'post_created',
      'Created a new post',
      CASE 
        WHEN NEW.title IS NOT NULL THEN 'Posted: "' || LEFT(NEW.title, 50) || '"'
        ELSE 'Shared a new post'
      END,
      jsonb_build_object(
        'post_type', COALESCE(NEW.post_type, 'general'),
        'has_media', (NEW.media_urls IS NOT NULL AND jsonb_array_length(NEW.media_urls) > 0)
      ),
      'post',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for post activities (if posts table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trigger_log_post_activity ON public.posts;
    CREATE TRIGGER trigger_log_post_activity
      AFTER INSERT ON public.posts
      FOR EACH ROW
      EXECUTE FUNCTION public.log_post_activity();
  END IF;
END;
$$;

-- Connection activities
CREATE OR REPLACE FUNCTION public.log_connection_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log connection request
    PERFORM public.log_user_activity(
      NEW.requester_id,
      'connection_requested',
      'Sent a connection request',
      'Sent a connection request to ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.recipient_id), 'someone'),
      jsonb_build_object('recipient_id', NEW.recipient_id),
      'connection',
      NEW.id,
      true
    );
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Log successful connection for both users
    PERFORM public.log_user_activity(
      NEW.requester_id,
      'connection_made',
      'Connected with a new professional',
      'Connected with ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.recipient_id), 'a professional'),
      jsonb_build_object('connected_with', NEW.recipient_id),
      'connection',
      NEW.id,
      true
    );
    
    PERFORM public.log_user_activity(
      NEW.recipient_id,
      'connection_made',
      'Connected with a new professional',
      'Connected with ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = NEW.requester_id), 'a professional'),
      jsonb_build_object('connected_with', NEW.requester_id),
      'connection',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for connection activities (if connections table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trigger_log_connection_activity ON public.connections;
    CREATE TRIGGER trigger_log_connection_activity
      AFTER INSERT OR UPDATE ON public.connections
      FOR EACH ROW
      EXECUTE FUNCTION public.log_connection_activity();
  END IF;
END;
$$;

-- Enable realtime for user_activities
ALTER TABLE public.user_activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;