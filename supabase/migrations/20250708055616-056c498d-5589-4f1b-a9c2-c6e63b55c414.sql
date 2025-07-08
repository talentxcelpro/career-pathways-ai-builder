-- Check if the user creating a company has a team member record with owner role
-- If not, we need to create it when they create a company

-- First, let's create a function to automatically add company creators as owners
CREATE OR REPLACE FUNCTION public.add_company_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the company creator as owner in team members
  INSERT INTO public.company_team_members (
    company_id,
    user_id,
    role,
    invited_by,
    joined_at,
    is_active
  ) VALUES (
    NEW.id,
    NEW.created_by,
    'owner'::team_role,
    NEW.created_by,
    now(),
    true
  );
  
  -- Also create a company profile entry
  INSERT INTO public.company_profiles (
    company_id,
    owner_id
  ) VALUES (
    NEW.id,
    NEW.created_by
  ) ON CONFLICT (company_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add company creator as owner
CREATE TRIGGER trigger_add_company_creator_as_owner
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.add_company_creator_as_owner();