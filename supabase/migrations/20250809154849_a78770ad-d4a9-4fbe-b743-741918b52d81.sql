-- Corrected migration: idempotent creation + ALTER ADD COLUMN IF NOT EXISTS + safe indexes

-- 1) ats_resume_data
CREATE TABLE IF NOT EXISTS public.ats_resume_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ats_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS resume_id UUID;
ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS version_no INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS is_latest BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.ats_resume_data ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_user ON public.ats_resume_data(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_resume ON public.ats_resume_data(resume_id, version_no DESC);

-- Latest marker trigger
CREATE OR REPLACE FUNCTION public.ats_resume_data_manage_latest()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resume_id IS NOT NULL THEN
    UPDATE public.ats_resume_data
      SET is_latest = false
    WHERE resume_id = NEW.resume_id AND id <> NEW.id;
  ELSE
    UPDATE public.ats_resume_data
      SET is_latest = false
    WHERE resume_id IS NULL AND user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ats_resume_data_latest ON public.ats_resume_data;
CREATE TRIGGER trg_ats_resume_data_latest
AFTER INSERT ON public.ats_resume_data
FOR EACH ROW EXECUTE FUNCTION public.ats_resume_data_manage_latest();

DROP TRIGGER IF EXISTS trg_ats_resume_data_updated_at ON public.ats_resume_data;
CREATE TRIGGER trg_ats_resume_data_updated_at
BEFORE UPDATE ON public.ats_resume_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.ats_resume_data ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ats_resume_data' AND policyname='Users can manage their own ats data'
  ) THEN
    CREATE POLICY "Users can manage their own ats data"
    ON public.ats_resume_data
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2) resume_versions
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  section TEXT NOT NULL,
  ats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS resume_id UUID;
ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS before_text TEXT;
ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS after_text TEXT;
ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS version_no INTEGER NOT NULL DEFAULT 1;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume ON public.resume_versions(resume_id, version_no DESC);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user ON public.resume_versions(user_id, created_at DESC);

-- RLS
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resume_versions' AND policyname='Users can manage their own resume versions'
  ) THEN
    CREATE POLICY "Users can manage their own resume versions"
    ON public.resume_versions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
