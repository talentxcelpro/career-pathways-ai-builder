-- Create company_profiles table first
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for company_profiles
CREATE POLICY "Company owners can manage their profiles"
ON company_profiles
FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Anyone can view company profiles"
ON company_profiles
FOR SELECT
USING (true);

-- Fix infinite recursion in company_team_members RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Company members can view team" ON company_team_members;
DROP POLICY IF EXISTS "Company owners can manage team" ON company_team_members;

-- Create simplified, non-recursive RLS policies for company_team_members
CREATE POLICY "Users can view their own team membership"
ON company_team_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Company owners can manage team members"
ON company_team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM company_profiles cp
    WHERE cp.company_id = company_team_members.company_id
    AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert themselves as team members"
ON company_team_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert company profile for the default company
INSERT INTO company_profiles (company_id, owner_id)
SELECT id, '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'
FROM companies 
WHERE name = 'TalentXcel Enterprise'
ON CONFLICT (company_id) DO NOTHING;