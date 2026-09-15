-- UDX 100-Objective Benchmark Results Table
-- Migration: udx_benchmark_results
-- Created: 2026-09-15
-- Epistemic policy: OBSERVED only. No VERIFIED rows auto-created.

CREATE TABLE IF NOT EXISTS udx_benchmark_results (
  result_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          TEXT        NOT NULL,
  objective_id    TEXT        NOT NULL,
  domain          TEXT        NOT NULL,
  raw_intent      TEXT        NOT NULL,

  -- Three-path raw JSONB payloads (full detail for independent verification)
  traditional_proxy   JSONB,
  generic_ai_result   JSONB,
  udx_result          JSONB,

  -- Resolution Advantage (computed post-execution)
  resolution_advantage  JSONB,

  -- Verdict (never pre-populated — derived from resolution_advantage computation)
  verdict         TEXT        CHECK (verdict IN ('UDX_WINS','UDX_LOSES','TIE','INSUFFICIENT_DATA')),
  why_udx_lost    TEXT,       -- Required field when verdict = UDX_LOSES

  -- Epistemic status
  epistemic_status TEXT       NOT NULL DEFAULT 'OBSERVED'
                              CHECK (epistemic_status IN ('OBSERVED','VERIFIED','TRADITIONAL_PROXY')),

  -- Outcome verification (starts PENDING for all)
  outcome_verified_at TIMESTAMPTZ,
  outcome_verified_by TEXT,

  observed_at     TIMESTAMPTZ DEFAULT now()
);

-- Index for public /discovery/benchmark page queries
CREATE INDEX IF NOT EXISTS idx_benchmark_run_id    ON udx_benchmark_results(run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_domain    ON udx_benchmark_results(domain);
CREATE INDEX IF NOT EXISTS idx_benchmark_verdict   ON udx_benchmark_results(verdict);

-- Row-level security: anon can read, only service_role can insert/update
ALTER TABLE udx_benchmark_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "benchmark_read_public"
  ON udx_benchmark_results FOR SELECT
  USING (true);

CREATE POLICY "benchmark_write_service_only"
  ON udx_benchmark_results FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'anon');
-- Note: anon insert allowed for benchmark runner (anon key used in script)
-- Tighten to service_role only once service key is available locally.
