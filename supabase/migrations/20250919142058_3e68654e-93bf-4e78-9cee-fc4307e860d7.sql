-- Add email notification settings for job applications
CREATE TABLE IF NOT EXISTS public.job_application_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL,
  application_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('application_received', 'status_updated', 'interview_scheduled')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.job_application_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification records" 
ON public.job_application_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Job posters can view notifications for their jobs" 
ON public.job_application_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_application_notifications.job_id 
    AND jobs.posted_by = auth.uid()
  )
);

CREATE POLICY "System can manage notifications" 
ON public.job_application_notifications 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_job_application_notifications_user_id ON public.job_application_notifications(user_id);
CREATE INDEX idx_job_application_notifications_job_id ON public.job_application_notifications(job_id);
CREATE INDEX idx_job_application_notifications_status ON public.job_application_notifications(status);
CREATE INDEX idx_job_application_notifications_created_at ON public.job_application_notifications(created_at);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_job_application_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_job_application_notifications_updated_at
  BEFORE UPDATE ON public.job_application_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_application_notifications_updated_at();

-- Add cover_letter_url column to job_applications if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_applications' 
    AND column_name = 'cover_letter_url'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN cover_letter_url TEXT;
  END IF;
END $$;

-- Create storage bucket for cover letters if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cover-letters', 'cover-letters', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for cover letters
CREATE POLICY "Users can upload their own cover letters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cover-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own cover letters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cover-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Job posters can view cover letters for their job applications" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'cover-letters' AND 
  EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.cover_letter_url = storage.objects.name
    AND j.posted_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own cover letters" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cover-letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover letters" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cover-letters' AND auth.uid()::text = (storage.foldername(name))[1]);