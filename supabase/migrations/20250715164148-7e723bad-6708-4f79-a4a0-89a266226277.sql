-- Set up multiple users as Pro users with Elite access (simplified without notifications)
CREATE OR REPLACE FUNCTION public.setup_multiple_pro_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  pro_user_id UUID;
  user_emails TEXT[] := ARRAY[
    'arsh.wani1@gmail.com',
    'arsh.wani@gmail.com',
    'sanayah.arshid@gmail.com',
    'viralpay2025@gmail.com',
    'talentxcelpro12@gmail.com'
  ];
  existing_subscription_id UUID;
  existing_role_id UUID;
BEGIN
  -- Loop through each email and upgrade to Pro
  FOREACH user_email IN ARRAY user_emails
  LOOP
    -- Find the user ID for the current email
    SELECT id INTO pro_user_id
    FROM auth.users
    WHERE email = user_email;
    
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
      
      -- Check if role already exists
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
      
      -- Create notification for successful upgrade (using 'system' module)
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
  END LOOP;
END;
$$;

-- Execute the function to set up all pro users
SELECT public.setup_multiple_pro_users();