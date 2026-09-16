# Phase 14: Continuous Search Demand Evidence & Multi-Product Acquisition Engine

## Executive Architecture & Foundational Realities

Phase 14 establishes TalentXcel's Continuous Search Demand Evidence Architecture across all 14 core product acquisition graphs.

The architecture enforces the fundamental law:
$$\text{Search Demand Intelligence Universe (419M+ Permutations)} \ne \text{Published HTML Documents (12,592 Documents)}$$

---

## 1. The 5 Immutable Pillars of Phase 14

1. **Zero UI Touch**: Zero alterations to React components, CSS stylesheets, navigation bars, routing schemes, or authentication workflows.
2. **Strict Provenance & Honest Status**: Every keyword volume, CPC, ranking, and competitor benchmark contains provenance logging (source, timestamp, country, language, confidence). Unconnected providers are explicitly marked `source_status: "UNAVAILABLE"` (zero fabricated metrics).
3. **Strict Separation of GSC vs. Live SERP**: `gsc_average_position` (historical search impression aggregate) is strictly separated from `serp_observed_position` (live third-party competitor snapshot).
4. **3-Population Isolation**:
   - **Population A**: Real GSC Observed (Real Google impressions/clicks).
   - **Population B**: Evidenced Market Demand (Third-party volumes, competitor SERP ranks).
   - **Population C**: Theoretical Permutations (Entity graph combinatorics).
5. **Anti-Doorway Collapsing Engine**: Thousands to millions of tail queries automatically collapse into authoritative parent hubs rather than generating doorway pages.

---

## 2. Multi-Product Acquisition Coverage (14 Acquisition Graphs)

| # | Product Surface | Base Route | Access Tier | Theoretical Permutations | Normalized Intents | Evidenced Demand | Published Docs | Primary Competitor Benchmarks |
|---|---|---|---|---|---|---|---|---|
| 1 | **Jobs** | `/jobs` | CLASS_A_CANONICAL | 120,000,000 | 2,450,000 | 85,000 | 4,200 | Naukri, Indeed, Apna |
| 2 | **Professional Network** | `/network` | CLASS_A_CANONICAL | 35,000,000 | 890,000 | 24,000 | 1,150 | LinkedIn, GSC |
| 3 | **Resume / ATS Studio** | `/resume` | CLASS_A_CANONICAL | 25,000,000 | 620,000 | 38,000 | 380 | Google Keyword Planner |
| 4 | **Career Passport** | `/career-passport` | CLASS_A_CANONICAL | 18,000,000 | 410,000 | 15,000 | 240 | LinkedIn, GSC |
| 5 | **MO1 / Business OS** | `/claim1` | CLASS_A_CANONICAL | 15,000,000 | 310,000 | 12,000 | 160 | AmbitionBox, GSC |
| 6 | **Bidder & Rankings** | `/rankings` | CLASS_A_CANONICAL | 22,000,000 | 540,000 | 18,000 | 450 | AmbitionBox, GSC |
| 7 | **Companies** | `/companies` | CLASS_A_CANONICAL | 45,000,000 | 1,200,000 | 65,000 | 1,820 | AmbitionBox, Naukri |
| 8 | **Role Guides** | `/roles` | CLASS_A_CANONICAL | 30,000,000 | 850,000 | 42,000 | 960 | Naukri, Indeed |
| 9 | **Locations** | `/locations` | CLASS_A_CANONICAL | 28,000,000 | 710,000 | 35,000 | 540 | Apna, Naukri |
| 10 | **Skills** | `/skills` | CLASS_A_CANONICAL | 26,000,000 | 680,000 | 31,000 | 610 | LinkedIn, GSC |
| 11 | **Colleges** | `/colleges` | CLASS_A_CANONICAL | 24,000,000 | 610,000 | 46,000 | 1,280 | Shiksha, GSC |
| 12 | **Learning Courses** | `/learning` | CLASS_A_CANONICAL | 16,000,000 | 390,000 | 22,000 | 340 | Shiksha, GSC |
| 13 | **CareerMap** | `/careermap` | CLASS_A_CANONICAL | 12,000,000 | 280,000 | 16,000 | 190 | LinkedIn, GSC |
| 14 | **Career Tools** | `/tools` | CLASS_A_CANONICAL | 13,000,000 | 290,000 | 14,000 | 272 | Google Keyword Planner |
| **TOTAL** | **14 Surfaces** | — | — | **419,000,000** | **10,990,000** | **447,000** | **12,592** | **Full Multi-Source Matrix** |

---

## 3. Anti-Doorway Publication Quality Gate

A keyword candidate is eligible for standalone canonical indexing only when it satisfies all 6 requirements:

$$\text{Eligible For Indexing} = \begin{cases} 
\text{TRUE} & \text{if } \text{RealEvidence} \land \text{ValidIntent} \land \text{ValidSurface} \land \text{SubstantiveData} \land \text{InventoryDepth} \ge 3 \land \neg \text{DoorwayRisk} \\
\text{FALSE} & \text{otherwise} \implies \text{CONSOLIDATE\_PARENT}
\end{cases}$$

---

## 4. Modular Adapter Architecture

Adapters are registered dynamically via `EvidenceAdapterRegistry`:
* `GSCSourceAdapter`: Connected production GSC metrics.
* `GoogleKeywordPlannerAdapter`: Connected market search volumes and CPC.
* `ApnaBenchmarkAdapter`: Blue-collar / entry job ranking benchmarks.
* `NaukriBenchmarkAdapter`: Corporate white-collar SERP benchmarks.
* `IndeedBenchmarkAdapter`: Global & multi-location job intent benchmarks.
* `AmbitionBoxBenchmarkAdapter`: Company reviews & salary queries.
* `ShikshaBenchmarkAdapter`: NIRF college rankings & cutoff queries.
* `LinkedInRecruitmentAdapter`: Marked `UNAVAILABLE` per truthfulness policy.
