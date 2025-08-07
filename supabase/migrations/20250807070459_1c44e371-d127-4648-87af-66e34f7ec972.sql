-- Add staffing_partner role to enum in a separate migration
ALTER TYPE app_role ADD VALUE 'staffing_partner';

-- Success message
SELECT 'Added staffing_partner role to app_role enum successfully!' as result;