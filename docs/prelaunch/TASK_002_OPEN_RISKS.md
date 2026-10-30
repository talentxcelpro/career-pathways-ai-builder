# TASK 002: OPEN RISKS, DEFERRED ITEMS & STAGING READINESS ASSESSMENT

**Project:** TalentXcel.in  
**Audit Context:** Transition from Task 002 (Security Remediation) to Task 003 (Pre-Launch Testing & Simulation Readiness)  
**Document Version:** 1.0.0  
**Status Date:** 2026-10-30  

---

## 1. RESIDUAL RISKS POST-TASK 002

While all ten identified security findings (SEC-001 through SEC-010) have been code-remediated, several environmental and architectural dependencies must be actively managed before launching autonomous synthetic users:

### Risk 1: Live Database Migration Execution Deferred
- **Severity:** HIGH (Operational)
- **Detail:** The hardened SQL migration (`20261030150000_task_002_security_hardening.sql`) is staged on Git branch `security/task-002-hardening` and has not yet been executed against the live Supabase instance (`dthlgsnakhoftinssokm.supabase.co`).
- **Impact:** Until the migration is applied to production, the `documents` storage bucket remains public on the live Supabase server, and `claim1_process_verified_bid` can still theoretically be called directly if an attacker discovers its signature.
- **Mitigation:** Schedule migration application during off-peak hours under direct human observation following the deployment plan.

### Risk 2: Live Payment Gateway Webhook Synchronization
- **Severity:** MEDIUM (Functional)
- **Detail:** In production, Razorpay transactions rely on accurate `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` configured in Supabase Edge Function environment secrets. If production secrets are misconfigured or rotated out-of-sync, legitimate payments will fail closed (as designed).
- **Mitigation:** Verify environment secrets in Supabase dashboard before enabling paid monetization features.

### Risk 3: Staging Environment Isolation for Synthetic User Simulation
- **Severity:** HIGH (Architectural)
- **Detail:** There is currently no dedicated staging database instance isolated from production (`dthlgsnakhoftinssokm.supabase.co`). Running high-concurrency synthetic candidate journeys (job applications, profile creations, test resumes) against the live production database risks polluting live employer job applicant pipelines and search ranking metrics.
- **Mitigation:** Establish an isolated staging project or tag all synthetic data with explicit flags (`is_synthetic: true`, `synthetic_run_id: UUID`) with automated teardown cleanup routines before initiating synthetic-user simulations.

---

## 2. DEFERRED ITEMS FOR TASK 003 & BEYOND

| Item ID | Component | Description | Rationale for Deferral |
| :--- | :--- | :--- | :--- |
| **DEF-001** | End-to-End Test Suite | Playwright / Cypress browser automation harness | Explicitly prohibited during Task 002 to ensure atomic security hardening without mixing testing harnesses. Scheduled for Task 003. |
| **DEF-002** | Synthetic Candidate Journey Simulator | Autonomous bot simulating candidate registration, resume upload, and job application | Requires isolated staging environment or data tagging mechanism to avoid corrupting production database. |
| **DEF-003** | Automated Regression CI Pipeline | GitHub Actions workflow executing end-to-end browser tests on PRs | Scheduled for deployment after browser test harness is established. |
| **DEF-004** | Live Database Schema Synchronization | Pruning obsolete or orphaned migration files from legacy history (1,054 historical migration files vs. 465 live tables) | Requires live database audit and table-by-table reference check to avoid dropping active columns. |

---

## 3. READINESS GATES FOR TASK 003

To advance from Task 002 to Task 003 (Staging Environment Setup & Functional Simulation Preparation), the following gates must be met:

1. [x] **Code Hardening Complete:** SEC-001 through SEC-010 code changes committed to `security/task-002-hardening`.
2. [x] **Static Type Safety:** `npx tsc --noEmit` passes with 0 errors.
3. [x] **Build Safety:** `npm run build` succeeds cleanly.
4. [x] **Production CI Gate:** `scripts/seo-ci-gate.ts` passes 100% (`4,315 / 4,315`).
5. [x] **Migration Staging:** Forward and rollback SQL scripts created and documented.
6. [ ] **Executive Sign-off:** Human approval of Task 002 implementation report and migration scripts.
7. [ ] **Staging Strategy Alignment:** Confirmation of isolated staging database vs. synthetic data tagging approach.

---

## 4. RECOMMENDATION

Task 002 is complete and verified. It is recommended to merge `security/task-002-hardening` to `main`, apply the staged migration to the database in a controlled window, and proceed to Task 003 to establish the testing framework and synthetic user environment.
