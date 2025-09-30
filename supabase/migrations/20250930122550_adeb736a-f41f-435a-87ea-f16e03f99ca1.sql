-- Create a default company for existing employers and set up team membership
-- This will help users who were employers before the company system existed

DO $$
DECLARE
  default_company_id UUID;
  employer_user_id UUID;
BEGIN
  -- Create a default company for TalentXcel Pro (the current user based on the network requests)
  INSERT INTO public.companies (
    name,
    description,
    industry,
    location,
    is_verified,
    verification_status
  ) VALUES (
    'TalentXcel Enterprise',
    'Leading talent acquisition and recruitment platform',
    'Technology',
    'India',
    true,
    'verified'
  ) RETURNING id INTO default_company_id;

  -- Add the current user as company owner
  -- Using the user ID from the network requests: 5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062
  INSERT INTO public.company_team_members (
    company_id,
    user_id,
    role,
    is_active,
    joined_at
  ) VALUES (
    default_company_id,
    '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
    'owner',
    true,
    now()
  );

  -- Also add any other users who have the is_employer flag set to this company
  INSERT INTO public.company_team_members (company_id, user_id, role, is_active)
  SELECT 
    default_company_id,
    p.id,
    'member',
    true
  FROM public.profiles p
  WHERE p.is_employer = true 
    AND p.id != '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'
    AND NOT EXISTS (
      SELECT 1 FROM public.company_team_members 
      WHERE user_id = p.id
    );

END $$;