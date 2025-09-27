-- Update some TalentXcel jobs to be featured for testing
UPDATE public.jobs 
SET is_featured = true
WHERE company_name = 'TalentXcel' 
AND id IN (
  SELECT id FROM public.jobs 
  WHERE company_name = 'TalentXcel' 
  ORDER BY created_at DESC 
  LIMIT 6
);