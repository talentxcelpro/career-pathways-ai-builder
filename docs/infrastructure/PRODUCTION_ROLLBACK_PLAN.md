# TALENTXCEL PRODUCTION ROLLBACK PLAN
**Mission ID:** TXC-SI-INFRA-002 (Production Safety & SRE Disaster Recovery)  
**Target Platform:** https://talentxcel.in  
**Recovery Time Objective (RTO):** < 30 Seconds  
**Recovery Point Objective (RPO):** Zero Data Loss  
**Date:** 2 November 2026, 23:45 IST  

---

## 1. ROLLBACK GOVERNANCE & GATING PRINCIPLES

Under SRE governance, every production infrastructure modification must have an immediate, non-destructive, zero-downtime rollback path.
- **Vercel Pro Rollback Target:** Instant activation of pre-remediation deployment via Vercel dashboard.
- **Cloudflare Edge Target:** Instant toggle-off of Cache Rules 1–7.
- **Supabase Target:** Reverse migrations committed with idempotent down-scripts.
- **Zero Data Deletion:** No rollback operation may drop user tables, purge user media, or modify production auth credentials.

---

## 2. LAYERED ROLLBACK PROCEDURES

```mermaid
flowchart TD
    Incident["Detected Production Anomaly / Alert"]
    
    CheckType{"Anomaly Classification"}
    CheckType -->|Edge Cache or Header Clobber| CF_Rollback["Layer 1: Cloudflare Edge Rollback<br/>Action: Toggle OFF Rules 1-7 in Cloudflare Dashboard<br/>Duration: Instant (5s)"]
    CheckType -->|Routing, HTML or Middleware Defect| V_Rollback["Layer 2: Vercel Instant Rollback<br/>Action: Instant Rollback to Pre-Remediation Deploy<br/>Duration: < 15s"]
    CheckType -->|PostgreSQL Policy / Storage Error| DB_Rollback["Layer 3: Supabase RLS Rollback<br/>Action: Execute Down Migration in SQL Editor<br/>Duration: < 30s"]

    CF_Rollback --> Verify["Execute Health Check Suite<br/>Verify 12 Subdomains + Auth + APIs"]
    V_Rollback --> Verify
    DB_Rollback --> Verify
```

### Layer 1: Cloudflare Edge Cache Rollback (< 5 Seconds)
- **Trigger:** Cloudflare edge caches private user data, or returns stale responses after a release.
- **Execution:**
  1. Open Cloudflare Dashboard → `talentxcel.in` → `Caching` → `Cache Rules`.
  2. Toggle the active switch to **OFF** for Rules 1 through 7.
  3. Click **Purge Everything** under `Configuration` → `Purge Cache`.
- **RTO:** Instant (Cloudflare Anycast edge invalidates globally in < 5 seconds).
- **Impact:** Origin resumes direct delivery. Zero user downtime.

### Layer 2: Vercel Deployment Rollback (< 15 Seconds)
- **Trigger:** Client runtime error, broken rewrite, or middleware routing failure.
- **Execution:**
  1. Open Vercel Dashboard → Project `career-pathways-ai-builder` → `Deployments`.
  2. Locate the deployment prior to commit `fa88c79b`.
  3. Click `...` (Menu) → **Instant Rollback**.
- **RTO:** < 15 seconds.
- **Impact:** Vercel edge instantly points all traffic back to the proven deployment.

### Layer 3: Database Policy Rollback (< 30 Seconds)
- **Trigger:** Storage upload failure on candidate documents bucket.
- **Execution:**
  Run the idempotent rollback block documented in `20261102160000_fix_candidate_storage_update_policy.sql` via Supabase SQL Editor:
  ```sql
  DROP POLICY IF EXISTS "Candidates can update own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Candidates can insert own documents" ON storage.objects;
  CREATE POLICY "Candidates can insert own documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'documents' 
      AND (auth.uid() = owner OR auth.uid()::text = (storage.foldername(name))[1])
    );
  ```
- **RTO:** < 30 seconds.

---

## 3. POST-ROLLBACK HEALTH VERIFICATION SUITE

Following any rollback or deployment, run the automated verification script:
```bash
node scripts/validate-production-cdn-cache.cjs
```

Manual curl checks:
```bash
# 1. Apex Domain App Shell
curl.exe -sI https://talentxcel.in/ | grep -E "HTTP/|cache-control|x-vercel-cache"

# 2. Subdomain Static Home
curl.exe -sI https://jobs.talentxcel.in/ | grep -E "HTTP/|cache-control|x-vercel-cache"

# 3. Master Sitemap Index
curl.exe -sI https://talentxcel.in/sitemap.xml | grep -E "HTTP/|content-type|x-vercel-cache"

# 4. Anonymous Security Check (Must return HTTP 200 with [])
curl.exe -s "https://dthlgsnakhoftinssokm.supabase.co/rest/v1/resumes" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc"
```

---

## 4. INCIDENT ESCALATION & CONTACTS

- **Incident Lead:** Principal Cloud Architect / SRE
- **Escalation Path:** Sanobar Jahan (Founder / CEO)
- **Vercel Pro Support:** Standard 1-Hour SLA via Vercel Pro Dashboard.
- **Supabase Cloud Support:** Pro Support via Supabase Help Center.
