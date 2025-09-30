-- Create missing email automation queue table
CREATE TABLE IF NOT EXISTS public.email_automation_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  template_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Admin can manage email queue" 
ON public.email_automation_queue 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_automation_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON public.email_automation_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_automation_queue(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_email_automation_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_automation_queue_updated_at
  BEFORE UPDATE ON public.email_automation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_automation_queue_updated_at();