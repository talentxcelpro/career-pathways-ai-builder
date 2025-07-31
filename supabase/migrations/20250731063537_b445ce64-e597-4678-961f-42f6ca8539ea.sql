-- Check the jobs table structure and any triggers
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for triggers on the jobs table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'jobs' AND event_object_schema = 'public';

-- Check RLS policies on jobs table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'jobs';