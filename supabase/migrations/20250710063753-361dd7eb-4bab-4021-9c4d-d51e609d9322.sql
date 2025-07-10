-- Fix infinite recursion in college_admins RLS policy
DROP POLICY IF EXISTS "College admins can view their college admin info" ON college_admins;

-- Create corrected policy without self-reference
CREATE POLICY "College admins can view their college admin info" ON college_admins
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM college_admins ca2 
    WHERE ca2.college_id = college_admins.college_id 
    AND ca2.user_id = auth.uid() 
    AND ca2.role = 'super_admin' 
    AND ca2.is_active = true
  )
);

-- Fix the super admin policy as well
DROP POLICY IF EXISTS "Super admins can manage college admins" ON college_admins;

CREATE POLICY "Super admins can manage college admins" ON college_admins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM college_admins ca2 
    WHERE ca2.college_id = college_admins.college_id 
    AND ca2.user_id = auth.uid() 
    AND ca2.role = 'super_admin' 
    AND ca2.is_active = true
  )
);