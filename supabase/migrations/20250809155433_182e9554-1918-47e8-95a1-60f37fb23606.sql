-- Robust idempotent migration handling existing partial tables

-- Ensure ats_resume_data table exists
CREATE TABLE IF NOT EXISTS public.ats_resume_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Ensure required columns exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='user_id') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='resume_id') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN resume_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='ats_json') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN ats_json JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='target_role') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN target_role TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='version_no') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='is_latest') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN is_latest BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='created_at') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_resume_data' AND column_name='updated_at') THEN
    ALTER TABLE public.ats_resume_data ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_user ON public.ats_resume_data(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_resume_data_resume ON public.ats_resume_data(resume_id, version_no DESC);

-- Triggers
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

-- Ensure resume_versions table exists
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Ensure required columns exist on resume_versions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='resume_id') THEN
    ALTER TABLE public.resume_versions ADD COLUMN resume_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='user_id') THEN
    ALTER TABLE public.resume_versions ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='section') THEN
    ALTER TABLE public.resume_versions ADD COLUMN section TEXT NOT NULL DEFAULT 'summary';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='before_text') THEN
    ALTER TABLE public.resume_versions ADD COLUMN before_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='after_text') THEN
    ALTER TABLE public.resume_versions ADD COLUMN after_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='ats_json') THEN
    ALTER TABLE public.resume_versions ADD COLUMN ats_json JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='version_no') THEN
    ALTER TABLE public.resume_versions ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resume_versions' AND column_name='created_at') THEN
    ALTER TABLE public.resume_versions ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume ON public.resume_versions(resume_id, version_no DESC);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user ON public.resume_versions(user_id, created_at DESC);

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
