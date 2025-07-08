-- Create team invitation requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.team_invitation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  requested_role TEXT NOT NULL DEFAULT 'recruiter',
  request_message TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_invitation_requests_company_id ON public.team_invitation_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_requests_status ON public.team_invitation_requests(status);
CREATE INDEX IF NOT EXISTS idx_team_invitation_requests_requested_by ON public.team_invitation_requests(requested_by);

-- Enable RLS
ALTER TABLE public.team_invitation_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can view invitation requests for their company" 
ON public.team_invitation_requests 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_team_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Team members can create invitation requests for their company" 
ON public.team_invitation_requests 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.company_team_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin', 'recruiter')
  )
  AND requested_by = auth.uid()
);

CREATE POLICY "Company admins can update invitation requests for their company" 
ON public.team_invitation_requests 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_team_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Requesters can view their own requests" 
ON public.team_invitation_requests 
FOR SELECT 
USING (requested_by = auth.uid());

-- Function to approve invitation request and create actual invitation
CREATE OR REPLACE FUNCTION public.approve_team_invitation_request(request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  invitation_token TEXT;
  result JSONB;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM public.team_invitation_requests
  WHERE id = request_id AND status = 'pending';
  
  IF request_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Check if user has permission to approve
  IF NOT EXISTS (
    SELECT 1 
    FROM public.company_team_members 
    WHERE company_id = request_record.company_id 
    AND user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Generate invitation token
  invitation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create actual team invitation
  INSERT INTO public.team_invitations (
    company_id,
    invited_email,
    invited_by,
    role,
    invitation_token,
    status,
    invited_at,
    expires_at
  ) VALUES (
    request_record.company_id,
    request_record.invited_email,
    auth.uid(),
    request_record.requested_role,
    invitation_token,
    'pending',
    now(),
    now() + INTERVAL '7 days'
  );
  
  -- Update request status
  UPDATE public.team_invitation_requests
  SET status = 'approved',
      approved_by = auth.uid(),
      approved_at = now(),
      updated_at = now()
  WHERE id = request_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'invitation_token', invitation_token,
    'message', 'Invitation approved and sent successfully'
  );
END;
$$;

-- Function to reject invitation request
CREATE OR REPLACE FUNCTION public.reject_team_invitation_request(request_id UUID, reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM public.team_invitation_requests
  WHERE id = request_id AND status = 'pending';
  
  IF request_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Check if user has permission to reject
  IF NOT EXISTS (
    SELECT 1 
    FROM public.company_team_members 
    WHERE company_id = request_record.company_id 
    AND user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Update request status
  UPDATE public.team_invitation_requests
  SET status = 'rejected',
      approved_by = auth.uid(),
      rejection_reason = reason,
      updated_at = now()
  WHERE id = request_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Invitation request rejected'
  );
END;
$$;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_team_invitation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_invitation_requests_updated_at
  BEFORE UPDATE ON public.team_invitation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_invitation_requests_updated_at();

-- Notification function for invitation requests
CREATE OR REPLACE FUNCTION public.notify_team_invitation_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify company admins about new invitation requests
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, is_read, created_at)
    SELECT 
      ctm.user_id,
      'invitation_request',
      'New Team Invitation Request',
      'Someone requested to invite ' || NEW.invited_email || ' as ' || NEW.requested_role,
      'employer',
      NEW.id,
      '/employer/team',
      'medium',
      'user-plus',
      false,
      now()
    FROM company_team_members ctm
    WHERE ctm.company_id = NEW.company_id 
    AND ctm.role IN ('owner', 'admin')
    AND ctm.is_active = true
    AND ctm.user_id != NEW.requested_by; -- Don't notify the requester
  END IF;
  
  -- Notify requester about approval/rejection
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message, module, related_id, link, priority, icon, is_read, created_at)
    VALUES (
      NEW.requested_by,
      CASE WHEN NEW.status = 'approved' THEN 'invitation_approved' ELSE 'invitation_rejected' END,
      CASE WHEN NEW.status = 'approved' THEN 'Invitation Request Approved' ELSE 'Invitation Request Rejected' END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your request to invite ' || NEW.invited_email || ' has been approved.'
        ELSE 'Your request to invite ' || NEW.invited_email || ' has been rejected. ' || COALESCE(NEW.rejection_reason, '')
      END,
      'employer',
      NEW.id,
      '/employer/team',
      CASE WHEN NEW.status = 'approved' THEN 'high' ELSE 'medium' END,
      CASE WHEN NEW.status = 'approved' THEN 'check-circle' ELSE 'x-circle' END,
      false,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_team_invitation_request
  AFTER INSERT OR UPDATE ON public.team_invitation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_team_invitation_request();