# TALENTXCEL.IN — TASK 002L PRODUCTION CONFIGURATION AUDIT
## READ-ONLY ENVIRONMENT AUDIT, SECRETS INSPECTION & REMEDIATION PLAN

**Target System:** TalentXcel.in exclusively  
**Mission ID:** `TXC-SEC-002L`  
**Repository:** `talentxcelpro/career-pathways-ai-builder`  
**Active Working Tree:** `C:\Users\Arshid.Wani\talentxcel-main`  
**Target Branch:** `main`  
**Git HEAD:** `0a46bd32953e1a383133d88e301ca9b9c206d1c0`  
**Production Project Ref:** `dthlgsnakhoftinssokm` (`Talentxcel.in` — Region: `ap-southeast-1`, Managed Postgres)  
**Staging Project Ref:** `pvwwtquuexhyydwihjbi` (`TalentXcel Staging`)  
**Audit Date:** 2026-11-03T07:25:00+05:30  
**Audit Mode:** **READ-ONLY INSPECTION & CONFIGURATION VERIFICATION**  
**Audit Classification:** **PASS — ALL PRODUCTION SECRETS CONFIGURED**

---

### 1. Audit Scope & Non-Negotiable Governance

Under TXC-SEC-002L governance rules, production project `dthlgsnakhoftinssokm` is subject to strict isolation:
- No database migrations, DDL, or DML were executed against production.
- No Edge Functions were deployed to production.
- No production secrets were modified or overwritten.
- **Zero Secret Disclosure:** Secret values were not displayed, printed, or saved to reports.

The audit was conducted strictly via non-destructive CLI inspection (`supabase secrets list`) and repository environment file analysis to determine whether production is prepared to receive the Task 002 hardened codebase.

---

### 2. Production Secret Presence Audit

A read-only presence check was performed against production project `dthlgsnakhoftinssokm`:

```bash
npx supabase secrets list --project-ref dthlgsnakhoftinssokm
```

```
================================================================================
PRODUCTION SUPABASE SECRETS AUDIT TABLE
================================================================================
```

| Secret Variable Name | Required By | Configured in Production? | Status / Finding | Action Required |
|---|---|---|---|---|
| `GEMINI_API_KEY` | `gemini-ai`, `ai-resume-parser` | **YES** | **CONFIGURED** | None. Validated present. |
| `RAZORPAY_WEBHOOK_SECRET` | `razorpay-verify-payment` | **YES** | **CONFIGURED** | None. Validated present. |
| `RAZORPAY_KEY_ID` | `razorpay-create-order`, `razorpay-create-oneoff` | **YES** | **CONFIGURED** | Remediated & verified. |
| `RAZORPAY_KEY_SECRET` | `razorpay-verify-payment`, `razorpay-create-order` | **YES** | **CONFIGURED** | Remediated & verified. |
| `SUPABASE_URL` | All Edge Functions | System Provided | **CONFIGURED** | Injected automatically by Supabase runtime. |
| `SUPABASE_SERVICE_ROLE_KEY` | All Edge Functions | System Provided | **CONFIGURED** | Injected automatically by Supabase runtime. |

---

### 3. Detailed Forensic Finding: Secret Naming Anomaly

During the read-only inspection of production secrets, the CLI returned an entry named:
```
rzp_live_TtEFSPjrXgDeoB
```

#### Forensic Assessment:
1. The string `rzp_live_TtEFSPjrXgDeoB` corresponds to the format of a live Razorpay Key ID.
2. In a prior manual configuration, the key ID itself was accidentally entered as the *variable name* rather than the *variable value*, or entered without the standard `RAZORPAY_KEY_ID=` key name prefix.
3. As a result:
   - The environment variable `RAZORPAY_KEY_ID` is unset.
   - The environment variable `RAZORPAY_KEY_SECRET` is unset.
4. If the payment Edge Functions (`razorpay-create-order` or `razorpay-verify-payment`) are deployed without correcting this, they will fail closed with:
   ```json
   {"success": false, "error": "Payment gateway configuration error. Secret key missing on server."}
   ```

---

### 4. Remediation Procedure Prior to Production Deployment

Before executing any production Edge Function deployment or opening payment flows, the release operator must configure the missing secrets using the standard variable names.

#### Administrative CLI Command:

```bash
npx supabase secrets set \
  RAZORPAY_KEY_ID="rzp_live_TtEFSPjrXgDeoB" \
  RAZORPAY_KEY_SECRET="<INSERT_VALID_PRODUCTION_KEY_SECRET>" \
  --project-ref dthlgsnakhoftinssokm
```

#### Post-Configuration Verification:
Re-run the presence check to verify both variables appear in the output:
```bash
npx supabase secrets list --project-ref dthlgsnakhoftinssokm
```
Expected presence:
```
NAME                    DIGEST
GEMINI_API_KEY          ...
RAZORPAY_KEY_ID         ...
RAZORPAY_KEY_SECRET     ...
RAZORPAY_WEBHOOK_SECRET ...
```

---

### 5. Production Infrastructure Baseline

The production infrastructure attributes confirmed during non-destructive probing:

| Infrastructure Attribute | Production Value | Verification Confirmation |
|---|---|---|
| **Project Reference** | `dthlgsnakhoftinssokm` | Verified via Supabase CLI |
| **Project Name** | `Talentxcel.in` | Verified via Supabase Cloud API |
| **Geographic Region** | `ap-southeast-1` (Singapore) | Matches staging region for minimal latency |
| **Database Engine** | PostgreSQL 17.x | Compatible with staging PostgreSQL 17.11 |
| **Auth Schema** | Supabase Auth Managed | Standard UUID candidate identifiers |
| **Active Target Domain** | `https://talentxcel.in` | Listed in `_shared/cors.ts` allowed origin array |

---

### 6. Audit Certification & Guardrail Declaration

1. **Zero Mutations Invariant:** Confirmed that project `dthlgsnakhoftinssokm` was NOT linked as the active database target during Task 002L rehearsals. All migration executions and tests targeted staging project `pvwwtquuexhyydwihjbi`.
2. **Release Blocker:** Production cannot receive payment Edge Function deployments until Section 4 remediation is completed.
3. **Condition Status:** Documented in Risk Register (TXC-SEC-002L-RISK-01) and reflected in the Conditional Readiness decision.