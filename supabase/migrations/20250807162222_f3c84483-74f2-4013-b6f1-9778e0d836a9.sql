-- Check RLS policies on cv_files table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cv_files';

-- Check if RLS is enabled on cv_files
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cv_files';