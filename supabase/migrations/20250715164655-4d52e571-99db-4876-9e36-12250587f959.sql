-- Add talentxcelpro@gmail.com as Elite Pro user
DO $$
DECLARE
  pro_user_id UUID;
  existing_subscription_id UUID;
  existing_role_id UUID;
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
    
    -- Check if subscription already exists
    SELECT id INTO existing_subscription_id
    FROM public.pro_subscriptions
    WHERE user_id = pro_user_id;
    
    IF existing_subscription_id IS NOT NULL THEN
      -- Update existing subscription
      UPDATE public.pro_subscriptions
      SET 
        plan_name = 'Elite',
        price_amount = 1999,
        currency = 'INR',
        status = 'active',
        started_at = now(),
        expires_at = '2030-12-31 23:59:59',
        features = '["service_pages", "profile_boosting", "crm_tools", "analytics", "priority_support", "custom_branding", "advanced_networking", "unlimited_posts", "ai_assistance", "marketplace_listing"]'::jsonb,
        updated_at = now()
      WHERE id = existing_subscription_id;
    ELSE
      -- Create new subscription
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
      );
    END IF;
    
    -- Check if admin role already exists
    SELECT id INTO existing_role_id
    FROM public.user_roles
    WHERE user_id = pro_user_id AND role = 'admin';
    
    IF existing_role_id IS NOT NULL THEN
      -- Update existing role
      UPDATE public.user_roles
      SET 
        is_active = true
      WHERE id = existing_role_id;
    ELSE
      -- Grant admin role
      INSERT INTO public.user_roles (
        user_id,
        role,
        is_active
      ) VALUES (
        pro_user_id,
        'admin',
        true
      );
    END IF;
    
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
      'system',
      'high',
      'crown',
      false,
      now()
    );
  END IF;
END $$;