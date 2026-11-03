# TASK 002K — RELEASE READINESS & PRODUCTION ROLLOUT PROTOCOL

**Target Application:** TalentXcel.in exclusively  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Current Branch:** `main`  
**Current Published HEAD:** `acb9edb0cbba88d31717cab1b5f00bd059b1ca4d`  
**Original Merge Commit:** `5a31d1560e5e240c582a351b836f54e5bdb21453`  
**Security Feature HEAD:** `dc446320edb8f7f5408543662820c522591dc2fb`  
**Backup Anchor:** `backup/main-pre-task-002-819fc3b6` (`819fc3b6ee0073d29bbfc6bf6654f9668885dfd8`)  
**Production Supabase Reference:** `dthlgsnakhoftinssokm` (`Talentxcel.in` — Unmutated, Isolated)  
**Staging Supabase Reference:** `pvwwtquuexhyydwihjbi` (`TalentXcel Staging` — Verified)  
**Status:** **READY FOR PRODUCTION ROLLOUT AUTHORIZATION**  

---

## 1. RELEASE STATE SUMMARY

1. **Git Integration Complete:**
   - Feature branch `security/task-002-hardening` (`dc446320`) was promoted into `main` via a strict fast-forward merge (`--ff-only`) at commit `5a31d156`.
   - The publication report was subsequently committed and pushed to GitHub at commit `acb9edb0`.
   - `main` and `origin/main` now sit at published HEAD `acb9edb0cbba88d31717cab1b5f00bd059b1ca4d`.
   - Backup reference `backup/main-pre-task-002-819fc3b6` guarantees instant recovery to the exact pre-merge state (`819fc3b6`) if ever required.
2. **Quality Gates Certified:**
   - 100% pass rate across TypeScript compilation, CORS security vectors, distributed rate limiting, staging candidate storage upsert, and SEO CI invariants.
   - Production Vite build confirmed working with zero errors.
3. **Production Isolation Maintained:**
   - Zero production database migrations have been executed.
   - Zero production Edge Functions have been deployed.
   - Zero live financial transactions or live credentials touched.

---

## 2. PRODUCTION ROLLOUT READINESS CHECKLIST

Before authorizing production release, confirm the execution prerequisites:

- [x] Fast-forward merge verified on `main`.
- [x] Zero merge conflicts or synthetic merge commits.
- [x] All 8 Task 002J reports and 4 Task 002K reports committed and verified in `docs/prelaunch/`.
- [x] Idempotent migration scripts reviewed for safety:
  - `supabase/migrations/20261030150000_task_002_security_hardening.sql`
  - `supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`
- [x] Deterministic rollback script validated:
  - `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql`
- [x] Production database snapshot procedure defined.
- [x] Secrets configuration roadmap prepared.

---

## 3. CONTROLLED PRODUCTION ROLLOUT PROTOCOL (STEP-BY-STEP)

When production rollout authorization is explicitly granted by human leadership, execute in this strict chronological order:

### STEP 1: Production Database Snapshot & Pre-Deployment Baseline
1. Log into the Supabase Dashboard for project `dthlgsnakhoftinssokm`.
2. Navigate to **Database** -> **Backups** and trigger a manual database snapshot.
3. Verify that the snapshot completes successfully before applying any DDL.

### STEP 2: Execute Production Database Migrations
Apply the migrations transactionally against production `dthlgsnakhoftinssokm`:
1. **Security Hardening Migration:**
   Apply `supabase/migrations/20261030150000_task_002_security_hardening.sql`.
   - Confirms table `public.edge_rate_limits`.
   - Confirms stored procedure `check_edge_rate_limit`.
   - Confirms stored procedure `is_app_admin` with fixed `search_path = public`.
   - Revokes role mutation grants from `anon` and `authenticated`.
   - Enforces candidate folder confinement on `storage.objects`.
2. **Candidate Storage Upsert Policy:**
   Apply `supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql`.
   - Installs authenticated candidate `UPDATE` policy on `storage.objects` with dual `USING` and `WITH CHECK` clauses.

### STEP 3: Configure Production Vault Secrets
Ensure all required Edge Function environment secrets are populated in Supabase Vault:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GEMINI_API_KEY`

### STEP 4: Deploy Supabase Edge Functions
Deploy hardened Edge Functions to production project `dthlgsnakhoftinssokm`:
```bash
supabase functions deploy gemini-ai --project-ref dthlgsnakhoftinssokm
supabase functions deploy ai-resume-parser --project-ref dthlgsnakhoftinssokm
supabase functions deploy record-resume-download --project-ref dthlgsnakhoftinssokm
supabase functions deploy razorpay-create-order --project-ref dthlgsnakhoftinssokm
supabase functions deploy razorpay-verify-payment --project-ref dthlgsnakhoftinssokm
supabase functions deploy razorpay-create-oneoff --project-ref dthlgsnakhoftinssokm
supabase functions deploy razorpay-verify-oneoff --project-ref dthlgsnakhoftinssokm
```

### STEP 5: Deploy Frontend Bundle to Vercel Production
1. Push `main` to `origin/main` (`git push origin main`).
2. Trigger production Vercel deployment for `talentxcel.in`.

### STEP 6: Live Production Smoke Tests
1. Verify candidate registration and CV upload on `https://talentxcel.in`.
2. Verify candidate CV replacement (`upsert: true`) executes cleanly without RLS error 42501.
3. Verify candidate self-elevation to admin is rejected.
4. Verify edge rate limiting triggers HTTP 429 upon rapid burst calls.

---

## 4. IMMEDIATE ROLLBACK CONTINGENCY

If an unforeseen defect arises during production rollout:
1. **Database Rollback:**
   Execute `supabase/migrations/20261030150000_task_002_security_hardening_rollback.sql` or restore the pre-migration database snapshot.
2. **Git Rollback:**
   ```bash
   git checkout main
   git reset --hard backup/main-pre-task-002-819fc3b6
   git push origin main --force-with-lease
   ```
3. **Frontend Rollback:**
   Instant rollback in Vercel Dashboard to the previous production deployment ID.
