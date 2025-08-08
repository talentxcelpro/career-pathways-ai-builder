-- Third attempt: Use ownership via ai_resumes in RLS expressions to avoid column resolution issues

-- 1) Create resume_versions table
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'user',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_version ON public.resume_versions(resume_id, version_number);

-- Trigger for defaults
CREATE OR REPLACE FUNCTION public.before_insert_resume_versions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id UUID;
  next_version INTEGER;
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT ar.user_id INTO owner_id FROM public.ai_resumes ar WHERE ar.id = NEW.resume_id;
    NEW.user_id := owner_id;
  END IF;

  IF NEW.version_number IS NULL OR NEW.version_number <= 0 THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.resume_versions
    WHERE resume_id = NEW.resume_id;
    NEW.version_number := next_version;
  END IF;

  IF NEW.content IS NULL THEN
    NEW.content := '{}'::jsonb;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_resume_versions ON public.resume_versions;
CREATE TRIGGER trg_before_insert_resume_versions
BEFORE INSERT ON public.resume_versions
FOR EACH ROW EXECUTE FUNCTION public.before_insert_resume_versions();

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

-- Policies via ownership of ai_resumes
DROP POLICY IF EXISTS "Users can view their own resume versions" ON public.resume_versions;
CREATE POLICY "Users can view their own resume versions"
ON public.resume_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_versions.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own resume versions" ON public.resume_versions;
CREATE POLICY "Users can insert their own resume versions"
ON public.resume_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_versions.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own resume versions" ON public.resume_versions;
CREATE POLICY "Users can update their own resume versions"
ON public.resume_versions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_versions.resume_id
      AND ar.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_versions.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own resume versions" ON public.resume_versions;
CREATE POLICY "Users can delete their own resume versions"
ON public.resume_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_versions.resume_id
      AND ar.user_id = auth.uid()
  )
);


-- 2) Create resume_ai_logs table
CREATE TABLE IF NOT EXISTS public.resume_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.ai_resumes(id) ON DELETE CASCADE,
  resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  section TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'enhance',
  before_text TEXT,
  after_text TEXT,
  prompt TEXT,
  model_used TEXT DEFAULT 'deepseek-chat',
  usage JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_ai_logs_resume_id ON public.resume_ai_logs(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_ai_logs_user_id ON public.resume_ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_ai_logs_version_id ON public.resume_ai_logs(resume_version_id);

ALTER TABLE public.resume_ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ai logs" ON public.resume_ai_logs;
CREATE POLICY "Users can view their own ai logs"
ON public.resume_ai_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_ai_logs.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own ai logs" ON public.resume_ai_logs;
CREATE POLICY "Users can insert their own ai logs"
ON public.resume_ai_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_ai_logs.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own ai logs" ON public.resume_ai_logs;
CREATE POLICY "Users can update their own ai logs"
ON public.resume_ai_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_ai_logs.resume_id
      AND ar.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_ai_logs.resume_id
      AND ar.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own ai logs" ON public.resume_ai_logs;
CREATE POLICY "Users can delete their own ai logs"
ON public.resume_ai_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.ai_resumes ar
    WHERE ar.id = resume_ai_logs.resume_id
      AND ar.user_id = auth.uid()
  )
);
