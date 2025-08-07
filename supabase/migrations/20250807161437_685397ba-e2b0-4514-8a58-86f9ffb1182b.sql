-- Check what foreign key constraints exist on the profiles table
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE conrelid = 'profiles'::regclass AND contype = 'f';

-- Drop the foreign key constraint on profiles.id if it references auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;