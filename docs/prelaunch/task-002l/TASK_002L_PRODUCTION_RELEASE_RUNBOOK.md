# TALENTXCEL.IN — TASK 002L PRODUCTION RELEASE RUNBOOK
## SEQUENTIAL EXECUTION RUNBOOK, VERIFICATION GATES & EMERGENCY ROLLBACK

**Target System:** TalentXcel.in exclusively  
**Mission ID:** `TXC-SEC-002L`  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Active Working Tree:** `C:\Users\Arshid.Wani\talentxcel-main`  
**Release Branch:** `main`  
**Certified Commit:** `0a46bd32953e1a383133d88e301ca9b9c206d1c0`  
**Production Project Ref:** `dthlgsnakhoftinssokm` (`Talentxcel.in` — Region: `ap-southeast-1`)  
**Staging Project Ref:** `pvwwtquuexhyydwihjbi` (`TalentXcel Staging`)  
**Version:** 1.0.0-PROD  
**Classification:** **CONTROLLED EXECUTION RUNBOOK**

---

### 1. Release Architecture & Principles

This runbook defines the exact step-by-step operational procedure for executing the Task 002 production release of TalentXcel.in.

> [!CAUTION]
> **GOVERNANCE MANDATE:**
> This runbook is an execution procedure for a future authorized release window. It does NOT authorize immediate production execution. Execution requires separate, explicit operator sign-off.
> Never run these commands against production without completing every Preflight Gate.

```mermaid
flowchart TD
    G[Preflight Gates & Authorization] --> S0[Phase 0: Production Secret Remediation]
    S0 --> S1[Phase 1: Pre-Release Database Backup Snapshot]
    S1 --> S2[Phase 2: Database Migration Execution\n(Migration 1 -> Migration 2)]
    S2 --> S3[Phase 3: Database Verification Smoke Test]
    S3 --> S4[Phase 4: Edge Function Sequential Deployment]
    S4 --> S5[Phase 5: Edge Runtime Smoke Verification]
    S5 --> S6[Phase 6: Frontend Vercel Production Release]
    S6 --> S7[Phase 7: End-to-End Post-Release Sanity Audit]
    
    S2 -.->|Abort Trigger| RB[Two-Phase Emergency Rollback]
    S4 -.->|Abort Trigger| RB
```

---

### 2. Preflight Gates (Must All Be Satisfied)

Before opening the production release window, the release operator must verify:

- [ ] **Gate 1: Repository & Working Tree State**
  ```bash
  cd C:\Users\Arshid.Wani\talentxcel-main
  git status
  git rev-parse HEAD
  ```
  *Requirement:* Working tree must be clean. Current HEAD must match `0a46bd32953e1a383133d88e301ca9b9c206d1c0`.
- [ ] **Gate 2: Target Project ID Confirmation**
  *Requirement:* Target must be `dthlgsnakhoftinssokm`. Under no circumstances should production commands reference `pvwwtquuexhyydwihjbi` (staging) or any other project ID.
- [ ] **Gate 3: Off-Peak Maintenance Window**
  *Requirement:* Release scheduled during low-traffic window (recommended: 02:00–04:00 IST) to minimize active candidate CV upload disruption.
- [ ] **Gate 4: Staging Health Baseline**
  *Requirement:* Staging project `pvwwtquuexhyydwihjbi` has passed all 64 verification vectors.

---

### 3. Execution Phases

#### Phase 0: Production Secrets Remediation (Prerequisite)
Prior to deploying payment functions, configure the standard Razorpay environment variables on production:

```bash
# Set Razorpay live API credentials on production Supabase
npx supabase secrets set \
  RAZORPAY_KEY_ID="rzp_live_TtEFSPjrXgDeoB" \
  RAZORPAY_KEY_SECRET="<INSERT_VALID_PRODUCTION_KEY_SECRET>" \
  --project-ref dthlgsnakhoftinssokm

# Verify all four required secrets are listed
npx supabase secrets list --project-ref dthlgsnakhoftinssokm
```
*Verification Invariant:* Output must list `GEMINI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.

---

#### Phase 1: Database Pre-Release Backup Snapshot
Capture a point-in-time schema and data snapshot:

```bash
# Create local schema backup
npx supabase db dump -f "reports/prod_pre_release_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql" --project-ref dthlgsnakhoftinssokm
```

---

#### Phase 2: Sequential Database Migration Execution
Apply the certified migrations in strict dependency order:

```bash
# 1. Apply Migration 1 (Roles, Bids, Storage, Downloads, Rate Limiter)
npx supabase db query -f supabase/migrations/20261030150000_task_002_security_hardening.sql --project-ref dthlgsnakhoftinssokm

# 2. Apply Migration 2 (Candidate Storage UPDATE Policy & Folder Isolation)
npx supabase db query -f supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql --project-ref dthlgsnakhoftinssokm
```

---

#### Phase 3: Database Verification Smoke Test
Execute the catalog verification query against production:

```sql
SELECT 
  (SELECT count(*)::int FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Candidates can update own documents') AS has_update_policy,
  (SELECT proname FROM pg_proc WHERE proname = 'check_rate_limit') AS has_rate_limit_proc,
  (SELECT proname FROM pg_proc WHERE proname = 'record_resume_download_atomic') AS has_download_proc,
  (SELECT relname FROM pg_class WHERE relname = 'edge_rate_limits') AS has_rate_limit_table;
```
*Expected Result:*
- `has_update_policy: 1`
- `has_rate_limit_proc: "check_rate_limit"`
- `has_download_proc: "record_resume_download_atomic"`
- `has_rate_limit_table: "edge_rate_limits"`

---

#### Phase 4: Edge Functions Sequential Deployment
Deploy Edge Functions in dependency order:

```bash
# Step 4A: Deploy AI & Parsing Functions
npx supabase functions deploy gemini-ai --project-ref dthlgsnakhoftinssokm --no-verify-jwt
npx supabase functions deploy ai-resume-parser --project-ref dthlgsnakhoftinssokm

# Step 4B: Deploy Storage Accounting Function
npx supabase functions deploy record-resume-download --project-ref dthlgsnakhoftinssokm

# Step 4C: Deploy Payment Gateway Functions
npx supabase functions deploy razorpay-create-order --project-ref dthlgsnakhoftinssokm
npx supabase functions deploy razorpay-verify-payment --project-ref dthlgsnakhoftinssokm --no-verify-jwt
npx supabase functions deploy razorpay-create-oneoff --project-ref dthlgsnakhoftinssokm
npx supabase functions deploy razorpay-verify-oneoff --project-ref dthlgsnakhoftinssokm
```

---

#### Phase 5: Edge Runtime Smoke Verification
Validate runtime availability and CORS preflight headers:

```bash
# Test CORS preflight on gemini-ai
curl -i -X OPTIONS "https://dthlgsnakhoftinssokm.supabase.co/functions/v1/gemini-ai" \
  -H "Origin: https://talentxcel.in" \
  -H "Access-Control-Request-Method: POST"

# Expected: HTTP/2 200 with Access-Control-Allow-Origin: https://talentxcel.in
```

---

#### Phase 6: Frontend Vercel Production Release
Deploy the certified frontend build from `main`:

```bash
# Trigger production deployment via Vercel CLI (or merge to production branch in Vercel Git integration)
npx vercel --prod
```

---

#### Phase 7: End-to-End Post-Release Sanity Audit
The operator must verify the following live user journeys on `https://talentxcel.in`:
1. **Candidate Login & Document Upsert:** Log in with an internal test candidate account; upload a CV, then re-upload with the same name. Confirm replacement succeeds with HTTP 200.
2. **Employer Applicant View:** Log in as an employer; view an applicant's resume. Confirm atomic download tracking increments correctly.
3. **AI Resume Parser:** Submit a sample resume; confirm skill extraction completes without rate limit errors.
4. **Rate Limiting:** Send 25 rapid requests to `/gemini-ai`; confirm HTTP 429 throttling engages gracefully.

---

### 4. Two-Phase Emergency Rollback Procedure

If a critical failure occurs during deployment (e.g. database locking, unrecoverable Edge Function failure), execute the following **Two-Phase Rollback**:

#### Step 1: Drop Migration 2 Storage UPDATE Policy
```bash
npx supabase db query "DROP POLICY IF EXISTS \"Candidates can update own documents\" ON storage.objects;" --project-ref dthlgsnakhoftinssokm
```

#### Step 2: Execute Migration 1 Rollback Script
```bash
npx supabase db query -f supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql --project-ref dthlgsnakhoftinssokm
```

#### Step 3: Verify Dropped Objects
```sql
SELECT 
  (SELECT count(*)::int FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%Candidates%') AS candidate_storage_policies,
  (SELECT proname FROM pg_proc WHERE proname = 'check_rate_limit') AS proc_check_rate_limit,
  (SELECT relname FROM pg_class WHERE relname = 'edge_rate_limits') AS table_edge_rate_limits;
```
*Expected Result:* `candidate_storage_policies: 0`, `proc_check_rate_limit: null`, `table_edge_rate_limits: null`.

#### Step 4: Frontend Rollback
Roll back Vercel deployment to the previous instant deployment hash in the Vercel Dashboard.

---

### 5. Abort Triggers & Decision Matrix

| Condition / Trigger | Immediate Action | Escalation |
|---|---|---|
| Migration query times out (> 30s) | Terminate query; execute Phase 4 Rollback | Notify Database Admin |
| Storage UPDATE policy fails to apply | Do NOT deploy Edge Functions; execute Rollback | Security Lead |
| Production secrets return missing | Halt Phase 4; remediate secrets before continuing | DevOps Lead |
| Live candidate upsert returns 403 | Execute Step 1 & Step 2 Rollback | Immediate Incident |
| Edge Function returns 500 on all calls | Check Supabase logs; redeploy previous function bundle | Edge Function Lead |

---

### 6. Sign-Off & Runbook Conclusion

This runbook provides an auditable, reproducible, and fail-safe execution protocol. Following these steps guarantees that production receives the exact patchset validated on staging with zero unplanned downtime.