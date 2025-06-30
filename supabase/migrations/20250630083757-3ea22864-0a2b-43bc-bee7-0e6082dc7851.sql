
-- Add auto-expiration logic for jobs (15 days from creation)
CREATE OR REPLACE FUNCTION set_job_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiration to 15 days from creation if not already set
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NEW.created_at + INTERVAL '15 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set expiration on job creation
CREATE TRIGGER trigger_set_job_expiration
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_expiration();

-- Create table for company access requests
CREATE TABLE public.company_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  requester_email TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_role TEXT DEFAULT 'recruiter' CHECK (requested_role IN ('admin', 'recruiter', 'hiring_manager', 'viewer')),
  request_message TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, company_id)
);

-- Add RLS policies for company access requests
ALTER TABLE public.company_access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own access requests"
  ON public.company_access_requests
  FOR SELECT
  USING (auth.uid() = requester_id);

-- Policy: Users can create access requests
CREATE POLICY "Users can create access requests"
  ON public.company_access_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Policy: Company admins can view requests for their company
CREATE POLICY "Company admins can view company requests"
  ON public.company_access_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm
      WHERE ctm.company_id = company_access_requests.company_id
      AND ctm.user_id = auth.uid()
      AND ctm.role IN ('owner', 'admin')
      AND ctm.is_active = true
    )
  );

-- Policy: Company admins can update requests for their company
CREATE POLICY "Company admins can update company requests"
  ON public.company_access_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm
      WHERE ctm.company_id = company_access_requests.company_id
      AND ctm.user_id = auth.uid()
      AND ctm.role IN ('owner', 'admin')
      AND ctm.is_active = true
    )
  );

-- Function to approve company access request
CREATE OR REPLACE FUNCTION approve_company_access_request(request_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  req_record RECORD;
BEGIN
  -- Get request details
  SELECT * INTO req_record
  FROM public.company_access_requests
  WHERE id = request_id AND status = 'pending';
  
  IF req_record IS NOT NULL THEN
    -- Update request status
    UPDATE public.company_access_requests
    SET status = 'approved',
        approved_by = auth.uid(),
        updated_at = now()
    WHERE id = request_id;
    
    -- Add user to company team
    INSERT INTO public.company_team_members (
      company_id,
      user_id,
      role,
      invited_by,
      joined_at,
      is_active
    ) VALUES (
      req_record.company_id,
      req_record.requester_id,
      req_record.requested_role::team_role,
      auth.uid(),
      now(),
      true
    );
    
    -- Update user profile to employer status
    UPDATE public.profiles
    SET is_employer = true,
        employer_status = 'approved',
        updated_at = now()
    WHERE id = req_record.requester_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reject company access request
CREATE OR REPLACE FUNCTION reject_company_access_request(request_id UUID, reason TEXT DEFAULT NULL)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.company_access_requests
  SET status = 'rejected',
      rejection_reason = reason,
      approved_by = auth.uid(),
      updated_at = now()
  WHERE id = request_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Function to extract domain from email
CREATE OR REPLACE FUNCTION get_email_domain(email_address TEXT)
RETURNS TEXT
AS $$
BEGIN
  RETURN LOWER(SPLIT_PART(email_address, '@', 2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
