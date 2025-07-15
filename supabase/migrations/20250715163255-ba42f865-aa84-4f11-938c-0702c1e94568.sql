-- Set up talentxcelpro@gmail.com as a Pro user with complete access
-- Function to automatically grant Pro access to talentxcelpro@gmail.com
CREATE OR REPLACE FUNCTION public.setup_talentxcel_pro_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pro_user_id UUID;
BEGIN
  -- Find the user ID for talentxcelpro@gmail.com
  SELECT id INTO pro_user_id
  FROM auth.users
  WHERE email = 'talentxcelpro@gmail.com';
  
  -- Only proceed if the user exists
  IF pro_user_id IS NOT NULL THEN
    -- Update profile to Pro status
    UPDATE public.profiles
    SET 
      pro_status = 'active',
      pro_plan = 'Elite',
      pro_expires_at = '2030-12-31 23:59:59',
      is_employer = true,
      employer_status = 'approved',
      profile_completed = true,
      updated_at = now()
    WHERE id = pro_user_id;
    
    -- Create or update Pro subscription
    INSERT INTO public.pro_subscriptions (
      user_id,
      plan_name,
      price,
      status,
      started_at,
      expires_at,
      payment_method,
      payment_id,
      features
    ) VALUES (
      pro_user_id,
      'Elite',
      1999,
      'active',
      now(),
      '2030-12-31 23:59:59',
      'admin_grant',
      'admin_grant_' || extract(epoch from now()),
      '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb
    ) ON CONFLICT (user_id) DO UPDATE SET
      plan_name = 'Elite',
      price = 1999,
      status = 'active',
      started_at = now(),
      expires_at = '2030-12-31 23:59:59',
      features = '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb,
      updated_at = now();
    
    -- Grant admin role if not already present
    INSERT INTO public.user_roles (
      user_id,
      role,
      is_active,
      granted_by,
      granted_at
    ) VALUES (
      pro_user_id,
      'admin',
      true,
      pro_user_id,
      now()
    ) ON CONFLICT (user_id, role) DO UPDATE SET
      is_active = true,
      granted_at = now();
    
    -- Create notification for successful upgrade
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      module,
      priority,
      icon,
      is_read,
      created_at
    ) VALUES (
      pro_user_id,
      'system',
      'TalentXcel Pro Activated!',
      'Your account has been upgraded to Elite Pro with complete access to all features.',
      'pro',
      'high',
      'crown',
      false,
      now()
    );
  END IF;
END;
$$;

-- Execute the function to set up the pro user
SELECT public.setup_talentxcel_pro_user();

-- Create trigger to automatically upgrade talentxcelpro@gmail.com on signup
CREATE OR REPLACE FUNCTION public.auto_upgrade_talentxcel_pro()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is the talentxcelpro@gmail.com user
  IF NEW.email = 'talentxcelpro@gmail.com' THEN
    -- Set Pro status immediately
    NEW.pro_status = 'active';
    NEW.pro_plan = 'Elite';
    NEW.pro_expires_at = '2030-12-31 23:59:59';
    NEW.is_employer = true;
    NEW.employer_status = 'approved';
    NEW.profile_completed = true;
    
    -- Schedule the full setup to run after the profile is created
    PERFORM public.setup_talentxcel_pro_user();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS auto_upgrade_talentxcel_pro_trigger ON public.profiles;
CREATE TRIGGER auto_upgrade_talentxcel_pro_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_upgrade_talentxcel_pro();

-- Enhanced Pro user profile functions
CREATE OR REPLACE FUNCTION public.get_pro_user_features(user_uuid UUID)
RETURNS TABLE(
  feature_name TEXT,
  is_enabled BOOLEAN,
  usage_limit INTEGER,
  current_usage INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get user's pro plan and status
  SELECT pro_plan, pro_status INTO user_plan, user_status
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Return features based on plan
  IF user_status = 'active' THEN
    CASE user_plan
      WHEN 'Starter' THEN
        RETURN QUERY VALUES
          ('service_pages', true, 1, 0),
          ('profile_boosting', true, 5, 0),
          ('analytics', true, 1, 0),
          ('ai_assistance', true, 10, 0);
      WHEN 'Business' THEN
        RETURN QUERY VALUES
          ('service_pages', true, 3, 0),
          ('profile_boosting', true, 15, 0),
          ('crm_tools', true, 1, 0),
          ('analytics', true, 1, 0),
          ('priority_support', true, 1, 0),
          ('ai_assistance', true, 50, 0),
          ('marketplace_listing', true, 1, 0);
      WHEN 'Elite' THEN
        RETURN QUERY VALUES
          ('service_pages', true, -1, 0),
          ('profile_boosting', true, -1, 0),
          ('crm_tools', true, 1, 0),
          ('analytics', true, 1, 0),
          ('priority_support', true, 1, 0),
          ('custom_branding', true, 1, 0),
          ('advanced_networking', true, 1, 0),
          ('unlimited_posts', true, -1, 0),
          ('ai_assistance', true, -1, 0),
          ('marketplace_listing', true, 1, 0);
    END CASE;
  END IF;
  
  RETURN;
END;
$$;

-- Function to check if user has specific Pro feature
CREATE OR REPLACE FUNCTION public.has_pro_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.get_pro_user_features(user_uuid) AS f
    WHERE f.feature_name = has_pro_feature.feature_name AND f.is_enabled = true
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Enhanced Pro profile visibility function
CREATE OR REPLACE FUNCTION public.boost_pro_profile(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_pro BOOLEAN;
  boost_count INTEGER;
BEGIN
  -- Check if user is Pro
  SELECT public.is_pro_user(user_uuid) INTO is_pro;
  
  IF NOT is_pro THEN
    RETURN false;
  END IF;
  
  -- Update profile with boosting
  UPDATE public.profiles
  SET 
    profile_boosted = true,
    boost_expires_at = now() + INTERVAL '24 hours',
    boost_count = COALESCE(boost_count, 0) + 1,
    updated_at = now()
  WHERE id = user_uuid;
  
  -- Log the boost activity
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_data,
    created_at
  ) VALUES (
    user_uuid,
    'profile_boost',
    jsonb_build_object(
      'boost_type', 'pro_boost',
      'boost_duration', '24 hours',
      'boost_timestamp', now()
    ),
    now()
  );
  
  RETURN true;
END;
$$;

-- Add columns to profiles table for Pro enhancements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_boosted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boost_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_badge_style TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS custom_profile_url TEXT,
ADD COLUMN IF NOT EXISTS profile_priority INTEGER DEFAULT 0;

-- Create index for boosted profiles
CREATE INDEX IF NOT EXISTS idx_profiles_boosted ON public.profiles(profile_boosted, boost_expires_at) WHERE profile_boosted = true;

-- Create index for Pro users
CREATE INDEX IF NOT EXISTS idx_profiles_pro_status ON public.profiles(pro_status, pro_expires_at) WHERE pro_status = 'active';

-- Update RLS policies for enhanced Pro features
CREATE POLICY "Pro users can boost their profiles" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() AND 
  public.is_pro_user(auth.uid()) = true
)
WITH CHECK (
  id = auth.uid() AND 
  public.is_pro_user(auth.uid()) = true
);

-- Create activity logs table for Pro features
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity logs
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (public.is_app_admin(auth.uid()));

-- Create trigger to automatically expire boosts
CREATE OR REPLACE FUNCTION public.expire_profile_boosts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if boost has expired
  IF OLD.profile_boosted = true AND OLD.boost_expires_at <= now() THEN
    NEW.profile_boosted = false;
    NEW.boost_expires_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for boost expiration
DROP TRIGGER IF EXISTS expire_profile_boosts_trigger ON public.profiles;
CREATE TRIGGER expire_profile_boosts_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.expire_profile_boosts();