-- Create team invitations table for managing team member invites
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recruiter',
  status TEXT NOT NULL DEFAULT 'pending',
  invitation_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_company_id ON public.team_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company team members can view invitations" 
ON public.team_invitations 
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

CREATE POLICY "Company admins can create invitations" 
ON public.team_invitations 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.company_team_members 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('owner', 'admin')
  )
  AND invited_by = auth.uid()
);

CREATE POLICY "Company admins can update invitations" 
ON public.team_invitations 
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

CREATE POLICY "Invited users can view their own invitations" 
ON public.team_invitations 
FOR SELECT 
USING (
  invited_email IN (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
  result JSONB;
BEGIN
  -- Get current user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE invitation_token = accept_team_invitation.invitation_token
    AND status = 'pending'
    AND expires_at > now()
    AND invited_email = user_email;
  
  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Add user to team
  INSERT INTO public.company_team_members (
    company_id,
    user_id,
    role,
    invited_by,
    joined_at,
    is_active
  ) VALUES (
    invitation_record.company_id,
    auth.uid(),
    invitation_record.role::team_role,
    invitation_record.invited_by,
    now(),
    true
  );
  
  -- Update invitation status
  UPDATE public.team_invitations
  SET status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  WHERE id = invitation_record.id;
  
  -- Update user profile to employer status if not already
  UPDATE public.profiles
  SET is_employer = true,
      employer_status = 'approved',
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN jsonb_build_object(
    'success', true, 
    'company_id', invitation_record.company_id,
    'role', invitation_record.role
  );
END;
$$;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_invitations_updated_at();