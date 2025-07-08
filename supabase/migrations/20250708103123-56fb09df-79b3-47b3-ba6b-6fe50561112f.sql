-- Grant employer access to arsh.wani1@gmail.com user
-- Update profile to have employer status
UPDATE profiles 
SET is_employer = true, 
    employer_status = 'approved',
    updated_at = now()
WHERE email = 'arsh.wani1@gmail.com';

-- Add user to the same company as the owner if they want team access
-- First, let's add them as an admin to the company
INSERT INTO company_team_members (
  company_id,
  user_id,
  role,
  invited_by,
  joined_at,
  is_active
) VALUES (
  'a1bedc12-66d9-4701-8acb-0024473eda6c',
  '5ff9310f-316c-464c-aeb3-9a606a07bb4d',
  'admin'::team_role,
  '0951f595-abd6-4463-9d8b-58a6d0548fc7', -- invited by the current owner
  now(),
  true
) ON CONFLICT (company_id, user_id) DO UPDATE SET
  is_active = true,
  role = EXCLUDED.role,
  updated_at = now();