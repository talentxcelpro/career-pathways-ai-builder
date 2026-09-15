
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.id AS company_id, cp.owner_id AS uid
    FROM public.companies c
    JOIN public.company_profiles cp ON cp.company_id = c.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.company_team_members ctm
      WHERE ctm.company_id = c.id AND ctm.role = 'owner' AND ctm.is_active = true
    )
    AND cp.owner_id IS NOT NULL
  LOOP
    UPDATE public.companies SET created_by = r.uid WHERE id = r.company_id AND created_by IS NULL;
    INSERT INTO public.company_team_members (company_id, user_id, role, is_active, joined_at)
    VALUES (r.company_id, r.uid, 'owner', true, now())
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
