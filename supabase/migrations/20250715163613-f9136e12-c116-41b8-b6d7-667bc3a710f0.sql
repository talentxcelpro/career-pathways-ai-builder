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
      price_amount,
      currency,
      status,
      started_at,
      expires_at,
      razorpay_payment_id,
      features
    ) VALUES (
      pro_user_id,
      'Elite',
      1999,
      'INR',
      'active',
      now(),
      '2030-12-31 23:59:59',
      'admin_grant_' || extract(epoch from now()),
      '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb
    ) ON CONFLICT (user_id) DO UPDATE SET
      plan_name = 'Elite',
      price_amount = 1999,
      currency = 'INR',
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

-- Add columns to profiles table for Pro enhancements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_boosted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boost_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_badge_style TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS custom_profile_url TEXT,
ADD COLUMN IF NOT EXISTS profile_priority INTEGER DEFAULT 0;