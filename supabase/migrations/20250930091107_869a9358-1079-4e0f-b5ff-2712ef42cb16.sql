-- Create email_queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_for timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_activation_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  cv_file_id uuid,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  activated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Add activation columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'activation_status') THEN
    ALTER TABLE public.profiles ADD COLUMN activation_status text DEFAULT 'activated' CHECK (activation_status IN ('pending', 'activated', 'expired'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cv_file_id') THEN
    ALTER TABLE public.profiles ADD COLUMN cv_file_id uuid;
  END IF;
END $$;