# UDX v3.1 Path Specificity & Domain Diversity Audit Report

**Operating Mode:** `MODE_B_REALITY = ACTIVE`  
**Test Suite:** `scripts/test-domain-path-diversity.cjs`  
**Verification Date:** September 16, 2026  
**Result:** PASSED (100% SPECIFICITY • ZERO DOMAIN LEAKAGE)  

---

## 1. Metric Definitions & Acceptance Targets

### 1.1 Intent Specificity Rate (ISR)
Dynamic metric computed across 5 deterministic criteria for each canonical domain resolution:
1. `DOMAIN_CLASSIFICATION_CORRECT`: Evaluates whether intent domain matches target taxonomy.
2. `ENTITY_MATCH_CORRECT`: Evaluates whether extracted entities represent domain concepts.
3. `CONSTRAINT_MATCH_CORRECT`: Evaluates whether financial, temporal, or geographic constraints match.
4. `TARGET_RELEVANCE_CORRECT`: Evaluates whether the generated execution targets are domain-specific.
5. `EVIDENCE_RELEVANCE_CORRECT`: Evaluates whether attached evidence records ground the specific domain claims.

$$\text{ISR} = \frac{\sum \text{Passed Criteria}}{\text{Total Criteria Evaluated}} \times 100\%$$

**Gate Target:** $\text{ISR} = 100\%$ on canonical suite (30/30 criteria).

### 1.2 Domain Leakage Rate (DLR)
Quantifies whether irrelevant career targets (`/jobs`, `/tools/resume-checker`, `/tools/job-matcher`) leak into non-career domains:

$$\text{DLR} = \frac{\text{Non-Career Resolutions Containing Career Targets}}{\text{Total Non-Career Resolutions}} \times 100\%$$

**Gate Target:** $\text{DLR} = 0.0\%$ (Strict Zero Tolerance).

---

## 2. Canonical Suite Empirical Audit Results

| Domain | Signal | Adapter ID | Best Target URI | Evidence Grounding | DLR | ISR |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **CAREER** | *"frontend developer job in Varanasi"* | `adapter-career-v3` | `/jobs?role=software-engineer&location=Varanasi&verified=true` | `EVID-EXP-TIME-TO-OUTCOME-35D`<br>`EVID-SUPABASE-VNS-884` | N/A | **5/5** (100%) |
| **EDUCATION** | *"AI master's course under ₹5 lakh"* | `adapter-education-v3` | `/education/programs/ai-masters-degree` | `EVID-EDU-UGC-AICTE-ACCRED`<br>`EVID-EDU-FEE-DISCLOSURE-2026` | **0.0%** | **5/5** (100%) |
| **BUSINESS** | *"register MSME in Uttar Pradesh"* | `adapter-business-v3` | `/business/msme/statutory-checklist`<br>$\rightarrow$ `udyamregistration.gov.in` | `EVID-GOV-MSME-UDYAM-STATUTORY`<br>`EVID-UP-NIVESH-MITRA-SLA` | **0.0%** | **5/5** (100%) |
| **FINANCE** | *"reduce monthly expenses by ₹20,000"* | `adapter-finance-v3` | `/tools/expense-calculator`<br>$\rightarrow$ `/finance/calculators/budget-allocator` | `EVID-SEBI-MF-DISCLOSURE-REG`<br>`EVID-AMFI-TER-BENCHMARK` | **0.0%** | **5/5** (100%) |
| **LOCAL_SERVICES** | *"find a plumber in Varanasi"* | `adapter-local-services-v3` | `/services/varanasi/plumbing` | `EVID-VTG-TRADE-GUILD-SLA`<br>`EVID-VTG-RATECARD-199` | **0.0%** | **5/5** (100%) |
| **PERSONAL** | *"use three free hours every evening productively"* | `adapter-personal-v3` | `/productivity/evening-time-audit`<br>$\rightarrow$ `/productivity/deep-work-tracker` | `EVID-COG-DELIBERATE-PRACTICE`<br>`EVID-TIME-AUDIT-EFFICACY` | **0.0%** | **5/5** (100%) |

---

## 3. Summary of Acceptance Gates

- **Distinct Domains Resolved:** 6 / 6 (100%)
- **Unique Best Target URIs:** 6 / 6 (0 collisions)
- **Aggregated ISR:** **30 / 30 (100.0%)**
- **Domain Leakage Rate (DLR):** **0 / 5 (0.0%)**
- **Simulation Isolation Gate:** **PASSED** (unsupported signals rejected with `NO_RELIABLE_PATH`; 0 synthetic paths generated under `MODE_B_REALITY`).
