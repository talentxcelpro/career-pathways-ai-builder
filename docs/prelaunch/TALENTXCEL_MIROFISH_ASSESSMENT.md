# TALENTXCEL.IN — MIROFISH SIMULATION COMPATIBILITY ASSESSMENT

**Document ID:** TX-MIROFISH-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Evaluated Technology:** MiroFish (https://github.com/666ghj/MiroFish)  
**Status:** ARCHITECTURAL FEASIBILITY & COMPATIBILITY EVALUATION COMPLETE

---

## 1. EXECUTIVE ASSESSMENT & CORE VERDICT

MiroFish is an open-source, next-generation AI swarm intelligence and multi-agent simulation engine created by developer `666ghj`. It models complex socio-economic environments by instantiating hundreds to thousands of virtual agents that interact, communicate, and evolve over temporal memory rounds to forecast market reactions.

### Key Architectural Finding
**MiroFish is NOT a replacement for browser-based functional testing (QA).**
- **MiroFish** is a **market and behavioral dynamics simulation engine**.
- **Playwright** is an **application functional and end-to-end testing framework**.
- These two systems serve entirely orthogonal purposes in the pre-launch validation pipeline and must not be conflated.

### Critical Legal & Licensing Constraint
- **License:** MiroFish is distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
- **Copyleft Invariant:** Embedding, importing, or statically/dynamically linking MiroFish source code into the proprietary TalentXcel.in application would trigger AGPL copyleft provisions, legally jeopardizing the proprietary ownership of TalentXcel.in.
- **Mandatory Isolation Architecture:** MiroFish **must operate exclusively as an independent, decoupled external microservice** running in an isolated container environment and communicating with TalentXcel.in strictly over documented, networked REST/JSON APIs.

---

## 2. FUNCTIONAL QA VS. BEHAVIORAL SWARM SIMULATION

To prevent architectural misalignment, the boundary between functional QA and market simulation must be strictly maintained:

```
+---------------------------------------------------------------------------------------------------+
|                                 TWO DISTINCT TESTING PARADIGMS                                    |
+-------------------------------------------------+-------------------------------------------------+
|          BROWSER FUNCTIONAL TESTING             |         BEHAVIORAL SWARM SIMULATION             |
|                 (Playwright)                    |                  (MiroFish)                     |
+-------------------------------------------------+-------------------------------------------------+
| Objective: "Does the button work?"              | Objective: "Will people actually buy this?"     |
| - DOM element presence and rendering            | - Candidate salary expectations & resistance    |
| - Form validation and input sanitization        | - Employer willingness to pay for job boosts    |
| - Supabase authentication & PKCE session flow   | - Conversion drop-off at ₹999 pricing tier      |
| - Database CRUD mutations & RLS enforcement     | - Perceived value of ATS diagnostic scores      |
| - HTTP 200/400/500 API responses                | - Emergent market dynamics & candidate churn    |
| - Payment gateway modal launch & callbacks      | - Recruiter shortlisting preference patterns    |
| - Cross-browser & mobile viewport layout        | - Feature adoption under competitive pressure   |
+-------------------------------------------------+-------------------------------------------------+
```

---

## 3. TECHNICAL SPECIFICATIONS & ARCHITECTURE

### 3.1 Upstream Technology Stack
- **Backend Core:** Python `3.10`+ (utilizing Flask / FastAPI asynchronous server architectures).
- **Frontend Dashboard:** Node.js, Vue.js, Tailwind CSS for simulation visualization and interrogation.
- **Agent Orchestration Framework:** OASIS simulation standard (configured via `OASIS_DEFAULT_MAX_ROUNDS` to manage execution cycles and message passing).
- **Memory & Graph Layer:**
  - **Zep Cloud (`ZEP_API_KEY`):** Provides temporal entity-relationship memory graphs and long-term context retention for virtual agents.
  - **GraphRAG:** Graph Retrieval-Augmented Generation to ground agent reasoning in domain knowledge (e.g., Indian tech industry hiring benchmarks).
- **LLM Provider Compatibility:**
  - OpenAI (GPT-4o, GPT-4o-mini)
  - DeepSeek (DeepSeek-V3, DeepSeek-Coder)
  - Anthropic (Claude 3.5 Sonnet)
  - Google Gemini (Gemini 1.5 Flash / Pro) via OpenAI-compatible endpoints or native SDK.

### 3.2 System Requirements & Deployment Footprint
To operate MiroFish as an independent simulation service supporting TalentXcel.in:

| Resource | Minimum Specification | Recommended Production Spec |
|---|---|---|
| **CPU** | 4 vCPUs (x86_64 or ARM64) | 8–16 vCPUs |
| **RAM** | 16 GB | 32–64 GB (for large multi-agent graphs) |
| **Storage** | 50 GB NVMe SSD | 100 GB+ NVMe SSD |
| **GPU** | None (API-based inference) | Optional (for local embeddings) |
| **Deployment Mode** | Docker Compose / Container Engine | Managed Kubernetes / ECS / VM Instance |
| **External Dependencies** | Zep Cloud API + LLM API Provider | Zep Cloud + Dedicated LLM Key |

---

## 4. AGENT CAPABILITIES FOR RECRUITMENT MARKET SIMULATION

When seeded with Indian recruitment market parameters (e.g. Tier-1 vs Tier-2 college graduates, CTC ranges of ₹3.5 LPA to ₹45 LPA, tech stacks, notice periods), MiroFish can model realistic candidate and recruiter behaviors:

### 4.1 Candidate Persona Archetypes
1. **Fresh Graduate (Tier-3 College):** Low salary leverage (₹3.5–₹5 LPA), high application velocity, highly sensitive to ATS optimization scores, zero tolerance for paid upfront fees.
2. **Mid-Level Fullstack Developer (3–5 YOE):** Moderate leverage (₹12–₹20 LPA), targeting remote roles, selective applications, evaluates company culture and tech stack transparency.
3. **Senior Engineering Manager (10+ YOE):** High leverage (₹45+ LPA), passive candidate, values confidential recruiter outreach, high willingness to pay for executive career services.
4. **Career Switcher (Non-tech to Data Analytics):** High anxiety, seeks portfolio and certification validation, tests readiness score before applying.

### 4.2 Recruiter & Employer Archetypes
1. **Early-Stage Startup Founder:** Needs immediate hires, evaluates generalist ability, zero recruitment agency budget, high sensitivity to job posting fees.
2. **High-Growth Mid-Market Recruiter:** High-volume hiring (20–50 openings/quarter), demands advanced ATS filtering, willing to bid for top placement in Claim #1.
3. **Enterprise Talent Acquisition Lead:** Heavy compliance, strict degree/notice period criteria, relies on verifiable credentials and skill assessment scores.

---

## 5. INTEGRATION ARCHITECTURE FOR TALENTXCEL.IN

To comply with AGPL-3.0 licensing and maintain system isolation, MiroFish must communicate with TalentXcel.in across an asynchronous API bridge:

```
+----------------------------------+                   +----------------------------------+
|          TALENTXCEL.IN           |                   |         MIROFISH SERVICE         |
|      (Proprietary Codebase)      |                   |          (AGPL-3.0 Engine)       |
|                                  |                   |                                  |
|   +--------------------------+   |   HTTPS / JSON    |   +--------------------------+   |
|   | Synthetic Data Exporter  |==>|==================>|   | Ingestion Gateway        |   |
|   | (Anonymized Market Data) |   | (REST POST Event) |   | (Seed Graph Builder)     |   |
|   +--------------------------+   |                   |   +--------------------------+   |
|                                  |                   |                |                 |
|                                  |                   |                v                 |
|                                  |                   |   +--------------------------+   |
|                                  |                   |   | Swarm Simulation Core    |   |
|                                  |                   |   | - 500 Virtual Agents     |   |
|                                  |                   |   | - Zep Memory Graph       |   |
|                                  |                   |   | - Temporal Rounds (OASIS)|   |
|                                  |                   |   +--------------------------+   |
|                                  |                   |                |                 |
|   +--------------------------+   |   Webhook / Push  |                v                 |
|   | Simulation Intelligence  |<==|<==================|   | Intelligence Reporter    |   |
|   | Dashboard (Admin Only)   |   |   (JSON Summary)  |   | (Forecasts & Resistance) |   |
|   +--------------------------+   |                   |   +--------------------------+   |
+----------------------------------+                   +----------------------------------+
```

### Integration Guidelines
1. **No Shared Database:** MiroFish must never connect directly to the production or staging Supabase PostgreSQL instance. Data must be transmitted via serialized, sanitized JSON payloads.
2. **Anonymized Seed Data Only:** Never send real candidate PII (names, phone numbers, email addresses, resume documents) to the simulation engine. Seed data must consist strictly of synthetic or aggregated statistics.
3. **Read-Only Impact on TalentXcel:** Simulation results are analytical reports stored in administrative tables; they must never automatically alter live job listings or user records.

---

## 6. ESTIMATED OPERATING COSTS (INR)

*All figures are estimates based on standard cloud compute and API token pricing.*

### 6.1 Fixed Infrastructure Costs (Monthly)
- **Container / VM Compute (4 vCPU, 16 GB RAM):** ₹4,000 – ₹7,500 / month (DigitalOcean / AWS / Hetzner).
- **Zep Cloud Memory Tier:** ₹2,500 – ₹6,000 / month (based on active agent graph volume).
- **Storage & Backup (SSD):** ₹500 – ₹1,000 / month.
- **Total Fixed Monthly Cost:** **₹7,000 – ₹14,500 / month**.

### 6.2 Variable LLM Token Costs (Per Simulation Run)
Assuming a simulation of 250 agents running for 10 rounds (2,500 agent interaction cycles):
- **DeepSeek-V3 / GPT-4o-mini:** ~5M tokens per complete simulation run = ~₹600 – ₹1,500 per run.
- **Claude 3.5 Sonnet / GPT-4o:** ~5M tokens = ~₹6,000 – ₹12,000 per run.
- **Monthly Run Budget (4 simulation cycles/month with economical models):** **₹2,400 – ₹6,000 / month**.

### 6.3 Total Monthly Budget Estimate
- **Economical Implementation (DeepSeek / Gemini Flash):** **₹9,400 – ₹20,500 / month**.
- **High-Fidelity Implementation (GPT-4o / Claude):** **₹31,000 – ₹62,500 / month**.

---

## 7. RECOMMENDATION & TIMELINE

1. **Do Not Deploy MiroFish During Phase 0–2:** Basic application stability, security hardening, and browser-based Playwright QA must be completed first.
2. **Deploy as Independent Service in Phase 6:** When the core product workflows are verified, evaluate deploying MiroFish on a dedicated virtual machine to simulate pricing resistance for the Claim #1 bidding auction and Pro subscription packages.
3. **Strict License Compliance:** Ensure the legal team confirms total network and repository isolation to maintain proprietary copyright integrity.
