
-- First, let's create a more robust function to calculate profile completion
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_percentage(profile_row profiles)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  completion_score integer := 0;
  total_possible integer := 100;
BEGIN
  -- Basic info (40 points total)
  IF profile_row.full_name IS NOT NULL AND LENGTH(TRIM(profile_row.full_name)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_row.email IS NOT NULL AND LENGTH(TRIM(profile_row.email)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.title IS NOT NULL AND LENGTH(TRIM(profile_row.title)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Profile picture (15 points)
  IF profile_row.profile_picture_url IS NOT NULL AND LENGTH(TRIM(profile_row.profile_picture_url)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- About/Bio section (20 points)
  IF profile_row.about IS NOT NULL AND LENGTH(TRIM(profile_row.about)) >= 50 THEN
    completion_score := completion_score + 20;
  ELSIF profile_row.about IS NOT NULL AND LENGTH(TRIM(profile_row.about)) >= 20 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Location (10 points)
  IF profile_row.location IS NOT NULL AND LENGTH(TRIM(profile_row.location)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Skills (10 points)
  IF profile_row.skills IS NOT NULL AND array_length(profile_row.skills, 1) >= 3 THEN
    completion_score := completion_score + 10;
  ELSIF profile_row.skills IS NOT NULL AND array_length(profile_row.skills, 1) >= 1 THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Experience/Company (10 points)
  IF profile_row.current_company IS NOT NULL AND LENGTH(TRIM(profile_row.current_company)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN completion_score;
END;
$$;

-- Update function to set profile_completed based on completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  completion_percentage integer;
BEGIN
  -- Calculate completion percentage
  completion_percentage := public.calculate_profile_completion_percentage(NEW);
  
  -- Set profile_completed to true only if completion is 70% or higher
  NEW.profile_completed := completion_percentage >= 70;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update profile completion status
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion_status();

-- Fix existing user profiles by recalculating their completion status
UPDATE public.profiles 
SET profile_completed = (public.calculate_profile_completion_percentage(profiles.*) >= 70);

-- Create function to queue profile completion reminders for incomplete profiles
CREATE OR REPLACE FUNCTION public.queue_profile_completion_reminders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_count integer := 0;
  profile_record record;
BEGIN
  -- Find users with incomplete profiles who haven't received a reminder in the last 7 days
  FOR profile_record IN 
    SELECT p.id, p.email, p.full_name
    FROM public.profiles p
    WHERE p.profile_completed = false
    AND p.email IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.email_automation_queue eaq
      WHERE eaq.recipient_email = p.email
      AND eaq.trigger_type = 'profile_completion_reminder'
      AND eaq.created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    -- Queue profile completion reminder
    PERFORM public.queue_automated_email(
      'profile_completion_reminder',
      profile_record.email,
      COALESCE(profile_record.full_name, 'there'),
      jsonb_build_object(
        'name', COALESCE(profile_record.full_name, 'there'),
        'recipient_name', COALESCE(profile_record.full_name, 'there'),
        'user_id', profile_record.id
      ),
      0 -- Send immediately
    );
    
    reminder_count := reminder_count + 1;
  END LOOP;
  
  RETURN reminder_count;
END;
$$;

-- Add email delivery tracking table
CREATE TABLE IF NOT EXISTS public.email_delivery_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_queue_id UUID,
  message_id TEXT,
  recipient_email TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'sent',
  delivery_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bounce_reason TEXT,
  spam_score NUMERIC,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for email delivery tracking
ALTER TABLE public.email_delivery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for email delivery tracking
CREATE POLICY "Admins can manage email delivery tracking" 
ON public.email_delivery_tracking 
FOR ALL 
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can insert delivery tracking" 
ON public.email_delivery_tracking 
FOR INSERT 
WITH CHECK (true);

-- Create function to get profile completion insights
CREATE OR REPLACE FUNCTION public.get_profile_completion_insights()
RETURNS TABLE(
  total_users bigint,
  complete_profiles bigint,
  incomplete_profiles bigint,
  completion_rate numeric,
  avg_completion_score numeric,
  users_needing_reminders bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(CASE WHEN p.profile_completed = true THEN 1 END)::bigint as complete_profiles,
    COUNT(CASE WHEN p.profile_completed = false THEN 1 END)::bigint as incomplete_profiles,
    ROUND(
      (COUNT(CASE WHEN p.profile_completed = true THEN 1 END)::numeric / 
       NULLIF(COUNT(*)::numeric, 0)) * 100, 2
    ) as completion_rate,
    ROUND(AVG(public.calculate_profile_completion_percentage(p.*)), 2) as avg_completion_score,
    COUNT(CASE 
      WHEN p.profile_completed = false 
      AND NOT EXISTS (
        SELECT 1 FROM public.email_automation_queue eaq
        WHERE eaq.recipient_email = p.email
        AND eaq.trigger_type = 'profile_completion_reminder'
        AND eaq.created_at > NOW() - INTERVAL '7 days'
      ) THEN 1 
    END)::bigint as users_needing_reminders
  FROM public.profiles p
  WHERE p.email IS NOT NULL;
END;
$$;
