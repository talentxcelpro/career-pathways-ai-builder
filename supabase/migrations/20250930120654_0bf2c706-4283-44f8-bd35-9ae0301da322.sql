-- Clean up views and final cleanup
DROP VIEW IF EXISTS user_txc_balances CASCADE;

-- Drop any remaining views that might be causing issues
DROP VIEW IF EXISTS company_job_stats CASCADE;
DROP VIEW IF EXISTS user_profile_complete CASCADE;
DROP VIEW IF EXISTS job_application_stats CASCADE;