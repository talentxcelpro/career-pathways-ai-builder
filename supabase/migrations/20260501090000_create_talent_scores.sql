-- TalentScore: career credit score history
CREATE TABLE IF NOT EXISTS public.talent_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  previous_score INTEGER CHECK (previous_score IS NULL OR (previous_score >= 0 AND previous_score <= 1000)),
  delta INTEGER NOT NULL DEFAULT 0,
  percentile INTEGER NOT NULL DEFAULT 50 CHECK (percentile >= 0 AND percentile <= 100),
  band TEXT NOT NULL DEFAULT 'Building',
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_scores_user_computed_at
  ON public.talent_scores (user_id, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_talent_scores_score
  ON public.talent_scores (score DESC);

ALTER TABLE public.talent_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own talent scores" ON public.talent_scores;
CREATE POLICY "Users can view their own talent scores"
  ON public.talent_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can view all talent scores" ON public.talent_scores;
CREATE POLICY "Super admins can view all talent scores"
  ON public.talent_scores
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));
