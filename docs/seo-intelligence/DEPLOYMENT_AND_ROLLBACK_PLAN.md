# TALENTXCEL — DEPLOYMENT READINESS & ROLLBACK PLAN

**Target Platform:** TalentXcel (`https://talentxcel.in` & ecosystem subdomains)  
**Architecture:** Backend-First Dual-Tier Search Demand Intelligence & Opportunity Engine (Zero UI Changes)  

---

## 1. Deployment Architecture & Runtime Verification

- **Database Migration (`supabase/migrations/20261125120000_global_search_demand_intelligence_engine.sql`):**
  - Idempotent schema (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
  - Remediates legacy permissive `{public} ALL` write policies on `seo_intents`, `seo_entities`, `seo_destinations`, `location_entities`, and `location_aliases` -> restricted to `{service_role}` while keeping public `SELECT` policies intact.
  - Creates 9 internal search intelligence tables restricted exclusively to `{service_role}` (`REVOKE ALL FROM anon, authenticated`).
  - Does NOT add any table to `supabase_realtime` publication and adds ZERO `pg_cron` polling loops.
- **Edge Protection (`cloudflare-workers/supabase-edge-gateway/src/types.ts`):**
  - Registers all internal `keyword_*`, `seo_*`, `search_demand_sources`, and `udx_*` tables inside `SENSITIVE_PRIVATE_ENTITIES` so public Cloudflare worker requests never expose or cache internal demand intelligence.
- **Tier 1 Analytical Warehouse (`seo-intelligence-engine/data/search_demand_intelligence.db`):**
  - Uses Node 24/25 built-in `node:sqlite` in WAL mode for 1M+ keyword classification, deduplication, clustering, and checkpoints without consuming Supabase cloud storage or Disk I/O quota. Excluded from git via `seo-intelligence-engine/data/.gitignore`.
- **Automated Workflows (`.github/workflows/`):**
  - `search-demand-daily-sync.yml` (`01:23 UTC`): bounded daily GSC + GA4 incremental sync, live inventory match, qualification evaluation, and daily report.
  - `search-demand-weekly-discovery.yml` (`02:37 UTC Sunday`): compliant platform taxonomy discovery, cluster recompute, internal linking & brief refresh, and weekly strategy report.

---

## 2. Verification Before Production Promotion

1. `npx tsc -p tsconfig.app.json --noEmit` — zero TypeScript compilation errors across `src/`.
2. `npx tsx scripts/test-search-demand-intelligence.ts` — validates normalization, classification, scoring, GSC A–I, qualification gates, linking, briefs, and idempotent restartable ingestion.
3. `npx tsx scripts/test-seo-graph-governor.ts` & `npx tsx scripts/test-seo-intelligence.ts` — confirms zero regression in existing SEO governors.
4. `npm run build` — confirms frontend bundle compiles cleanly with zero UI modifications or accidental Node built-in leakage into client chunks.
5. `npx tsx scripts/search-intelligence/securityAndCostAudit.ts` — verifies live DB RLS policies, Cloudflare gateway denylist, zero client secret/table leaks, and bounded DB size.

---

## 3. Emergency Rollback Procedures

### A. Database Schema Rollback
Execute `supabase/migrations/20261125120000_global_search_demand_intelligence_engine_rollback.sql` via `npx supabase db query --linked -f ...`:
- Drops `cleanup_seo_intelligence_retention`, all 9 `keyword_*` / `seo_*` intelligence tables (`CASCADE`), and reverses extension columns on `udx_demand_clusters` and `search_demand_sources`.
- Core production tables (`jobs`, `profiles`, `public_profiles`, `companies`, `posts`, `seo_hub_state`, `seo_intents`, `seo_entities`, `seo_destinations`) remain completely untouched and operational.

### B. Automation & Pipeline Rollback
- Disable `.github/workflows/search-demand-daily-sync.yml` and `search-demand-weekly-discovery.yml` via GitHub Actions UI or `gh workflow disable`.
- Delete local Tier 1 cache `seo-intelligence-engine/data/search_demand_intelligence.db*` and re-run ingest cleanly from CSV/GSC at any time.

### C. Code Rollback
- Revert `cloudflare-workers/supabase-edge-gateway/src/types.ts`, `package.json`, `src/lib/seo/demandIntelligence/`, and `scripts/search-intelligence/`. Because **ZERO UI components, CSS, routes, or existing SEO runtime paths were modified**, reverting leaves frontend rendering 100% unchanged.
