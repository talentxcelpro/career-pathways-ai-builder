-- Create push notification history table
CREATE TABLE IF NOT EXISTS public.push_notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  platform TEXT NOT NULL,
  trigger_type TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_notification_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own push notification history" 
ON public.push_notification_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert push notification history" 
ON public.push_notification_history 
FOR INSERT 
WITH CHECK (true);