-- Add permissions column to company_team_members table
ALTER TABLE company_team_members 
ADD COLUMN permissions jsonb DEFAULT '{
  "view_analytics": true,
  "manage_jobs": true,
  "manage_team": false,
  "manage_billing": false,
  "manage_settings": false
}'::jsonb;

-- Update permissions for existing owners
UPDATE company_team_members 
SET permissions = '{
  "view_analytics": true,
  "manage_jobs": true,
  "manage_team": true,
  "manage_billing": true,
  "manage_settings": true
}'::jsonb
WHERE role = 'owner';

-- Update permissions for existing admins
UPDATE company_team_members 
SET permissions = '{
  "view_analytics": true,
  "manage_jobs": true,
  "manage_team": true,
  "manage_billing": false,
  "manage_settings": false
}'::jsonb
WHERE role = 'admin';

-- Add index for faster permission checks
CREATE INDEX idx_company_team_members_permissions ON company_team_members USING GIN (permissions);