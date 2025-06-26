
-- Fix infinite recursion in company_team_members RLS policy
-- The issue is that the policy is referencing the same table it's applied to

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Company admins can manage team members" ON public.company_team_members;

-- Create a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- Check if user is company owner
    SELECT 1 FROM public.company_profiles 
    WHERE company_id = company_uuid AND owner_id = auth.uid()
    UNION
    -- Check if user is admin in team members (without recursion)
    SELECT 1 FROM public.company_team_members 
    WHERE company_id = company_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Company admins can manage team members"
  ON public.company_team_members
  FOR ALL
  USING (public.is_company_admin_or_owner(company_id));

-- Make companies table publicly readable so anyone can see companies to post jobs
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
CREATE POLICY "Anyone can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to create companies
CREATE POLICY "Authenticated users can create companies" 
  ON public.companies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow company owners/admins to update their companies
CREATE POLICY "Company admins can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (
    id IN (
      SELECT company_id FROM public.company_profiles WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM public.company_team_members 
      WHERE user_id = auth.uid() AND role IN ('admin') AND is_active = true
    )
  );
