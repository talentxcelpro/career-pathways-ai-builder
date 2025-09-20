-- Debug the companies table access issue by testing the exact queries used by the frontend

-- First, let's verify RLS is working correctly for companies table
DO $$
DECLARE
    test_company_id uuid;
    follow_result record;
BEGIN
    -- Get a test company ID
    SELECT id INTO test_company_id FROM public.companies WHERE is_active = true LIMIT 1;
    RAISE NOTICE 'Test company ID: %', test_company_id;
    
    -- Test the exact query pattern used in useCompanyFollow for getting followers count
    SELECT COUNT(*) as count INTO follow_result 
    FROM public.company_follows 
    WHERE company_id = test_company_id;
    RAISE NOTICE 'Company follows count query works: %', follow_result.count;
    
    -- Test join query similar to what might be used
    SELECT COUNT(*) INTO follow_result.count
    FROM public.company_follows cf
    LEFT JOIN public.companies c ON cf.company_id = c.id
    WHERE cf.company_id = test_company_id;
    RAISE NOTICE 'Join query works: %', follow_result.count;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in test queries: %', SQLERRM;
END $$;

-- Ensure the companies table has proper RLS policies for public access
-- Drop existing conflicting policies if any
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can view approved companies" ON public.companies;

-- Create a single clear policy for public read access
CREATE POLICY "Public read access to companies" 
ON public.companies 
FOR SELECT 
TO public 
USING (true);

-- Ensure company_follows table allows proper access for following functionality
CREATE POLICY IF NOT EXISTS "Anyone can view company follows" 
ON public.company_follows 
FOR SELECT 
TO public 
USING (true);

-- Allow authenticated users to manage their own follows
CREATE POLICY IF NOT EXISTS "Users can manage their own follows" 
ON public.company_follows 
FOR ALL
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);