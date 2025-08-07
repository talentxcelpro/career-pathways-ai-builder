-- Temporarily disable the career passport trigger to fix CV upload issues
DROP TRIGGER IF EXISTS trigger_create_career_passport ON public.profiles;

-- We'll create career passport records manually in the CV parser instead