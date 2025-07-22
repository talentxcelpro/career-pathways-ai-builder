
-- First, let's create the function to automatically create connections from admin accounts to new users
CREATE OR REPLACE FUNCTION public.create_admin_connections(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_ids UUID[] := ARRAY[
    '61b6d8bb-bbea-41c5-8ca4-152c4bc5d599'::uuid, -- talentxcelservices@gmail.com
    '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'::uuid, -- talentxcelpro@gmail.com
    '24d8c093-decd-4476-86c5-1c98a5448753'::uuid, -- viralpay2025@gmail.com
    'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'::uuid  -- talentxcelpro12@gmail.com
  ];
  admin_id UUID;
BEGIN
  -- Don't create connections if the target user is one of the admin accounts
  IF target_user_id = ANY(admin_ids) THEN
    RETURN;
  END IF;

  -- Create connection requests from each admin account to the target user
  FOREACH admin_id IN ARRAY admin_ids
  LOOP
    -- Check if connection already exists (in either direction)
    IF NOT EXISTS (
      SELECT 1 FROM public.connections
      WHERE (requester_id = admin_id AND recipient_id = target_user_id)
         OR (requester_id = target_user_id AND recipient_id = admin_id)
    ) THEN
      -- Create the connection request
      INSERT INTO public.connections (
        requester_id,
        recipient_id,
        status,
        message,
        created_at,
        updated_at
      ) VALUES (
        admin_id,
        target_user_id,
        'accepted', -- Auto-accept admin connections
        'Welcome to TalentXcel! We''re excited to have you in our community.',
        now(),
        now()
      );
      
      -- Set connected_at for accepted connections
      UPDATE public.connections 
      SET connected_at = now() 
      WHERE requester_id = admin_id AND recipient_id = target_user_id;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_connections()
RETURNS TRIGGER AS $$
BEGIN
  -- Create admin connections for the new user
  PERFORM public.create_admin_connections(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new profile is created
DROP TRIGGER IF EXISTS trigger_new_user_connections ON public.profiles;
CREATE TRIGGER trigger_new_user_connections
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_connections();

-- One-time backfill function for existing users
CREATE OR REPLACE FUNCTION public.backfill_admin_connections()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  admin_ids UUID[] := ARRAY[
    '61b6d8bb-bbea-41c5-8ca4-152c4bc5d599'::uuid, -- talentxcelservices@gmail.com
    '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'::uuid, -- talentxcelpro@gmail.com
    '24d8c093-decd-4476-86c5-1c98a5448753'::uuid, -- viralpay2025@gmail.com
    'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'::uuid  -- talentxcelpro12@gmail.com
  ];
  processed_count INTEGER := 0;
BEGIN
  -- Process all existing users except the admin accounts
  FOR user_record IN 
    SELECT id FROM public.profiles 
    WHERE id != ALL(admin_ids)
  LOOP
    -- Create admin connections for this user
    PERFORM public.create_admin_connections(user_record.id);
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- Execute the backfill function to create connections for existing users
SELECT public.backfill_admin_connections() as users_processed;
