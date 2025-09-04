-- Batch 19: Fix search_path for more functions from the provided context

-- From the provided database functions, fixing search_path for these functions
ALTER FUNCTION public.calculate_career_readiness_score(user_id_param uuid) SET search_path = public;
ALTER FUNCTION public.calculate_career_passport_completion(user_uuid uuid) SET search_path = public;
ALTER FUNCTION public.can_apply_to_job(job_uuid uuid) SET search_path = public;
ALTER FUNCTION public.can_user_assign_role(_assigner_id uuid, _target_role app_role) SET search_path = public;
ALTER FUNCTION public.claim_agent_task(task_id uuid) SET search_path = public;
ALTER FUNCTION public.claim_next_task() SET search_path = public;