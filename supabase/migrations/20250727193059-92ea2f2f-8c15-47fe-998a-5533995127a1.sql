-- Test connection request with proper RLS
-- First, let's check if we can insert a test connection request
-- But first let's see the exact error by checking RLS policies

-- Check if connections table has proper RLS policies for authenticated users
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
WHERE tablename = 'connections'
ORDER BY cmd, policyname;