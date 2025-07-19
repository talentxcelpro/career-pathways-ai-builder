-- Delete all resumes for the current user
DELETE FROM public.resumes WHERE user_id = auth.uid();