-- Fix RLS policies for company_follows to ensure users can insert follows
DROP POLICY IF EXISTS "Users can follow companies" ON company_follows;
DROP POLICY IF EXISTS "Users can unfollow companies" ON company_follows;
DROP POLICY IF EXISTS "Users can view their own follows" ON company_follows;
DROP POLICY IF EXISTS "Anyone can view follow counts" ON company_follows;

-- Create comprehensive RLS policies for company_follows
CREATE POLICY "Users can follow companies" 
ON company_follows
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" 
ON company_follows
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own follows" 
ON company_follows
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view follow counts" 
ON company_follows
FOR SELECT 
USING (true);