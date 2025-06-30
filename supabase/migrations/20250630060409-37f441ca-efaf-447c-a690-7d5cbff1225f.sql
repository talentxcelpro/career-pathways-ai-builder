
-- Add employer-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_employer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS employer_status TEXT DEFAULT 'pending';

-- Create employer_requests table for access requests
CREATE TABLE IF NOT EXISTS public.employer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_logo_url TEXT,
  company_description TEXT,
  hiring_reason TEXT,
  linkedin_profile TEXT,
  gst_number TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, more_info_needed
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employer_requests_user_id ON public.employer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_requests_status ON public.employer_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_employer ON public.profiles(is_employer, employer_status);

-- Enable RLS on employer_requests table
ALTER TABLE public.employer_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own requests
CREATE POLICY "Users can view their own employer requests"
  ON public.employer_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can create their own requests
CREATE POLICY "Users can create employer requests"
  ON public.employer_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own pending requests
CREATE POLICY "Users can update their own pending requests"
  ON public.employer_requests
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Function to update employer status after approval
CREATE OR REPLACE FUNCTION public.approve_employer_request(request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  req_user_id UUID;
BEGIN
  -- Get the user_id from the request
  SELECT user_id INTO req_user_id
  FROM public.employer_requests
  WHERE id = request_id AND status = 'pending';
  
  IF req_user_id IS NOT NULL THEN
    -- Update the request status
    UPDATE public.employer_requests
    SET status = 'approved',
        approved_by = auth.uid(),
        updated_at = now()
    WHERE id = request_id;
    
    -- Update the user's employer status
    UPDATE public.profiles
    SET is_employer = true,
        employer_status = 'approved',
        updated_at = now()
    WHERE id = req_user_id;
  END IF;
END;
$$;

-- Function to reject employer request
CREATE OR REPLACE FUNCTION public.reject_employer_request(request_id UUID, reason TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.employer_requests
  SET status = 'rejected',
      rejection_reason = reason,
      approved_by = auth.uid(),
      updated_at = now()
  WHERE id = request_id AND status = 'pending';
END;
$$;
