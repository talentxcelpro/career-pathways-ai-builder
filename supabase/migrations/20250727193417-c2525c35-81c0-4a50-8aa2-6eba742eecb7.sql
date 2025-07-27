-- Let's see what policies currently exist on profiles table
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY cmd, policyname;