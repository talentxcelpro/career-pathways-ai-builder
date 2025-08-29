-- Create candidate_communications table for tracking outreach
CREATE TABLE IF NOT EXISTS public.candidate_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  communication_type TEXT NOT NULL DEFAULT 'outreach_email',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own communications" 
ON public.candidate_communications 
FOR SELECT 
USING (sender_id = auth.uid());

CREATE POLICY "Users can create their own communications" 
ON public.candidate_communications 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_candidate_communications_sender ON public.candidate_communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_candidate_communications_created_at ON public.candidate_communications(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_candidate_communications_updated_at
BEFORE UPDATE ON public.candidate_communications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();