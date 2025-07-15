-- Fix infinite recursion in user_department_assignments policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their department assignments" ON user_department_assignments;
DROP POLICY IF EXISTS "Organization admins can manage department assignments" ON user_department_assignments;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own department assignments" 
ON user_department_assignments FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own department assignments" 
ON user_department_assignments FOR ALL 
USING (user_id = auth.uid());