# TalentXcel — Milestone 1: 100K Real Demand & Attribution Execution Plan
**Stage:** Milestone 1 (M1) Gate: 30 -> 100,000 Real Evidenced Observations  
**Engine Architecture:** Frozen  
**UI & URL Catalog:** Frozen Invariant  
**Operational Objective:** Prove empirical search ingestion, P0 ranking wins, and live organic search -> signup -> product activation conversion loops.

---

## 1. The Staged Scaling Gates

| Gate | Target Evidence Records | Primary Objective | Status |
| :--- | :--- | :--- | :--- |
| **Current** | **30 Records** | Architectural & Pipeline Verification | ✅ Complete (128/128 CI Checks) |
| **Milestone 1 (M1)** | **100,000 Records** | Production Ingestion, Provenance & First Attribution Loop | 🚀 Active Execution Target |
| **Milestone 2 (M2)** | **1,000,000 Records** | Multi-Source Horizontal Scaling & Cluster Saturation | Planned |
| **Milestone 3 (M3)** | **10,000,000 Records** | Deep Market & Competitor Gap Intelligence Layer | Planned |
| **Milestone 4 (M4)** | **100,000,000+ Records** | Universal Query Universe (Evidence Lake Only != 100M URLs) | Planned |

> **Critical Rule:** 100M evidenced queries cluster into ~10M unique search intents, which filter down into **tens of thousands of exceptional, high-inventory canonical pages**. We never blindly generate 100M URLs.

---

## 2. The 4 Pillars of Truth Dashboard Matrix

This matrix reports ground truth across four independent operational dimensions:

```
+---------------------------------------------------------------------------------------------------+
| 1. DEMAND PILLAR (Market Reality)             | 2. SEO PILLAR (Googlebot & SERP Reality)          |
| - Unique Evidenced Queries (Count)            | - Genuinely Indexed & Rendered Canonical Pages   |
| - Daily New Unique Queries Ingested           | - Total GSC Monthly Impressions & Clicks         |
| - Semantic Intent Clusters (14 Surfaces)      | - Aggregate & Per-Cluster CTR (%)                |
| - Regional Breakdown (IN, US, Global)         | - GSC Average Position (Mean Historical Rank)     |
| - Competitor Position Gaps (Apna, Naukri...)  | - Top 3 / Top 10 / Top 20 Keyword Counts         |
+-----------------------------------------------+---------------------------------------------------+
| 3. ACQUISITION PILLAR (Product Conversion)    | 4. QUALITY PILLAR (Index Hygiene & Crawl Budget) |
| - Organic Landing Page Sessions               | - Doorway Candidates Rejected (Risk >= 80)        |
| - Consented User Registrations from Search   | - Sub-Threshold Pages Consolidated (< 3 items)    |
| - Signup-to-Activation Rate (%)               | - Active Cannibalization Conflicts (Goal: 0)     |
| - 1st Milestone Product Actions (ATS, Apply)  | - Isolated Orphan Pages (Inbound Links < 2)       |
| - 7-Day & 30-Day Retained Organic Members     | - 4xx/5xx Error Rate (< 0.01%) & Server Latency   |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Actioning the P0 Quick Wins (Existing Proven Winners)

We prioritize pages that Google already ranks near Page 1, using CTR hooks and internal link authority boosts to push them into Top 3 / Top 10:

| Target Query | Current GSC Avg Pos | Target Position | Action Plan | Primary Attribution Hook |
| :--- | :--- | :--- | :--- | :--- |
| **content writer jobs noida** | **6.4** | **1 - 3** | Add `JobPosting` schema with INR salary bracket; link from `/jobs` root hub. | 1-Click Job Application -> Account Creation |
| **marketing executive jobs noida** | **7.2** | **1 - 3** | Update title to `[Hiring 2026] Marketing Executive Jobs Noida`; add FAQ compensation schema. | Job Application -> Candidate Profile |
| **ats resume builder for software engineers** | **11.2** | **5 - 8 (Page 1)** | Improve meta description CTR hook; add `HowTo` ATS scan steps + tech resume sample section. | Free ATS Resume Scan -> Download Report Signup |
| **salary calculator india 2026** | **35.0** *(Orphan: 1 Link)* | **15 - 20** | Boost internal links from 1 to 10+ pages (`/tools`, `/roles/software-engineer`, `/jobs`); add in-hand tax calculation table. | Save In-Hand Salary Calculation -> Account |
| **infosys interview questions 2026** | **Unranked** *(Orphan: 1 Link)* | **20 - 30** | Link from `/jobs/software-engineer`; inject `QAPage` structured data with technical & HR questions. | Save Interview Prep Guide -> Account |

---

## 4. Ingestion Measurement Methodology

To ensure genuine data hydration, the pipeline measures **`new_unique_evidence_records_daily`** rather than assuming fixed batch numbers:

$$\text{New Unique Records} = \text{Ingested Batch} - (\text{Duplicates} + \text{Unchanged Records})$$

- **GSC Search Analytics Stream:** Ingests observed queries, impressions, clicks, CTR, and position.
- **Keyword Demand Sets:** Ingests monthly search volume, CPC, and intent categorization.
- **SERP Crawl Observations:** Ingests observed competitor rankings (quarantined from GSC position).
- **Strict Invariant:** Every record persists `query -> source -> country -> language -> captured_at -> confidence_score`.

---

## 5. End-to-End Attribution Instrumentation Flow

```
Search Query in Google ("free ats resume scanner india")
                    |
                    v
    Organic Click on Canonical Landing (https://talentxcel.in/resume)
                    |
                    v
    Landing Page View Recorded (Session ID + Referrer Query captured)
                    |
                    v
    User Hits High-Utility Gate ("Scan Resume & Get Full ATS Score")
                    |
                    v
    Consented Registration / Sign In (user_id created, attribution event logged)
                    |
                    v
    First Product Activation Action ("ats_resume_scan" completed)
                    |
                    v
    7-Day Return Visit ("retention_milestone_1" confirmed)
```

This telemetry enables TalentXcel to calculate true **Keyword-to-User ROI** and determine which search clusters genuinely drive platform growth.
