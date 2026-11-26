# PHASE 1 — FORENSIC QUALITY REPORT: EXISTING 1M KEYWORD CORPUS & ENGINE AUDIT

**Audit Date:** 2026-11-25  
**Audited Database:** `seo-intelligence-engine/data/search_demand_intelligence.db` + Supabase `dthlgsnakhoftinssokm`  
**Methodology:** Direct SQL introspection across `keywords` (`1,008,169` rows), `gsc_telemetry` (`17,394` rows), `page_qualifications` (`297` rows), `opportunities`, and live Supabase production tables. Zero extrapolated counts.

---

## Executive Forensic Findings (Answers 1–10)

| # | Forensic Question | Verified SQLite / Supabase Measurement | Quality Diagnosis |
|---|---|---|---|
| **1** | **Truly distinct keywords** | `1,008,169` normalized strings (`1,006,195` unique `dedup_key`s; `11,274` clusters) | Surface hashes are unique, but `1,006,195` distinct `dedup_key`s hide massive synthetic permutation reuse across `jobs`/`careers`/`vacancies` and templated `city × skill × industry` tuples. |
| **2** | **Syntactic permutations** | `1,974` redundant `dedup_key` collisions across `1,960` groups + `381,363` `four-way-expansion` + `132,000` `skill-industry-city` + `108,000` `intent-skill-city` rows | Examples observed verbatim: `"fresher fresher jobs in hyderabad"`, `"sales executive jobs with sales in singapore"`, `"sales executive jobs in sales in singapore"`, `"accountant jobs with accounting in singapore"`. |
| **3** | **Genuine search-intent distinctions** | `17` classified intents (`job_search`: `683,013`, `community_network`: `142,726`, `internship`: `40,386`, `fresher_entry`: `35,292`, `skill_learning`: `20,223`, `resume_ats`: `14,946`, `career_roadmap`: `13,582`, `remote_work`: `12,815`, `salary_benchmark`: `8,138`, etc.) | Raw CSV had only `3` coarse intents and mapped `582,351` rows to non-canonical `/career/`. Engine corrected route mapping, though `community_network` (`142,726`) over-triggered on broad forum/community modifiers in synthetic strings. |
| **4** | **Meaningful job titles matched** | **`454,296` rows (`45.06%`)** matched `job_role_slug IS NOT NULL` across ~`16` populated roles | **`553,873` rows (`54.94%`)** had `job_role_slug = NULL` (e.g., `"marketer jobs in Paris"` had `is_classified = 0`) because role taxonomy only held `55` roles with `16` actually hit in the corpus. |
| **5** | **Real skills matched** | **`464,130` rows (`46.04%`)** matched `skill_slug IS NOT NULL` across ~`16` core skills | **`544,039` rows (`53.96%`)** had `skill_slug = NULL`. Broad skill intelligence was limited to `19` curated skill clusters (`16` hit in CSV). |
| **6** | **Geographically valid** | **`297,811` rows (`29.54%`)** had an explicit city/country entity (`205,920` matched a city across just **`26` cities**). **`710,358` rows (`70.46%`)** had NO matched geo entity and defaulted silently to `country_code = 'IN'`. | Critical taxonomy & normalization defects discovered: (a) major cities in CSV (`Los Angeles`, `Amsterdam`, `Paris`, `Doha`, `Riyadh`, `Pakistan`, `Bangladesh`, `Sri Lanka`, `Turkey`) were missing from the 70-hub registry; (b) `country_code = 'IN'` fallback polluted global unlocated keywords (`806,160` marked `'IN'`); (c) GSC ISO-3 (`IND`, `USA`, `ARE`, `GBR`) conflicted with ISO-2 (`IN`, `US`, `AE`, `GB`). |
| **7** | **Real GSC observations** | **`7,902` distinct queries** joined in `keywords` (`7,920` distinct across `17,394` grain rows / `5,662` URLs in `gsc_telemetry`; `61,552` impressions; `1,276` clicks) | Empirical telemetry is authentic across all 10 TalentXcel GSC properties, stored cleanly separate from generated candidates. |
| **8** | **Validated via other legitimate sources** | `1,020` GA4 landing pages (property `499367883`), `4,470` active live DB `jobs`, `705` public profiles (aggregate count), `152` `canonical_roles`, `191` `canonical_cities`, `1,196` `growth_geo_cities` | Solid first-party operational base; external occupational/geographic datasets (GeoNames, O*NET, ESCO) not yet integrated in Phase 1. |
| **9** | **Purely generated candidates** | **`999,879` rows (`99.18%`)** (`DISCOVERY_CORPUS_CSV`), plus `388` compliant taxonomy seeds | All marked `Generated candidate; volume not verified` — zero fabricated search demand. |
| **10** | **Mapped to live TalentXcel inventory** | Out of `297` evaluated canonical destinations in `page_qualifications`, **`133` have `real_inventory_count > 0`**, `143` blocked as `REJECTED_THIN`, `20` `QUALIFIED_FOR_INDEX`, `101` `RECOMMENDED`, `33` `NOINDEX_MONITOR` | Thin-page protection is functioning properly; expansion must feed qualified demand intelligence without opening empty doorway pages. |

---

## Synchronized Supabase Baseline Counts Verified Live
- `keyword_sources`: `6` | `keyword_clusters`: `500` | `keyword_intelligence`: `4,171` | `keyword_observations`: `2,508`
- `seo_opportunities`: `1,540` | `seo_page_qualification`: `297` | `seo_internal_link_recommendations`: `60` | `seo_content_opportunities`: `91`

---

## Critical Root Causes Addressed in Phase 2 Architecture
1. Eliminate `country_code = 'IN'` silent defaulting — require `'GLB'`/`'UNSPECIFIED'` when no geography entity is actually present, and unify ISO-3 (`IND`/`USA`) -> ISO-2 (`IN`/`US`).
2. Replace small static `26`-city, `16`-role, `16`-skill dictionaries with authentic licensed open global datasets (**GeoNames CC-BY-4.0**, **O*NET 29.0 CC-BY-4.0**, **ESCO European Commission**, plus first-party **TalentXcel DB & `locations.ts`**).
3. Upgrade the Keyword Quality Engine to flag duplicate/redundant role-in-role / skill-in-skill permutations (`"sales executive jobs in sales"`, `"fresher fresher jobs"`) and assign explicit 11-state lifecycle classification (`GENERATED` -> `QUALIFIED` / `REJECTED`).
