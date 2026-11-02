# TALENTXCEL.IN — TASK 002H
## DATABASE OBJECTS, RLS POLICIES & RPC SECURITY AUDIT

**Target Application:** TalentXcel.in  
**Staging Supabase Reference:** `pvwwtquuexhyydwihjbi`  
**Database Host:** `db.pvwwtquuexhyydwihjbi.supabase.co`  
**PostgreSQL Version:** `PostgreSQL 17.11 on x86_64-pc-linux-gnu`  
**Audit Date:** 2026-11-02  

---

### 1. Row-Level Security (RLS) Status

An inspection of `pg_tables` in the `public` schema confirmed RLS enforcement on security-critical tables:

| Table Name | Schema | RLS Enabled | Enforcement Assessment |
| :--- | :---: | :---: | :--- |
| `edge_rate_limits` | `public` | **TRUE** | RLS active; unprivileged roles revoked |
| `job_applications` | `public` | **TRUE** | Candidates view own; employers view job applicants |
| `profiles` | `public` | **TRUE** | Users manage own profile; public profiles viewable |
| `resumes` | `public` | **TRUE** | Candidates manage own resumes |
| `user_roles` | `public` | **TRUE** | Mutations revoked from `anon` & `authenticated` |
| `companies` | `public` | **FALSE** | Public directory metadata (by design) |
| `resume_downloads` | `public` | **FALSE** | Controlled strictly via atomic RPC procedure |

---

### 2. Detailed RLS Policy Audit

#### 2.1 Table: `job_applications`
1. `"Users can view own applications"` (SELECT): `auth.uid() = user_id`
2. `"Users can create own applications"` (INSERT): WITH CHECK `auth.uid() = user_id`
3. `"Users can update own applications"` (UPDATE): `auth.uid() = user_id`
4. `"Employers can view applications for their jobs"` (SELECT):  
   `EXISTS (SELECT 1 FROM jobs j JOIN company_team_members ctm ON j.company_id = ctm.company_id WHERE j.id = job_applications.job_id AND ctm.user_id = auth.uid() AND ctm.is_active = true)`  
   *Assessment:* Validated in runtime. Recruiter 1 successfully viewed Candidate 1's application. Recruiter 2 was denied.

#### 2.2 Table: `user_roles`
- Table Privileges:
  - `anon`: **0 privileges** (all revoked).
  - `authenticated`: **SELECT only** (`INSERT, UPDATE, DELETE` revoked).
  - `postgres` & `service_role`: Full admin access.
  *Assessment:* Completely prevents role hijacking or privilege escalation by non-admin users.

#### 2.3 Table: `storage.objects` (Storage Policies)
1. `"Candidates can read own documents"` (SELECT): `bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1])`
2. `"Candidates can insert own documents"` (INSERT): WITH CHECK `bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1])`
3. `"Candidates can delete own documents"` (DELETE): `bucket_id = 'documents' AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1] OR is_app_admin(auth.uid()))`
4. `"Employers can view applicant documents"` (SELECT):  
   `bucket_id = 'documents' AND EXISTS (SELECT 1 FROM job_applications ja JOIN jobs j ON ja.job_id = j.id JOIN company_team_members ctm ON j.company_id = ctm.company_id WHERE ctm.user_id = auth.uid() AND ctm.is_active = true AND (ja.user_id = objects.owner OR ja.user_id::text = (storage.foldername(objects.name))[1]))`
5. `"Admins can manage documents"` (ALL): `bucket_id = 'documents' AND is_app_admin(auth.uid())`

> [!WARNING]
> **CRITICAL RLS FINDING: Missing UPDATE Policy on Storage**  
> `storage.objects` lacks an `UPDATE` policy for candidates. Calling `upload(..., { upsert: true })` on an existing document triggers `new row violates row-level security policy for table "objects"`. An `UPDATE` policy must be added before production deployment.

---

### 3. Function & RPC Security Audit

| Function Name | Owner | Security Definer | Volatility | Explicit search_path | Execution Grants |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `check_rate_limit` | `postgres` | **YES** | `VOLATILE` | `public, pg_temp` | `service_role`, `postgres` strictly (**PUBLIC/anon revoked**) |
| `is_app_admin` | `postgres` | **YES** | `STABLE` | `public` | `authenticated`, `service_role`, `postgres` |
| `record_resume_download_atomic` | `postgres` | **YES** | `VOLATILE` | `public` | `authenticated`, `service_role`, `postgres` |
| `is_company_admin_or_owner` | `postgres` | **YES** | `STABLE` | None (safe caller) | `authenticated`, `service_role`, `postgres` |

#### Safe `search_path` Enforcement
All newly authored functions enforce an explicit `SET search_path = public` (or `public, pg_temp`), preventing privilege escalation attacks via malicious `search_path` injection.

---

### 4. Storage Bucket Public Flag Audit

Queried from `storage.buckets`:

| Bucket ID | Bucket Name | Public Flag | Assessment |
| :--- | :--- | :---: | :--- |
| `documents` | `documents` | **false** | Fully private; protected by 5 RLS policies |
| `resumes` | `resumes` | **false** | Private; default-denied under RLS |
| `cv-files` | `cv-files` | **false** | Private; default-denied under RLS |
| `cover-letters` | `cover-letters` | **false** | Private; default-denied under RLS |
| `user-uploads` | `user-uploads` | **false** | Private; default-denied under RLS |

---

### 5. Migration Rollback Readiness

Migration `20261030150000_task_002_security_hardening.sql` is structured with clean idempotency (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`). A reverse rollback script can restore previous policies if emergency regression rollback is required.
