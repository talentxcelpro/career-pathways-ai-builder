# TALENTXCEL.IN — AUTONOMOUS TESTING & SYNTHETIC SIMULATION ROADMAP

**Document ID:** TX-ROADMAP-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Scope:** Synthetic Persona Modeling, QA Infrastructure, Cost Projections (INR) & Phased Rollout Plan  
**Status:** ARCHITECTURAL ROADMAP SPECIFIED

---

## 1. SYNTHETIC PERSONA MATRIX & WORKFLOW COMPATIBILITY

To achieve pre-launch quality assurance without polluting production data or relying on manual testers, an autonomous synthetic user system must simulate realistic candidate and recruiter behaviors.

```
+---------------------------------------------------------------------------------------------------+
|                                  SYNTHETIC USER TAXONOMY                                          |
+------------------------------------+---------------------------------------+----------------------+
|          PERSONA ARCHETYPE         |            PRIMARY WORKFLOWS          |    TEST DATA FIXTURE |
+------------------------------------+---------------------------------------+----------------------+
| JS-01: Fresh Graduate (Tier-3)     | Onboarding, Entry Job Search, Apply   | 0 YOE, B.Tech 2026   |
| JS-02: Experienced Senior Engineer | Pro Subscribe, High-CTC Search, ATS   | 6 YOE, React/Node    |
| JS-03: Senior Executive / VP       | Career Map, Confidential Inquiry      | 15 YOE, Leadership   |
| JS-04: Career Switcher             | Learning Hub, Skill Assessment, Badges| Non-tech -> Python   |
| JS-05: Returning Professional      | Resume Builder, Gap Explanation       | 3-Yr Career Break    |
| JS-06: Incomplete Profile User     | Drop-off Recovery, Re-engagement Email| 30% Profile Strength |
| JS-07: Low ATS Candidate           | AI Optimizer, Rewrite Loop, Re-score  | Keyword-deficient CV |
| JS-08: High-Salary Targeter        | Salary Insights, Benchmark Check      | Target > ₹35 LPA     |
| JS-09: Remote Work Seeker          | Faceted Remote Filter, Fast Apply     | Remote-only filter   |
| JS-10: High-Frequency Applicant    | 10 Applications / Hour, Throttling    | Multi-job submission |
+------------------------------------+---------------------------------------+----------------------+
| EMP-01: Early-Stage Startup Founder| Recruiter Reg, Free Job Post, CRM     | Single seat, no GSTIN|
| EMP-02: SME Hiring Manager         | Verified KYC, Bulk Job Upload, Review | 5 active vacancies   |
| EMP-03: Enterprise Recruiter       | Verified Employer, Candidate Search   | 50 unlocks / month   |
| EMP-04: Recruitment Consultant     | Multi-Client Post, Candidate Export   | Agency team role     |
| EMP-05: High-Volume Hiring Team    | Campus Drive Coordination, Roster     | 100+ applicants      |
| EMP-06: Specialized Tech Recruiter | Vector Skill Query, Shortlisting      | Niche AI/ML criteria |
+------------------------------------+---------------------------------------+----------------------+
| PLT-01: Guest Anonymous Visitor    | Browse Jobs, View Salary, Public SEO  | No Auth State        |
| PLT-02: Free Registered User       | Basic Dashboard, 1 Free Resume DL     | Free Tier (`subscribers`)|
| PLT-03: Active Pro Subscriber      | Unlimited Downloads, AI Optimization  | `status = 'active'`  |
| PLT-04: Expired Subscriber         | Paywall Enforcement, Downgrade Banner | `ends_at < now()`    |
| PLT-05: Platform Administrator     | Job Moderation, Staff Management      | `user_roles: admin`  |
+------------------------------------+---------------------------------------+----------------------+
```

### Simulation Capabilities & Readiness
1. **Registration & Auth:** Fully compatible via Playwright and Supabase Admin API.
2. **Resume Creation & ATS Analysis:** Compatible; requires test PDF fixtures and mock/sandbox responses for Edge Functions.
3. **Job Search & Matching:** Fully compatible via existing database seed and RPC calculations.
4. **Application Submission:** Fully compatible; tests must target staging to prevent candidate pollution.
5. **Subscription & Payment:** Requires Razorpay test keys (`rzp_test_*`) or verified sandbox mock handlers.

---

## 2. INFRASTRUCTURE & OPERATING COST PROJECTIONS (INR)

*All costs are engineering estimates in Indian Rupees (INR) for budgeting purposes.*

```
+---------------------------------------------------------------------------------------------------+
|                                  THREE IMPLEMENTATION SCENARIOS                                   |
+--------------------------+-----------------------+-----------------------+------------------------+
|        DIMENSION         |   SCENARIO A: BASIC   | SCENARIO B: AUTONOMOUS|  SCENARIO C: ADVANCED  |
|                          |     BROWSER QA        |     PRE-LAUNCH QA     |       SIMULATION       |
+--------------------------+-----------------------+-----------------------+------------------------+
| Scope                    | Core regression tests | Full autonomous system| Behavioral + QA Swarm  |
| Persona Scale            | 10–25 personas        | 50–100 personas       | 500–1,000 personas     |
| Browser Workers          | 2 parallel workers    | 4–8 parallel workers  | 16 parallel workers    |
| Execution Frequency      | Daily nightly run     | Per PR + 4x daily runs| Continuous / On-demand |
| Testing Tool             | Playwright on GitHub  | Playwright + Worker VM| Playwright + MiroFish  |
| AI Simulation Engine     | Mock / Heuristic      | Direct LLM Validation | MiroFish Swarm + Zep   |
+--------------------------+-----------------------+-----------------------+------------------------+
```

### 2.1 Scenario A — Basic Browser QA Foundation
- **Target:** Verify 18 core functional user journeys, catch breaking UI regressions before release.
- **One-Time Setup Cost:** **₹25,000 – ₹45,000** (Playwright harness setup, 5 core fixtures, GitHub Actions pipeline).
- **Monthly Fixed Infrastructure:**
  - Supabase Dedicated Staging Branch/Project: ₹2,100 / month ($25 Pro plan).
  - GitHub Actions Minutes (1,000 mins/mo): Included in standard GitHub tier / ₹850 / month.
- **Monthly Variable Costs (LLM & Bandwidth):**
  - AI Edge Function test executions (Gemini Flash): ₹1,200 – ₹2,500 / month.
- **Total Monthly Operating Cost (Scenario A):** **₹4,150 – ₹5,450 / month**.

### 2.2 Scenario B — Autonomous Pre-Launch QA System
- **Target:** 50–100 synthetic personas continuously exercising the staging application, verifying email dispatch, validating database states, and filing automated triage tickets.
- **One-Time Setup Cost:** **₹75,000 – ₹1,30,000** (Full persona matrix, synthetic resume generators, database verification fixtures, automated Slack/webhook alerts).
- **Monthly Fixed Infrastructure:**
  - Supabase Staging Environment (Pro Tier + Compute Add-on): ₹4,200 / month.
  - Dedicated Testing Runner VM (8 vCPU, 16 GB RAM for parallel Playwright): ₹6,500 / month.
  - S3 / R2 Test Artifact Storage (Videos, Traces, Screenshots): ₹800 / month.
- **Monthly Variable Costs:**
  - LLM Evaluation & AI workflow validation (GPT-4o-mini / Gemini 1.5 Flash): ₹4,500 – ₹9,000 / month.
  - Test Email Dispatch (AWS SES Sandbox): ₹400 / month.
- **Total Monthly Operating Cost (Scenario B):** **₹16,400 – ₹20,900 / month**.

### 2.3 Scenario C — Advanced Pre-Launch & Market Simulation (MiroFish Hybrid)
- **Target:** 500–1,000 autonomous personas simulating candidate applications, salary bargaining, employer job posting elasticity, and functional UI regression at scale.
- **One-Time Setup Cost:** **₹1,80,000 – ₹3,20,000** (Playwright framework + isolated MiroFish microservice deployment, Zep graph configuration, Indian market seed ingestion).
- **Monthly Fixed Infrastructure:**
  - Dedicated MiroFish Simulation Host (16 vCPU, 32 GB RAM, NVMe): ₹12,000 – ₹16,000 / month.
  - Zep Cloud Memory Subscription: ₹4,000 – ₹6,000 / month.
  - Playwright Distributed Worker Fleet: ₹8,000 / month.
  - Supabase Performance Staging Database: ₹6,500 / month.
  - Storage & Artifact Management: ₹2,000 / month.
- **Monthly Variable Costs:**
  - LLM Multi-Agent Simulation Tokens (~20M tokens/month via DeepSeek/OpenAI): ₹15,000 – ₹35,000 / month.
- **Total Monthly Operating Cost (Scenario C):** **₹47,500 – ₹73,500 / month**.

---

## 3. PHASED IMPLEMENTATION ROADMAP

```
Phase 0           Phase 1           Phase 2           Phase 3           Phase 4           Phase 5           Phase 6
+-------------+   +-------------+   +-------------+   +-------------+   +-------------+   +-------------+   +-------------+
| FORENSIC    |==>| SECURITY    |==>| FUNCTIONAL  |==>| BROWSER QA  |==>| SYNTHETIC   |==>| AUTONOMOUS  |==>| ADVANCED    |
| DISCOVERY   |   | HARDENING   |   | REMEDIATION |   | FOUNDATION  |   | PERSONAS    |   | INTELLIGENCE|   | SIMULATION  |
| (TASK 001)  |   | (CRITICAL)  |   | (DEFECTS)   |   | (PLAYWRIGHT)|   | (50 USERS)  |   | (TRIAGE)    |   | (MIROFISH)  |
+-------------+   +-------------+   +-------------+   +-------------+   +-------------+   +-------------+   +-------------+
  Completed        Next Step         Prerequisite      QA Engine         Simulation        AI Reporting      Market Model
```

### Phase 0 — Discovery and Risk Classification *(COMPLETED IN TASK 001)*
- Comprehensive codebase inspection.
- 8 pre-launch intelligence reports generated.
- Critical vulnerabilities and missing edge functions cataloged.

### Phase 1 — Security and Data Integrity Hardening *(RECOMMENDED NEXT TASK)*
- **Remediate SEC-001:** Purge hardcoded phone numbers from client bundles; lock super-admin authorization strictly to server-side Postgres RLS.
- **Remediate SEC-002:** Lock `claim1_process_verified_bid` stored procedure; route bid verification exclusively through an HMAC-SHA256 signature verification edge function.
- **Remediate SEC-003:** Make `documents` storage bucket private; implement authenticated RLS on candidate supporting documents.
- **Remediate SEC-005:** Disable automatic demo mode activation in `razorpay-verify-payment` when running in production.

### Phase 2 — Functional Readiness & Edge Function Remediation
- Deploy missing Edge Functions (`razorpay-create-oneoff`, `record-resume-download`) to restore resume monetization.
- Fix candidate lookup pagination in `api/jobs/apply.ts`.
- Ensure all Edge Functions have explicit CORS restrictions.

### Phase 3 — Browser QA Foundation (Playwright Staging)
- Provision dedicated staging environment (`staging.talentxcel.in`).
- Install and configure Playwright with cross-subdomain authentication persistence.
- Implement automated test suites for top 18 critical functional user paths.

### Phase 4 — Synthetic User Persona Execution
- Introduce the 23 candidate, employer, and platform personas.
- Execute automated end-to-end user journeys (application submission, employer candidate review, Pro upgrade).
- Verify database state mutations and idempotent cleanup scripts.

### Phase 5 — Autonomous QA Intelligence & Quality Gates
- Configure automated failure classification and Playwright trace uploads.
- Implement Slack / Discord alert webhooks on regression failures.
- Enforce Playwright CI gate on all pull requests.

### Phase 6 — Advanced Market Simulation (Independent MiroFish Microservice)
- Deploy independent MiroFish container service on isolated cloud VM.
- Connect via sanitized JSON REST bridge (zero shared code, zero shared database).
- Run periodic simulation cycles to forecast employer pricing tolerance and candidate salary elasticity.
