-- Fix the career_passport foreign key to reference profiles instead of auth.users
-- First, check what the current constraint references
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE conname = 'career_passport_user_id_fkey';

-- Drop the existing foreign key constraint
ALTER TABLE career_passport DROP CONSTRAINT IF EXISTS career_passport_user_id_fkey;

-- Add new foreign key constraint to reference profiles table instead
ALTER TABLE career_passport 
ADD CONSTRAINT career_passport_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;