
-- Add foreign key relationships for job_applications table
ALTER TABLE public.job_applications 
ADD CONSTRAINT fk_job_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.job_applications 
ADD CONSTRAINT fk_job_applications_job_id 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

-- Add foreign key relationships for candidate_notes table
ALTER TABLE public.candidate_notes 
ADD CONSTRAINT fk_candidate_notes_author_id 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.candidate_notes 
ADD CONSTRAINT fk_candidate_notes_candidate_id 
FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.candidate_notes 
ADD CONSTRAINT fk_candidate_notes_job_id 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
