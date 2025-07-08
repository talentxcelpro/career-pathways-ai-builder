-- Update Arshid Hussain Wani's role to owner
UPDATE company_team_members 
SET role = 'owner'::team_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'arsh.wani@gmail.com')
  AND company_id = 'a1bedc12-66d9-4701-8acb-0024473eda6c'
  AND is_active = true;