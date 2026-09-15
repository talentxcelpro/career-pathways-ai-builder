
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_by uuid;
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

CREATE OR REPLACE FUNCTION public.companies_grant_owner_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF NEW.created_by IS NULL AND v_uid IS NOT NULL THEN NEW.created_by := v_uid; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_companies_set_creator ON public.companies;
CREATE TRIGGER trg_companies_set_creator BEFORE INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.companies_grant_owner_on_insert();

CREATE OR REPLACE FUNCTION public.companies_insert_owner_membership()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.company_team_members (company_id, user_id, role, is_active, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', true, now())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_companies_insert_owner ON public.companies;
CREATE TRIGGER trg_companies_insert_owner AFTER INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.companies_insert_owner_membership();

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
    ) AND cp.owner_id IS NOT NULL
  LOOP
    UPDATE public.companies SET created_by = r.uid WHERE id = r.company_id AND created_by IS NULL;
    INSERT INTO public.company_team_members (company_id, user_id, role, is_active, joined_at)
    VALUES (r.company_id, r.uid, 'owner', true, now())
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
