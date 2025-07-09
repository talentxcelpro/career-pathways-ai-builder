-- Create email queue table for reliable email processing
CREATE TABLE public.email_queue_simple (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  template_name TEXT,
  template_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue_simple ENABLE ROW LEVEL SECURITY;

-- Create policies for email queue
CREATE POLICY "Users can insert their own emails" 
ON public.email_queue_simple 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own emails" 
ON public.email_queue_simple 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_queue_simple_updated_at
BEFORE UPDATE ON public.email_queue_simple
FOR EACH ROW
EXECUTE FUNCTION public.update_email_queue_updated_at();