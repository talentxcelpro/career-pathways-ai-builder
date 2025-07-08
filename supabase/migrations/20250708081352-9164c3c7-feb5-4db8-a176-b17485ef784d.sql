-- Remove duplicate company with misspelled name
-- First remove team member relationship
DELETE FROM company_team_members 
WHERE company_id = '63281a09-6aa8-4d83-9ca4-98343506856f';

-- Remove company profile if exists
DELETE FROM company_profiles 
WHERE company_id = '63281a09-6aa8-4d83-9ca4-98343506856f';

-- Finally remove the duplicate company
DELETE FROM companies 
WHERE id = '63281a09-6aa8-4d83-9ca4-98343506856f' 
AND name = 'TalentXcel Sercices';