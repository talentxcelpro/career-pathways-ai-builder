-- Update company_profiles RLS policy to allow public viewing
DROP POLICY IF EXISTS "Anyone can view company profiles" ON public.company_profiles;

CREATE POLICY "Anyone can view company profiles"
  ON public.company_profiles
  FOR SELECT
  USING (true);

-- Keep existing policies for management
-- Company owners can still manage their company profile
-- Team members can still view (redundant now but kept for clarity)