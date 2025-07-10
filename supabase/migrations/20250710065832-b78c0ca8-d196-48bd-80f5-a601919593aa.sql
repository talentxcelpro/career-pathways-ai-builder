-- Fix the infinite recursion in college_admins RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "College admins can view their college admin info" ON college_admins;

-- Create a simplified policy without self-reference that caused recursion
CREATE POLICY "College admins can view their college admin info" 
ON college_admins 
FOR SELECT 
USING (user_id = auth.uid());

-- Also ensure the college listing policy doesn't cause issues
DROP POLICY IF EXISTS "College admins can manage their colleges" ON colleges;

CREATE POLICY "College admins can manage their colleges" 
ON colleges 
FOR ALL 
USING (
  id IN (
    SELECT college_id 
    FROM college_admins 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);