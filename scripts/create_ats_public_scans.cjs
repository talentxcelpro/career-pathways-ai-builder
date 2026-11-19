const helper = require('./db-audit-helper.cjs');

helper.setLinkedTarget('production');

const migrationSql = `
CREATE TABLE IF NOT EXISTS public.ats_public_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_fingerprint TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_role TEXT,
  raw_text TEXT,
  ats_score INTEGER NOT NULL,
  parse_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  missing_keywords TEXT[] DEFAULT '{}',
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ats_public_scans_user ON public.ats_public_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_public_scans_fingerprint ON public.ats_public_scans(session_fingerprint);

ALTER TABLE public.ats_public_scans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ats_public_scans' AND policyname = 'Allow public insert to ats_public_scans'
  ) THEN
    CREATE POLICY "Allow public insert to ats_public_scans" 
      ON public.ats_public_scans 
      FOR INSERT 
      TO anon, authenticated 
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ats_public_scans' AND policyname = 'Allow users to read own scans'
  ) THEN
    CREATE POLICY "Allow users to read own scans" 
      ON public.ats_public_scans 
      FOR SELECT 
      TO authenticated 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ats_public_scans' AND policyname = 'Allow users to update own scans'
  ) THEN
    CREATE POLICY "Allow users to update own scans" 
      ON public.ats_public_scans 
      FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = user_id OR user_id IS NULL)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ats_public_scans' AND policyname = 'Allow service_role full management on ats_public_scans'
  ) THEN
    CREATE POLICY "Allow service_role full management on ats_public_scans" 
      ON public.ats_public_scans 
      FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);
  END IF;
END $$;
`;

const res = helper.runSql(migrationSql);
console.log('Migration output:', res);
