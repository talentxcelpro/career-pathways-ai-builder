# TALENTXCEL.IN — TASK 002G
# SCHEMA REPLICATION REPORT

**Project:** TalentXcel.in  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Feature Branch:** `security/task-002-hardening`  
**Target Environment:** Staging (`pvwwtquuexhyydwihjbi`)  
**Execution Timestamp:** 2026-11-02T13:00:00+05:30  
**Status:** COMPLETE — DDL-ONLY REPLICATION WITH ZERO DATA EXFILTRATION  

---

## 1. REPLICATION METHODOLOGY & DOCKER BYPASS

### 1.1 Technical Constraint Encountered
On the local Windows host, Docker Desktop is not installed. As a result, standard Supabase CLI `db dump` and container commands failed with `LegacyDockerRunError`.

### 1.2 Direct Management API Solution
Rather than requiring local virtualization, DDL schema playback was executed directly against the remote staging database via the Supabase Management API using:
```bash
npx supabase db query --linked -f <DDL_FILE>
```
This bypassed Docker entirely, executing raw SQL statements securely over TLS directly on `db.pvwwtquuexhyydwihjbi.supabase.co`.

---

## 2. PRIVACY & DATA ISOLATION VERIFICATION

In strict accordance with the Task 002G specification:
1. **Zero Customer Records:** 0 customer rows, user profiles, or CV files were copied from production.
2. **Zero Auth Users:** 0 authentication user accounts (`auth.users`) were replicated. All staging test identities were generated on-the-fly inside transaction blocks that rolled back after testing.
3. **Zero Secrets in DDL:** Migrations were audited for hardcoded API keys, webhook secrets, and private credentials. None were present.
4. **Storage Object Isolation:** Production storage buckets and binary objects remain untouched.

---

## 3. CORE APPLICATION SCHEMA REPLICATED

The foundational relational schema required to support job seeker, employer, and administrative journeys was successfully created on staging:

| Table Name | Purpose | Primary Key | Foreign Key / Dependencies |
| :--- | :--- | :--- | :--- |
| `public.profiles` | User profiles | `id (UUID)` | `auth.users(id)` |
| `public.companies` | Employer organizational entities | `id (UUID)` | None |
| `public.company_profiles` | Extended company profile metadata | `id (UUID)` | `company_id -> companies(id)` |
| `public.company_team_members` | Employer recruiter & admin staff | `id (UUID)` | `company_id, user_id` |
| `public.jobs` | Job postings catalog | `id (UUID)` | `company_id -> companies(id)` |
| `public.job_applications` | Candidate job applications | `id (UUID)` | `job_id, user_id` |
| `public.saved_jobs` | Candidate bookmarks | `id (UUID)` | `job_id, user_id` |
| `public.resumes` | Candidate resume metadata | `id (UUID)` | `user_id` |
| `public.cover_letters` | Generated cover letters | `id (UUID)` | `user_id` |
| `public.candidate_notes` | Recruiter candidate evaluation | `id (UUID)` | `company_id, candidate_id` |
| `public.candidate_communications` | Interview messaging logs | `id (UUID)` | `company_id, candidate_id` |
| `public.interviews` | Interview scheduling records | `id (UUID)` | `job_id, candidate_id` |
| `public.courses` | Upskilling course directory | `id (UUID)` | None |
| `public.user_courses` | Candidate course enrollments | `id (UUID)` | `course_id, user_id` |
| `public.learning_paths` | Recommended learning tracks | `id (UUID)` | `user_id` |
| `public.career_goals` | Career progression milestones | `id (UUID)` | `user_id` |
| `public.connections` | Professional peer network | `id (UUID)` | `user_id, friend_id` |
| `public.posts` | Feed posts & announcements | `id (UUID)` | `user_id` |
| `public.post_comments` | Discussion comments | `id (UUID)` | `post_id, user_id` |
| `public.post_reactions` | Post likes & endorsements | `id (UUID)` | `post_id, user_id` |
| `public.job_analytics` | Job view & engagement metrics | `id (UUID)` | `job_id` |

---

## 4. STAGING PREREQUISITES & SCHEMA RESOLUTIONS

During migration testing, two crucial database architecture dependencies were identified and cleanly resolved:

### 4.1 Resolution of RLS Recursion on `company_team_members`
- **Root Cause:** Migration `20250625175352` contained an RLS policy `"Company admins can manage team members"` that executed a subquery selecting from `company_team_members` directly within the policy `USING` clause. Under PostgreSQL RLS evaluation, this triggered `ERROR: 42P17: infinite recursion detected in policy for relation "company_team_members"`.
- **Resolution:** Applied `supabase/migrations/20250626094226-3aef21a0-3999-484f-9f9e-8fbedcbe1f2b.sql` which introduced the `SECURITY DEFINER` function `public.is_company_admin_or_owner(UUID)`. This function evaluates admin status bypassing table RLS recursion, cleanly resolving error 42P17.

### 4.2 Employer Job Application RLS Policy
- **Root Cause:** Foundational table `job_applications` only contained a candidate-facing policy `auth.uid() = user_id`. Recruiter queries and storage applicant validation queries returned 0 rows because employers could not see applications submitted to their jobs.
- **Resolution:** Added `"Employers can view applications for their jobs"` policy joining `jobs` and `company_team_members` on active membership, allowing recruiters to legitimately inspect applications and applicant documents.

### 4.3 Prerequisites Script
All prerequisites are codified in `scripts/staging/staging-prerequisites.sql` ensuring deterministic replication across any future environment.

---

## 5. PHASE 2 CONCLUSION

Schema replication is **100% COMPLETE**. The staging database contains identical foundational table structures, constraints, and relational schemas as production, with zero sensitive customer data or live credentials.
