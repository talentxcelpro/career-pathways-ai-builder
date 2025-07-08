-- Add existing company creators as owners if they don't have team member records
INSERT INTO public.company_team_members (
  company_id,
  user_id,
  role,
  invited_by,
  joined_at,
  is_active
)
SELECT 
  c.id,
  c.created_by,
  'owner'::team_role,
  c.created_by,
  c.created_at,
  true
FROM public.companies c
WHERE c.created_by IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.company_team_members ctm 
  WHERE ctm.company_id = c.id 
  AND ctm.user_id = c.created_by
  AND ctm.is_active = true
);

-- Also create company profile entries for existing companies
INSERT INTO public.company_profiles (
  company_id,
  owner_id
)
SELECT 
  c.id,
  c.created_by
FROM public.companies c
WHERE c.created_by IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.company_profiles cp 
  WHERE cp.company_id = c.id
)
ON CONFLICT (company_id) DO NOTHING;