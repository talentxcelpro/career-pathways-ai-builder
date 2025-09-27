-- Update all TalentXcel jobs to include company logo
UPDATE public.jobs 
SET organization_logo_url = '/src/assets/talentxcel-logo.png'
WHERE company_name = 'TalentXcel' 
AND (organization_logo_url IS NULL OR organization_logo_url = '');