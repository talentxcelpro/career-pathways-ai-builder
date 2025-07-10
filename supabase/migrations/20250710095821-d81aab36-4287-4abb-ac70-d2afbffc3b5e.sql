-- Remove the redundant trigger that's causing the status field error
DROP TRIGGER IF EXISTS notify_company_follows_trigger ON public.company_follows;