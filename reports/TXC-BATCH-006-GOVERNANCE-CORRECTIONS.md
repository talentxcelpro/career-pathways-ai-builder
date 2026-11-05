# TXC-BATCH-006 — FINAL GOVERNANCE CORRECTIONS & ROOT-DOMAIN AUDIT REPORT

**Mission ID:** TXC-BATCH-006-ROOT-COUNT-FIX-001  
**Audit Date:** 3 November 2026  
**Runtime:** Native SQLite Backlink Engine (`backlink-engine/data/backlink_engine.db`)  
**Database Backup:** `backlink-engine/data/backlink_engine_backup_1793715309288.db`  
**Target Platform:** `https://talentxcel.in`  
**Budget Consumed:** ₹0.00 strictly  
**Git / Remote / Vercel Actions:** Zero commits, zero pushes, zero deployments  
**External Submission Actions:** Zero forms submitted, zero accounts created, zero OAuth tokens requested, zero emails dispatched  

---

## 1. Executive Summary & Quality Gate Outcomes

This authoritative report finalizes the root-domain arithmetic correction and confirms the controlled pilot quality gate:

1. **Definitive Root-Domain Count Corrected (Exactly 385 Distinct Commercial Roots):**
   - **Ingested Population:** 434 total candidates across Batches 1 (4), 2 (30), 4 (100), 5 (100), and 6 (200).
   - **Cross-Batch Duplicates:** 48 duplicates excluded (Batch 4: 12, Batch 5: 1, Batch 6: 35).
   - **Unique Candidate Entities:** $434 - 48 = 386$ unique prospective listing entities.
   - **Subdomain Mapping Rule:** The 2 subdomain hostnames (`tools.zalize.com` $\rightarrow$ `zalize.com`; `landing.mycloudmedia.co.uk` $\rightarrow$ `mycloudmedia.co.uk`) map to their parent registrable roots. Because neither parent root exists elsewhere in the candidate list, each represents a distinct registrable root domain. They are **not subtracted** from the total.
   - **Shared-Hosting Exclusion:** Exactly 1 candidate (`prompthive.pages.dev`) is hosted on Cloudflare Pages shared infrastructure (`pages.dev`). Under Public Suffix List (PSL) rules, `pages.dev` is a public suffix and does not represent an independent commercial domain.
   - **Authoritative Total:** $386 - 1 = \mathbf{385}$ **distinct commercial registrable root domains**.
2. **Superseded Calculations Preserved in Audit Trail:**
   - **Superseded Value 378:** Resulted from a Batch 2 CSV parser bug collapsing 30 records to `UNVERIFIED` and unwarranted brand merges.
   - **Superseded Value 383:** Resulted from an invalid secondary subtraction of the 2 subdomains whose parent roots were not present elsewhere in the list.
3. **Publisher Ownership vs Registrable Roots:**
   - Registrable root domains under the PSL are technical domain boundaries, not corporate publisher ownership boundaries. For example, `zalize.com` operates multiple distinct web properties. Commercial pipeline governance maintains technical root counts distinctly from publisher ownership records.
4. **Historical Ledger Scope & Batch 3 Resolution:**
   - **Batch 1 (4 records):** Captured the initial diversification probe (`hrstack.tech`, `softwaresuggest.com`, `techpluto.com`, `startupbase.io`) from the broader 100-target database.
   - **Batch 3 Excluded:** "Batch 3" designates the legacy Rentry salary citation sprint (`syncBatch3ToDb.cjs` adding 5 Rentry city pages) under Mission TXC-BACKLINK-009. It remains frozen inside the immutable baseline and is strictly excluded from referring-domain diversification tranches.
   - **12th Record Identified:** Record #4 (`startupbase.io`) was the 12th entity in `TXC-BATCH-001-DISPATCH-RECONCILIATION.csv`, representing the Batch 1 candidate held at the OAuth gate.
5. **Controlled Pilot Shortlist (Top 8):**
   - All 8 recommended candidates remain strictly in `STAGED_READY_FOR_HUMAN_APPROVAL` status.
   - Zero external actions taken.

---

## 2. Definitive Pipeline Arithmetic & Governance Reconciliation

| Pipeline Metric | Value | Arithmetic Formula & Provenance | Governance Standard & Verification Status |
| :--- | :---: | :--- | :--- |
| **1. Total Ingested Candidates** | **434** | B1 (4) + B2 (30) + B4 (100) + B5 (100) + B6 (200) | Complete candidate ingestion across all diversification batches. |
| **2. Historical Duplicates Excluded** | **48** | B4 (12) + B5 (1) + B6 (35) | Cross-batch repetitions verified and excluded. |
| **3. Unique Candidate Entities** | **386** | 434 Total - 48 Duplicates | Distinct candidate opportunities evaluated. |
| **4. Subdomain-to-Root Mapping** | **2** | tools.zalize.com $\rightarrow$ zalize.com; landing.mycloudmedia.co.uk $\rightarrow$ mycloudmedia.co.uk | Mapped to parent roots; contributes +2 roots (no duplicate collision). |
| **5. Shared-Hosting Exclusions** | **1** | prompthive.pages.dev on Cloudflare Pages (pages.dev) | Public suffix infrastructure; excluded from commercial roots. |
| **6. Distinct Commercial Registrable Roots** | **385** | **386 Unique Entities - 1 Shared Hosting** | **Authoritative Ground Truth under Public Suffix List (PSL).** |
| **7. Superseded Calculation (Prior Turn)** | *383* | *386 - 1 shared - 2 subdomains* | *Superseded: Invalid subtraction of subdomains.* |
| **8. Superseded Calculation (Earlier Report)** | *378* | *Artifact of parser bug & brand merges* | *Superseded: Batch 2 CSV parser bug remediated.* |
| **9. Live Baseline Referring Domains** | **1** | `rentry.co` (DR 78) | **Baseline only (Frozen & Immutable).** |
| **10. Live Baseline Hyperlinks** | **240** | 240 hyperlinks across 120 unique Rentry pages | **Baseline only (Frozen & Immutable).** |

---

## 3. Top 8 Recommended Pilot Shortlist (Quality Gate Passed)

All 8 candidates passed the 5-factor quality gate (Weighted Score $ge$ 80/100), have verified open HTML forms, published $0 free terms, indexable public listings, and clean crawlable backlink anchors:

| Rank | # | Directory Name | Registrable Root | Score | Niche Category | Published Free Proof | Target Landing URL | Status |
| :-: | :-: | :--- | :--- | :-: | :--- | :--- | :--- | :--- |
| **1** | 13 | **AI SaaS Radar** | `aisaasradar.com` | **91** | B2B SaaS & Career Utilities | Free standard queue | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **2** | 92 | **ToolDock** | `zalize.com` | **87** | Productivity & SaaS Directory | 100% Free standard tier | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **3** | 90 | **ThatsMyAI** | `thatsmy.ai` | **85** | Web Applications & Career Tools | Free plan selector ($0) | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **4** | 48 | **Deekoya AI** | `deekoyaai.in` | **85** | Indian Tech Directory (.in) | Free organic queue | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **5** | 24 | **AI ToolsXplorer** | `aitoolsxplorer.in` | **82** | Indian Software Platform (.in) | Standard Free Option ($0) | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **6** | 3 | **AI Bookmarks** | `aibookmarks.net` | **82** | Curated Software Bookmarks | Explicit free tier | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **7** | 87 | **Stackdrop** | `getstackdrop.com` | **81** | Tech Stack & SaaS Directory | $0 Basic listing route | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |
| **8** | 7 | **AI Gear Base** | `aigearbase.com` | **80** | Tech Gear & Software Utilities | 100% Free tier | `https://talentxcel.in/resume/ats-check` | `STAGED_READY_FOR_HUMAN_APPROVAL` |

---

## 4. Deliverables Produced & Verification Paths

All deliverables have been compiled and verified in [`reports/`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/) and mirrored to the artifact directory:

1. [`TXC-BATCH-006-GOVERNANCE-CORRECTIONS.md`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-006-GOVERNANCE-CORRECTIONS.md)
2. [`TXC-BATCH-001-006-FINAL-LEDGER.csv`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-001-006-FINAL-LEDGER.csv) (435 lines)
3. [`TXC-BATCH-001-006-ROOT-DOMAIN-BRIDGE-FINAL.csv`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-001-006-ROOT-DOMAIN-BRIDGE-FINAL.csv) (9 lines)
4. [`TXC-BATCH-001-DISPATCH-RECONCILIATION-FINAL.csv`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-001-DISPATCH-RECONCILIATION-FINAL.csv) (13 lines)
5. [`TXC-BATCH-006-PILOT-15-REASSESSED.csv`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-006-PILOT-15-REASSESSED.csv) (16 lines)
6. [`TXC-BATCH-006-PILOT-5-10-RECOMMENDED.csv`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-006-PILOT-5-10-RECOMMENDED.csv) (9 lines)
7. [`TXC-BATCH-006-PRODUCT-CLAIMS-VALIDATION.md`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC-BATCH-006-PRODUCT-CLAIMS-VALIDATION.md) (47 lines)
