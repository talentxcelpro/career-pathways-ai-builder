# TALENTXCEL — GLOBAL SEARCH DEMAND INTELLIGENCE & OPPORTUNITY ENGINE ARCHITECTURE

**Status:** Approved Production Design (Backend-First, Zero UI Changes)  
**Domain Integration:** Extends `src/lib/seo/governor/`, `src/lib/seo/canonicalUrls.ts`, `src/config/domainArchitecture.ts`, `src/config/jobs/*`, `src/lib/seo/searchUniverse/`, and existing Supabase `seo_*` / `udx_*` schemas.

---

## 1. Hybrid Two-Tier Storage & Cost-Protection Architecture

To process **1,000,000+ keyword candidates** cleanly without bloating live Supabase storage (`387.61 MB` baseline) or exhausting Disk I/O quotas:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Tier 1: Local / CI Analytical Corpus Warehouse (node:sqlite WAL)     │
│ File: seo-intelligence-engine/data/search_demand_intelligence.db     │
│ - All 1,000,000+ raw & deduplicated normalized keyword rows          │
│ - Streaming ingestion checkpoints (restartable every 5,000 rows)     │
│ - Multi-taxonomy tags, SHA-256 fingerprints, cluster assignments     │
│ - Platform taxonomy expansions (LinkedIn / Naukri / Indeed-inspired) │
│ - Zero cloud DB storage cost, zero Disk I/O exhaustion, ~5-20s batch │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ Bounded, rate-limited batch sync
                                ▼ (Cluster centroids, GSC/GA4 telemetry,
                                  top prioritized opportunities & page gates)
┌──────────────────────────────────────────────────────────────────────┐
│ Tier 2: Supabase Operational Intelligence Layer (service_role only)  │
│ - Extended: seo_intents, seo_entities, seo_destinations,             │
│   search_demand_sources, udx_demand_clusters                         │
│ - Normalized Tables: keyword_sources, keyword_clusters,              │
│   keyword_intelligence, keyword_observations, seo_opportunities,     │
│   seo_page_qualification, seo_internal_link_recommendations,         │
│   seo_content_opportunities, seo_intelligence_runs                   │
│ - Strict service_role RLS + Cloudflare SENSITIVE_PRIVATE_ENTITIES    │
│ - ZERO supabase_realtime CDC; ZERO pg_cron polling loops             │
│ - Bounded budget: < 15 MB cloud footprint, automated retention RPC   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Design & Extension Strategy

### Existing Tables Extended
- `seo_intents`, `seo_entities`, `seo_destinations`, `location_entities`, `location_aliases`: Remediate permissive `{public}` write RLS policies to `{service_role}` only.
- `search_demand_sources`: Add `source_confidence`, `is_verified_demand`, `collection_method`, `updated_at`.
- `udx_demand_clusters`: Add `parent_cluster_key`, `recommended_hub_url`, `cluster_quality_score` for interoperability.

### New Normalized Tables (`supabase/migrations/20261125120000_global_search_demand_intelligence_engine.sql`)
1. **`keyword_sources`** — Provenance registry separating `VERIFIED_GSC`, `VERIFIED_GA4`, `VERIFIED_FIRST_PARTY_DB`, `DISCOVERY_CORPUS_CSV`, and `TAXONOMY_EXPANSION_*` (`source_confidence`, `is_verified_demand`, `collection_method`, `collection_date`, `source_metadata`).
2. **`keyword_clusters`** — Hierarchical intent/topic clusters (`cluster_key` UNIQUE, `cluster_name`, `cluster_type`, `parent_cluster_id`, `primary_keyword`, `country`, `language`, `intent`, `member_count`, `cluster_quality`, `opportunity_score`, `recommended_hub_url`).
3. **`keyword_intelligence`** — Normalized deduplicated keyword records (`keyword_hash` UNIQUE, `keyword`, `normalized_keyword`, `source_id` FK, `source`, `source_type`, dimensions: `country`, `city`, `language`, `industry`, `job_role`, `skill`, `seniority`, `employment_type`, `work_mode`, `search_intent`, `opportunity_type`, `keyword_cluster_id` FK, `recommended_destination`, 7-factor scores + `data_quality_score` + `score_breakdown`, `status`).
4. **`keyword_observations`** — Time-series verified GSC/GA4 telemetry (`(keyword_id, observation_date, source, property_url, country, page_url)` UNIQUE, `impressions`, `clicks`, `ctr`, `average_position`, `estimated_volume`, `trend_direction`, `competition`, `conversion_count`, `registrations`).
5. **`seo_opportunities`** — Prioritized opportunities across GSC codes `A`–`I` and 25 SEO archetypes (`opportunity_key` UNIQUE, `opportunity_type`, `gsc_opportunity_code`, `recommended_destination`, `opportunity_score`, `confidence_score`, `priority`, `qualification_status`, `evidence`, `score_breakdown`, `recommended_action`).
6. **`seo_page_qualification`** — Unified Page Indexation Governor state (`page_url` UNIQUE, `page_type`, `primary_keyword`, `cluster_id`, `real_inventory_count`, `unique_content_score`, `relevance_score`, `indexation_score`, `cannibalization_target`, `qualification_status` in 11 lifecycle states, `qualification_reason`, `last_checked_at`).
7. **`seo_internal_link_recommendations`** — Internal graph orphan & hub-spoke recommendations (`recommendation_key` UNIQUE, `source_page_url`, `target_page_url`, `anchor_text`, `link_type`, `priority_score`, `reason`).
8. **`seo_content_opportunities`** — Evidence-grounded content gap briefs across 25 opportunity types (`brief_key` UNIQUE, `target_url`, `opportunity_type`, `primary_keyword`, `supporting_keywords`, `outline`, `faq_questions`, `internal_links`, `evidence_summary`, `estimated_impact_score`).
9. **`seo_intelligence_runs`** — Restartable execution ledger tracking ingestion checkpoints, batch metrics, failures, and duration.

---

## 3. Core Engine Architecture (`src/lib/seo/demandIntelligence/` + `scripts/search-intelligence/`)

Pure domain logic lives in `src/lib/seo/demandIntelligence/` (Node + Vite safe, zero `node:fs`/`node:sqlite` imports so Vite frontend build remains untouched):
- **`types.ts`**: Unified interfaces, 11 lifecycle statuses, 25 opportunity archetypes, GSC opportunity codes `A`–`I`, strict provenance enums.
- **`taxonomies.ts`**: Reuses `CANONICAL_20_INDUSTRIES`, `JOB_ROLES`, `INDIAN_INSTITUTIONS_CATALOG`, `GLOBAL_COUNTRIES`; expands to **30 industry categories**, **55+ roles + 14 seniority modifiers** (preserving regional terms like `fresher`, `graduate`, `trainee`, `entry level`), global skills/tools/certifications, normalized Tier 1–3 global hubs, and compliant **LinkedIn / Naukri / Indeed-inspired** vocabularies (never claiming proprietary extraction).
- **`normalizer.ts`**: Deterministic text cleanup, regional token preservation (`fresher`, `cv` vs `resume`, location names), deduplication key generation, FNV-1a/SHA-compatible hash fingerprinting, and invalid/spam/PII query rejection.
- **`classifier.ts`**: High-throughput pre-indexed matcher extracting intent, language, country, city, industry, role, skill, seniority, employment type, work mode, semantic entities, and opportunity type.
- **`destinationMapper.ts`**: Canonical router using `formatCanonicalUrl()` and TalentXcel's live routes (`/jobs/...`, `/salary/...`, `/resume/ats-check`, `/talent-score`, `/passport`, `/career-map/...`, `/network/locations/...`, `/network/skills/...`, `/learning/...`, `/colleges/...`, `/government-jobs/...`, `/employer`, `/services/...`). Fixes the 1M CSV's non-canonical `/career/` path mapping deterministically.
- **`clusterer.ts`**: Hierarchical intent + primary-entity clustering + parent-child semantic edge extraction (`BROADER`, `NARROWER`, `CAREER_ADJACENT`, `SKILL_SUPPORT`).
- **`opportunityScorer.ts`**: Configurable 7-factor model:
  - Demand Evidence (`25%`) — GSC impressions / verified telemetry (`0`–`15` conservative baseline when `unknown`, with explicit confidence penalty)
  - GSC Opportunity (`20%`) — Strike-zone pos `4`–`20`, high-impression low-CTR, rising trends
  - TalentXcel Relevance (`20%`) — Ecosystem fit across Jobs, ATS-Check, TalentScore, Passport, Salary, Network, Colleges
  - Inventory Availability (`15%`) — Live active jobs / verified profiles aggregate / courses / institutions
  - Conversion Potential (`10%`) — Commercial & registration intent multiplier + GA4 evidence
  - Content Quality / Gap (`5%`) — Existing surface completeness vs gap
  - Competition Feasibility (`5%`) — Head-term saturation vs long-tail modifiability
- **`pageQualifier.ts`**: Wraps `SEOPageGovernor`, `ContentGovernor`, and `evaluateMatrixIndexability` across all 11 lifecycle states (`DISCOVERED`, `NORMALIZED`, `CLUSTERED`, `SCORED`, `RECOMMENDED`, `APPROVED`, `QUALIFIED_FOR_INDEX`, `PUBLISHED`, `NOINDEX_MONITOR`, `REJECTED_THIN`, `ARCHIVED`). Never indexes zero-inventory job pages or cannibalizing duplicates.
- **`gscOpportunityDetector.ts`**: Implements exact classification for GSC+GA4 signals `A` through `I`.
- **`internalLinkRecommender.ts`**: Detects orphan/low-inbound qualified destinations, pairs hubs and conversion pages, rotates natural varied anchor texts.
- **`contentBriefGenerator.ts`**: Produces evidence-backed briefs for all 25 archetypes, marking missing telemetry as `NEEDS_DATA_COLLECTION`.

---

## 4. Rollback & Data Retention Strategy

- **Schema Rollback:** Paired script `supabase/migrations/20261125120000_global_search_demand_intelligence_engine_rollback.sql` drops the 9 new tables, helper function, and added extension columns cleanly without touching `jobs`, `profiles`, `public_profiles`, `companies`, or `seo_hub_state`.
- **Data Retention:** `cleanup_seo_intelligence_retention(180, 90)` purges `keyword_observations` older than `180` days and `seo_intelligence_runs` older than `90` days; local SQLite warehouse keeps full historical corpus compressed in WAL mode outside git (`*.db*` ignored).
- **Bounded Automation:** Scheduled GitHub Actions run daily (`01:23 UTC` incremental GSC + inventory sync & daily report) and weekly (`Sun 02:37 UTC` discovery, clustering, brief refresh & weekly report) with explicit concurrency locks, `--max-sync` budgets, and zero polling loops.
