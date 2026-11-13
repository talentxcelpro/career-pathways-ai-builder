-- Rollback Migration: 20261114000000_production_disk_io_and_performance_optimization_rollback.sql

-- 1. Re-add tables to supabase_realtime
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.jobs,
  public.content_scores,
  public.company_realtime_metrics,
  public.claim1_listings,
  public.txc_transactions,
  public.user_presence,
  public.ai_job_matches,
  public.ai_career_recommendations;

-- 2. Drop composite notifications index
DROP INDEX IF EXISTS public.idx_notifications_user_created;

-- 3. Recreate original unconstrained triggers on profiles
DROP TRIGGER IF EXISTS trigger_update_profile_completion_insert ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_profile_completion_update ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion 
BEFORE INSERT OR UPDATE ON public.profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_profile_completion_status();

DROP TRIGGER IF EXISTS trigger_update_user_scores_on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_user_scores_on_profile_update ON public.profiles;
CREATE TRIGGER trigger_update_user_scores_on_profile_change 
AFTER INSERT OR UPDATE ON public.profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_user_scores_on_profile_change();
