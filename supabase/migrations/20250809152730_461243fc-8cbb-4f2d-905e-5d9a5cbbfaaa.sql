-- 1) Create ats_resume_data table to store normalized ATS JSON versions
CREATE TABLE IF NOT EXISTS public.ats_resume_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID NULL, -- optional link to ai_resumes.id when applicable
  ats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_role TEXT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_user ON public.ats_resume_data(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_resume ON public.ats_resume_data(resume_id, version DESC);

-- Only one latest per resume_id (or per user when resume_id is null)
CREATE OR REPLACE FUNCTION public.ats_resume_data_manage_latest()
RETURNS TRIGGER AS $$
BEGIN
  -- when inserting a new row for same resume_id, mark others as not latest
  IF NEW.resume_id IS NOT NULL THEN
    UPDATE public.ats_resume_data
      SET is_latest = false
    WHERE resume_id = NEW.resume_id AND id <> NEW.id;
  ELSE
    -- fallback: scope by user when resume_id missing
    UPDATE public.ats_resume_data
      SET is_latest = false
    WHERE resume_id IS NULL AND user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ats_resume_data_latest
AFTER INSERT ON public.ats_resume_data
FOR EACH ROW EXECUTE FUNCTION public.ats_resume_data_manage_latest();

-- Updated_at trigger
CREATE OR REPLACE TRIGGER trg_ats_resume_data_updated_at
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

-- 2) Create resume_versions table to capture per-section versions
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NULL,
  user_id UUID NOT NULL,
  section TEXT NOT NULL, -- e.g., 'summary', 'experience:0', etc.
  before_text TEXT NULL,
  after_text TEXT NULL,
  ats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume ON public.resume_versions(resume_id, version DESC);
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

-- 3) Create resume_ai_logs table to log enhancer calls
CREATE TABLE IF NOT EXISTS public.resume_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID NULL,
  section TEXT NULL,
  model TEXT NULL,
  prompt TEXT NULL,
  response TEXT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_ai_logs_user ON public.resume_ai_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_ai_logs_resume ON public.resume_ai_logs(resume_id, created_at DESC);

-- RLS
ALTER TABLE public.resume_ai_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resume_ai_logs' AND policyname='Users can manage their ai logs'
  ) THEN
    CREATE POLICY "Users can manage their ai logs"
    ON public.resume_ai_logs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
