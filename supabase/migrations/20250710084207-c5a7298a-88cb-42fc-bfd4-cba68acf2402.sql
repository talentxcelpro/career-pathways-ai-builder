-- Check and ensure proper RLS policies for company_follows table
-- First, drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can follow companies" ON company_follows;
DROP POLICY IF EXISTS "Users can unfollow companies" ON company_follows;
DROP POLICY IF EXISTS "Users can view follows" ON company_follows;
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

-- Ensure the table structure is correct
ALTER TABLE company_follows 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_company_follows_user_company 
ON company_follows(user_id, company_id);

CREATE INDEX IF NOT EXISTS idx_company_follows_company 
ON company_follows(company_id);