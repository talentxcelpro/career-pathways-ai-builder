-- Clean up duplicate invitations (keep only the latest one)
DELETE FROM team_invitations 
WHERE invited_email = 'arsh.wani@gmail.com' 
AND id NOT IN (
  SELECT id FROM team_invitations 
  WHERE invited_email = 'arsh.wani@gmail.com' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Accept the remaining invitation to create team membership
DO $$
DECLARE
  latest_invitation_id UUID;
  invitation_record RECORD;
BEGIN
  -- Get the latest invitation
  SELECT * INTO invitation_record
  FROM team_invitations 
  WHERE invited_email = 'arsh.wani@gmail.com'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Add user to team
  INSERT INTO company_team_members (
    company_id,
    user_id,
    role,
    invited_by,
    joined_at,
    is_active
  ) VALUES (
    invitation_record.company_id,
    (SELECT id FROM auth.users WHERE email = 'arsh.wani@gmail.com'),
    invitation_record.role::team_role,
    invitation_record.invited_by,
    now(),
    true
  );
  
  -- Update invitation status
  UPDATE team_invitations
  SET status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  WHERE id = invitation_record.id;
END $$;