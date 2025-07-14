-- Create table for storing user push notification tokens
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own push tokens" 
ON public.user_push_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create email notification settings table
CREATE TABLE IF NOT EXISTS public.email_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  push_on_welcome BOOLEAN NOT NULL DEFAULT true,
  push_on_application BOOLEAN NOT NULL DEFAULT true,
  push_on_connection BOOLEAN NOT NULL DEFAULT true,
  push_on_job_match BOOLEAN NOT NULL DEFAULT true,
  push_on_interview BOOLEAN NOT NULL DEFAULT true,
  push_on_team_invite BOOLEAN NOT NULL DEFAULT true,
  push_on_password_reset BOOLEAN NOT NULL DEFAULT false,
  push_on_monthly_digest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own notification settings" 
ON public.email_notification_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_email_notification_settings_updated_at
  BEFORE UPDATE ON public.email_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();