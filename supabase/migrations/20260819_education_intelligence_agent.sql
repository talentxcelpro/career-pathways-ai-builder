-- ─────────────────────────────────────────────────────────────────────────────
-- TalentXcel Education Intelligence Agent — Schema Extension
-- Migration: 20260819_education_intelligence_agent.sql
--
-- Adds freshness tracking, confidence scoring, change history, and dynamic
-- scheduling to global_programs and global_scholarships tables.
-- The agent writes to these columns every cycle.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── EXTEND global_programs ──────────────────────────────────────────────────

-- Freshness & scheduling
ALTER TABLE public.global_programs
  ADD COLUMN IF NOT EXISTS last_changed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS next_check_at         timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS check_priority        text NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS confidence_score      numeric NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS freshness_status      text NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS auto_publish          boolean NOT NULL DEFAULT false,

  -- Change tracking
  ADD COLUMN IF NOT EXISTS previous_snapshot     jsonb,
  ADD COLUMN IF NOT EXISTS change_log            jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS change_count          int NOT NULL DEFAULT 0,

  -- Agent metadata
  ADD COLUMN IF NOT EXISTS agent_notes           text,
  ADD COLUMN IF NOT EXISTS agent_run_id          text,
  ADD COLUMN IF NOT EXISTS agent_version         text;

-- ── EXTEND global_scholarships ───────────────────────────────────────────────

ALTER TABLE public.global_scholarships
  ADD COLUMN IF NOT EXISTS last_changed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS next_check_at         timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS check_priority        text NOT NULL DEFAULT 'HIGH',
  ADD COLUMN IF NOT EXISTS confidence_score      numeric NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS freshness_status      text NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS auto_publish          boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS previous_snapshot     jsonb,
  ADD COLUMN IF NOT EXISTS change_log            jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS change_count          int NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS agent_notes           text,
  ADD COLUMN IF NOT EXISTS agent_run_id          text,
  ADD COLUMN IF NOT EXISTS agent_version         text;

-- ── AGENT RUN LOG TABLE ───────────────────────────────────────────────────────
-- Every agent cycle writes one row here. Used for auditing and debugging.

CREATE TABLE IF NOT EXISTS public.education_agent_runs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                text NOT NULL UNIQUE,
  agent_version         text NOT NULL DEFAULT 'v1.0',

  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  duration_seconds      int,

  -- Cycle results
  programs_checked      int NOT NULL DEFAULT 0,
  programs_updated      int NOT NULL DEFAULT 0,
  programs_added        int NOT NULL DEFAULT 0,
  programs_flagged      int NOT NULL DEFAULT 0,

  scholarships_checked  int NOT NULL DEFAULT 0,
  scholarships_updated  int NOT NULL DEFAULT 0,
  scholarships_added    int NOT NULL DEFAULT 0,
  scholarships_flagged  int NOT NULL DEFAULT 0,

  -- Errors
  errors_count          int NOT NULL DEFAULT 0,
  error_log             jsonb DEFAULT '[]'::jsonb,

  status                text NOT NULL DEFAULT 'RUNNING',  -- RUNNING | COMPLETED | FAILED
  summary               text
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON public.education_agent_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status  ON public.education_agent_runs(status);

-- ── FRESHNESS / SCHEDULING INDEXES ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_gp_next_check      ON public.global_programs(next_check_at);
CREATE INDEX IF NOT EXISTS idx_gp_freshness       ON public.global_programs(freshness_status);
CREATE INDEX IF NOT EXISTS idx_gp_priority        ON public.global_programs(check_priority);
CREATE INDEX IF NOT EXISTS idx_gp_confidence      ON public.global_programs(confidence_score);

CREATE INDEX IF NOT EXISTS idx_gs_next_check      ON public.global_scholarships(next_check_at);
CREATE INDEX IF NOT EXISTS idx_gs_freshness       ON public.global_scholarships(freshness_status);
CREATE INDEX IF NOT EXISTS idx_gs_priority        ON public.global_scholarships(check_priority);

-- ── SET INITIAL NEXT_CHECK_AT BASED ON PRIORITY ───────────────────────────────
-- Deadlines/scholarships → 24h, programs → 7d

UPDATE public.global_scholarships
SET
  check_priority   = 'HIGH',
  next_check_at    = now() + interval '24 hours',
  freshness_status = CASE
    WHEN last_verified_at >= now() - interval '24 hours' THEN 'VERIFIED_TODAY'
    WHEN last_verified_at >= now() - interval '7 days'   THEN 'VERIFIED_7D'
    WHEN last_verified_at IS NOT NULL                    THEN 'VERIFICATION_DUE'
    ELSE 'PENDING'
  END;

UPDATE public.global_programs
SET
  check_priority   = 'MEDIUM',
  next_check_at    = now() + interval '7 days',
  freshness_status = CASE
    WHEN last_verified_at >= now() - interval '24 hours' THEN 'VERIFIED_TODAY'
    WHEN last_verified_at >= now() - interval '7 days'   THEN 'VERIFIED_7D'
    WHEN last_verified_at IS NOT NULL                    THEN 'VERIFICATION_DUE'
    ELSE 'PENDING'
  END;

-- ── RLS for agent run log ─────────────────────────────────────────────────────
ALTER TABLE public.education_agent_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agent_runs_public_read" ON public.education_agent_runs;
CREATE POLICY "agent_runs_public_read" ON public.education_agent_runs
  FOR SELECT USING (true);
