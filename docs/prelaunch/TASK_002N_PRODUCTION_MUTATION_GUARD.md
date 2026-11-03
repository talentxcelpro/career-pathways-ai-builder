# TASK 002N — PRODUCTION MUTATION GUARD & READ-ONLY SAFEGUARD PROTOCOL

**Platform:** [talentxcel.in](https://talentxcel.in)  
**Parent Task Sequence:** Task 002 (002D -> 002E -> 002F -> 002G -> 002H -> 002J -> 002K -> 002N)  
**Target Environment:** TalentXcel Production (`dthlgsnakhoftinssokm` / `talentxcel.in`)  
**Guard Status:** 🔒 **ACTIVE & ENFORCED — ZERO PRODUCTION MUTATION AUTHORIZED**  
**Execution Timestamp:** 2026-11-03T08:31:40+05:30  
**Effective Standard:** Read-Only Execution & Isolated Synthetic Verification  

---

## 1. PURPOSE & MANDATE

Under **TASK 002N**, an absolute production mutation guard is established across all operations, audits, telemetry collections, and verification scripts. 

Zero production state changes, database row inserts, user creations, file uploads, payment orders, or permission grants are permitted against production infrastructure (`dthlgsnakhoftinssokm` / `talentxcel.in`).

All verifications must be performed using **passive read-only inspections** against production metadata, or **active isolated synthetic testing** in mock/ephemeral environments where no production state can be impacted.

---

## 2. PRODUCTION OPERATIONS ENFORCEMENT MATRIX

### 2.1 Permitted Operations (Strict Read-Only)
The following operations are permitted against production:
- **Schema & Metadata Inspection:** Querying `information_schema`, PostgreSQL catalog views (`pg_tables`, `pg_views`, `pg_proc`, `pg_roles`), and migration history tables.
- **Migration History Verification:** Reading applied migration hashes and timestamps.
- **Function & Privilege Audits:** Inspecting function definitions, `search_path` configurations, and role permissions (`pg_proc.prosecdef`, `has_function_privilege`).
- **RLS Policy Verification:** Querying `pg_policies` and verifying `USING` / `WITH CHECK` expressions for all tables.
- **Storage Configuration Inspection:** Querying `storage.buckets` configuration (`public = false`, file size limits, allowed mime types).
- **Deployment Inventory Audits:** Verifying git commit SHAs, build outputs, and deployed bundle metadata.
- **Telemetry & Log Analysis:** Reading access logs, error telemetry, and Edge Function invocation logs without generating artificial error spikes.
- **Frontend Bundle Analysis:** Inspecting static client chunks, script tags, and CSP configurations without exposing environment secrets.
- **Non-Mutating Authorization Checks:** Performing read-only permission checks using pre-existing, static test identities without modifying user attributes or sessions.

### 2.2 Prohibited Operations (Strictly Blocked)
The following operations are strictly forbidden on production infrastructure:
- ❌ **Creating, modifying, or deleting test users** (no calls to `auth.admin.createUser`, `signUp`, or direct inserts into `auth.users`).
- ❌ **Uploading, replacing, or deleting documents** (no `storage.from('documents').upload`, `remove`, or file upserts).
- ❌ **Creating payment orders** (no calls to `razorpay-create-order`, `razorpay-create-oneoff`, or Razorpay API orders).
- ❌ **Invoking state-mutating database functions** (no execution of mutating RPCs or SQL statements containing `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`).
- ❌ **Modifying rate-limit counters** (no mutations to `public.edge_rate_limits` or artificial cache pollution).
- ❌ **Changing device or user permissions** (no inserts/updates to `public.user_roles`, `notification_devices`, or `notification_preferences`).
- ❌ **Triggering deployments or migrations** (no execution of `supabase db push`, `supabase migration up`, or deployment webhooks).
- ❌ **Modifying production secrets** (no changes to Supabase Vault, environment variables, or project settings).

---

## 3. ACTIVE TESTING & ISOLATION REQUIREMENTS

1. **Synthetic Data & Isolated Environments:**
   - Any test requiring database or external system writes must run inside an isolated test harness using synthetic mocks, memory stubs, or ephemeral test databases.
   - Any control requiring a production write that cannot be executed in an isolated environment must be classified as **`NOT RUNTIME VERIFIED`**.

2. **Classification Taxonomy:**
   - **`PASS (INDEPENDENTLY VERIFIED)`**: Validated through passive read-only runtime inspection on production or active verification in an isolated synthetic environment.
   - **`PASS (CODE INSPECTED)`**: Validated through static analysis, AST traversal, migration file review, or TypeScript compilation.
   - **`UNTESTED`**: Control has not been inspected or executed.
   - **`D — VERIFICATION BLOCKED`**: Production access is insufficient or the control cannot be certified without an unauthorized production mutation.
   - *Rule:* Never classify an untested or unverified control as `PASS`.

---

## 4. MANDATORY 8-FIELD VERIFICATION RECORD SCHEMA

Every verification record executed under TASK 002N must capture and record the following 8 fields:

```json
{
  "environment": "Production (dthlgsnakhoftinssokm - Read-Only) | Staging | Synthetic Mock",
  "timestamp": "2026-11-03T08:31:40+05:30",
  "exact_verification_method": "Detailed command, query, or programmatic inspection method",
  "expected_result": "Exact technical invariant or expected state",
  "actual_result": "Observed output, status code, or query response",
  "evidence_reference": "File path, line number, or command output hash",
  "passive_or_active": "Passive (Read-Only) | Active (Isolated Synthetic)",
  "state_mutation_occurred": false
}
```

> [!CAUTION]
> If `state_mutation_occurred` evaluates to `true` on production infrastructure, the test execution must immediately halt, trip the fail-safe breaker, and alert engineering leadership.

---

## 5. AUTOMATED RUNTIME GUARD INTEGRATION

The programmatic mutation guard is implemented in [`scripts/validation/production-mutation-guard.ts`](file:///c:/Users/Arshid.Wani/talentxcel-local/scripts/validation/production-mutation-guard.ts). 

It enforces:
1. Environment URL inspection (`dthlgsnakhoftinssokm.supabase.co` intercepts).
2. HTTP verb enforcement (restricts HTTP calls to `GET` and `HEAD` against production).
3. SQL command inspection (rejects DDL/DML mutation keywords).
4. Automated verification record generation with non-negotiable `state_mutation_occurred: false` validation.
