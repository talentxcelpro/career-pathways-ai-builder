# TALENTXCEL.IN — TASK 002G
# STAGING ENVIRONMENT PROVISIONING REPORT

**Project:** TalentXcel.in  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Feature Branch:** `security/task-002-hardening`  
**Task:** 002G — Controlled Staging Provisioning & Runtime Security Validation  
**Execution Timestamp:** 2026-11-02T13:00:00+05:30  
**Status:** COMPLETE — STAGING INFRASTRUCTURE FULLY OPERATIONAL  

---

## 1. EXECUTIVE SUMMARY

Under Phase 1 of Task 002G, a dedicated, isolated cloud staging environment was provisioned for **TalentXcel.in** without incurring infrastructure cost or modifying the production environment. 

The staging project has been provisioned under the existing Supabase organization, isolated from all production customer records, credentials, and live payment gateways.

---

## 2. STAGING CLOUD INFRASTRUCTURE IDENTITY

| Attribute | Production | Staging (`pvwwtquuexhyydwihjbi`) | Verification Status |
| :--- | :--- | :--- | :--- |
| **Project Ref** | `dthlgsnakhoftinssokm` | `pvwwtquuexhyydwihjbi` | **CONFIRMED SEPARATE** |
| **Project Name** | Talentxcel.in | TalentXcel Staging | **VERIFIED** |
| **Organization ID**| `xaauthlhhymlvvxrkuzu` | `xaauthlhhymlvvxrkuzu` | Shared Org (Cost: $0.00) |
| **Region** | `ap-southeast-1` (Singapore) | `ap-southeast-1` (Singapore) | Regionally Aligned |
| **PostgreSQL Version** | PostgreSQL 17.4.1.45 | PostgreSQL 17.11.0.011 | Compatible Engine (v17) |
| **Database Host** | `db.dthlgsnakhoftinssokm.supabase.co` | `db.pvwwtquuexhyydwihjbi.supabase.co` | **DEDICATED HOST** |
| **Status** | `ACTIVE_HEALTHY` | `ACTIVE_HEALTHY` | Operational |
| **CLI Linked State**| `linked: false` (Safely Unlinked) | `linked: true` (Active CLI target) | **PROTECTED** |
| **Dashboard URL** | `https://supabase.com/dashboard/project/dthlgsnakhoftinssokm` | `https://supabase.com/dashboard/project/pvwwtquuexhyydwihjbi` | Isolated Dashboard |

---

## 3. PROVISIONING METHODOLOGY & CLI LINKAGE

### 3.1 Project Creation
The staging project was provisioned using the official Supabase CLI:
```bash
npx supabase projects create "TalentXcel Staging" \
  --org-id "xaauthlhhymlvvxrkuzu" \
  --region "ap-southeast-1" \
  --db-password "<REDACTED_SECURE_STAGING_PASSWORD>"
```
- **CLI Output:** Project reference `pvwwtquuexhyydwihjbi` returned with status `ACTIVE_HEALTHY`.
- **Financial Assessment:** Provisioned within the organization's existing free tier allowance. Incremental billing impact: **$0.00**.

### 3.2 CLI Session Binding
The local development environment was linked directly to the new staging project:
```bash
npx supabase link --project-ref pvwwtquuexhyydwihjbi -p "<REDACTED_PASSWORD>"
```
- **Verification:** `npx supabase projects list` confirmed that `pvwwtquuexhyydwihjbi` has `linked: true`, while production `dthlgsnakhoftinssokm` has `linked: false`.
- **Safety Boundary:** All subsequent CLI queries (`--linked`) target the staging project exclusively.

---

## 4. API KEYS & CREDENTIAL ISOLATION

Staging API credentials were generated independently by Supabase:
- **Anon Public Key:** Independent 208-character JWT token scoped strictly to `pvwwtquuexhyydwihjbi`.
- **Service Role Secret:** Independent 219-character JWT token scoped strictly to `pvwwtquuexhyydwihjbi`.
- **Publishable API Key:** Independent `pk_...` key.
- **Secret API Key:** Independent `sk_...` key.

**Credential Security Gate:**
- Production keys (`dthlgsnakhoftinssokm`) were never loaded into staging environment files or scripts.
- No live Razorpay keys are configured in staging; only test sandbox keys (`rzp_test_...`) are authorized.

---

## 5. REPRODUCIBILITY & AUTOMATION HARNESS

To ensure automated teardown and recreation, the staging harness files have been cataloged in:
- `scripts/staging/staging-prerequisites.sql`
- `scripts/staging/verify-staging-runtime-security.sql`

---

## 6. PHASE 1 CONCLUSION

Phase 1 (Staging Project Provisioning) is **100% COMPLETE**. The environment is fully isolated, linked to the local CLI, and ready for schema replication and Task 002 security hardening execution.
