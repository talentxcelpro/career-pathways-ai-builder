-- Check for any database functions that might be triggered on job inserts
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.event_object_table = 'jobs' 
AND t.event_object_schema = 'public';

-- Also check if there are any RLS policies that reference profiles
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'jobs' 
AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%');