# TALENTXCEL PHASE 14D.2 — REAL POSTGRESQL 18 CONCURRENCY CERTIFICATION
## ISOLATED ENGINE EXECUTION, DUAL ADVISORY LOCKING & pg_locks AUDIT

**Document ID:** TXC-GROWTH-PHASE-14D2-POSTGRES-CERT  
**Database Engine Audited:** Real PostgreSQL 18.4 (x86_64-windows, MSVC 19.44.35227, 64-bit)  
**Execution Port:** Dedicated Isolated Staging Port `localhost:5433`  
**Migration Path:** [`supabase/migrations/20261105153000_hardened_referral_rewards.sql`](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20261105153000_hardened_referral_rewards.sql)  
**Test Suite Path:** [`scratch/test_real_postgres_concurrency.cjs`](file:///c:/Users/Arshid.Wani/talentxcel-local/scratch/test_real_postgres_concurrency.cjs)  
**Certification Status:** **PASSED ALL 14 TESTS ON REAL POSTGRESQL 18 (100%)**  
**Production Isolation:** Executed against a locally initialized, dedicated staging cluster (`scratch/staging_pg_data`). Zero production tables touched.

---

## 1. Engine Environment & Schema Bootstrap

An isolated PostgreSQL 18 cluster was initialized using `initdb.exe` with locale `C`, UTF-8 encoding, and page checksums. The real database was started on port `5433` and bootstrapped with mock `auth.uid()` and `auth.role()` context helpers before applying the production migration file.

```
PostgreSQL Version:       18.4 on x86_64-windows
Port:                     5433 (Isolated Staging Instance)
Data Checksums:           Enabled
Connection Pool:          pg (node-postgres) with 20 maximum concurrent connections
Isolation Guard:          Zero connections to Supabase production
```

---

## 2. Test Execution & Evidence Register (14 / 14 Passed)

Executed via automated test runner [`scratch/test_real_postgres_concurrency.cjs`](file:///c:/Users/Arshid.Wani/talentxcel-local/scratch/test_real_postgres_concurrency.cjs):

| Test # | Test Scenario | Verified Condition | Actual Engine Output / Evidence | Status |
|:---:|:---|:---|:---|:---:|
| **1** | **Anonymous Caller** | `role: 'anon'`, `uid: null` | `{"success": false, "error": "Unauthorized: Invalid execution context"}` | **PASSED** |
| **2** | **Spoofed Referee ID** | `auth.uid() <> p_referee_id` | `{"success": false, "error": "Forbidden: Authenticated user cannot attribute referrals for another account"}` | **PASSED** |
| **3** | **Self-Referral** | Referrer Alice claims own code | `{"success": false, "error": "Self-referral is strictly prohibited"}` | **PASSED** |
| **4** | **Unverified Email** | Referee with `email_confirmed_at IS NULL` | `{"success": false, "error": "Referee account must be email-verified before referral attribution"}` | **PASSED** |
| **5** | **Tier 1 Milestone** | Alice reaches 5 completed referrals | `{"success": true, "reward_tier": 1, "new_referral_count": 5}` | **PASSED** |
| **6** | **Idempotent Rewards** | Query `public.referral_rewards` for user | Exactly 1 reward row exists (`tier = 1`, `status = 'approved'`). No duplicate minting. | **PASSED** |
| **7** | **Advancing to 9** | Alice completes 4 on Code B (total 9) | `SELECT COUNT(*)` across `referral_events` equals exactly 9. | **PASSED** |
| **8** | **Real Overlapping Concurrency** | Simultaneous concurrent calls on Code A & Code B | **Exactly 1 Succeeded:** `{"success": true, "referee_id": "...-10...", "referrer_id": "11111111...", "reward_tier": 1, "new_referral_count": 6}` | **PASSED** |
| **9** | **Velocity Gate Enforcement** | Second concurrent call arriving at millisecond 0 | **Exactly 1 Rejected:** `{"success": false, "error": "Daily referral reward velocity limit reached (10/day per account). Excess referrals queued for audit."}` | **PASSED** |
| **10** | **pg_locks Observation** | Active transaction lock inspection | `SELECT locktype, mode, granted, pid FROM pg_locks`: `{"locktype": "advisory", "mode": "ExclusiveLock", "granted": true, "pid": 27480}` observed in real time. | **PASSED** |
| **11** | **Final Ledger Count** | Final count of events for Alice across all codes | `SELECT COUNT(*)` equals **exactly 10**. Absolute cap maintained. | **PASSED** |
| **12** | **Transaction Rollback** | Transaction aborted due to invalid code | Aborted transaction rolled back cleanly. `COUNT(referral_events)` for referee remains 0. | **PASSED** |
| **13** | **Independent Referrers** | Referrer Bob executes on `BOB_PRO` while Alice is capped | Bob succeeds independently (`new_referral_count = 1`). Zero lock interference. | **PASSED** |
| **14** | **Partial Unique Constraint** | Direct SQL duplicate insert on `referral_events` | Engine raised `error 23505: duplicate key value violates unique constraint "idx_referral_events_referee_registered_unique"`. | **PASSED** |

---

## 3. Real PostgreSQL Locking Architecture

1. **Dual-Order Advisory Locking:**
   - Lock #1: `pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('referral_referee_' || p_referee_id::pg_catalog.text))`
   - Lock #2: `pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('referral_referrer_' || v_referrer_uuid::pg_catalog.text))`
   - Consistent acquisition order (Referee $\rightarrow$ Referrer) eliminates deadlock cycles.
2. **Post-Lock Revalidation:**
   - After acquiring the referrer-level advisory lock, the row is revalidated via `SELECT is_active, referrer_id ... FOR UPDATE`.
3. **Empty `search_path` Security:**
   - `SET search_path = ''` strictly enforced.
   - All built-in functions fully qualified (`pg_catalog.btrim`, `pg_catalog.upper`, `pg_catalog.now`, `pg_catalog.count`, `pg_catalog.jsonb_build_object`).
   - Clean role provisioning script ensures compatibility across vanilla PostgreSQL and Supabase.
