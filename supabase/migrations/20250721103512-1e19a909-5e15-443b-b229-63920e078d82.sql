-- Update services to have published status
UPDATE public.services 
SET status = 'published' 
WHERE status IS NULL OR status != 'published';