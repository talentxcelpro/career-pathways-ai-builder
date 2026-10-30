# TASK 002E: SEC-009 STRICT VERCEL PREVIEW CORS VERIFICATION REPORT

**Target System:** TalentXcel.in  
**Repository:** `career-pathways-ai-builder`  
**Branch:** `security/task-002-hardening`  
**Target File:** `supabase/functions/_shared/cors.ts`  
**Verification Script:** `scripts/verify-task-002e-cors.ts`  
**Audit Timestamp:** 2026-10-30  
**Status:** **`FIXED AND VERIFIED`**  

---

## 1. OBJECTIVE & FORENSIC CONTEXT

In Task 002D, the independent audit identified an unanchored regular expression in `supabase/functions/_shared/cors.ts`:
```typescript
// VULNERABLE PATTERN IN TASK 002 (UNANCHORED):
const PREVIEW_ORIGIN_PATTERNS = [
  /^https:\/\/[a-zA-Z0-9_-]+\.talentxcel\.in$/,
  /^https:\/\/[a-zA-Z0-9_-]+-talentxcel.*\.vercel\.app$/,
  /^https:\/\/career-pathways-ai-builder.*\.vercel\.app$/,
];
```
### Vulnerability Analysis:
The wildcard suffix `.*\.vercel\.app$` allowed any external third party to register a project on Vercel named `career-pathways-ai-builder-evil.vercel.app` or `attacker-talentxcel-phish.vercel.app` and receive permissive `Access-Control-Allow-Origin` headers from TalentXcel Edge Functions.

---

## 2. REMEDIATION ARCHITECTURE

`supabase/functions/_shared/cors.ts` was refactored to implement strict, team-anchored origin verification:

```typescript
export const ALLOWED_ORIGINS = [
  'https://talentxcel.in',
  'https://www.talentxcel.in',
  'https://jobs.talentxcel.in',
  'https://employers.talentxcel.in',
  'https://employer.talentxcel.in',
  'https://recruiter.talentxcel.in',
  'https://admin.talentxcel.in',
  'https://resume.talentxcel.in',
  'https://learning.talentxcel.in',
  'https://colleges.talentxcel.in',
  'https://careers.talentxcel.in',
  'https://salary.talentxcel.in',
  'https://passport.talentxcel.in',
  'https://government.talentxcel.in',
  'https://preview.talentxcel.in',
  // Approved development origins
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  // Mobile App Capacitor origins
  'capacitor://localhost',
  'http://localhost',
];

// Strictly anchored preview origin patterns for TalentXcel.in and verified Vercel deployments
export const PREVIEW_ORIGIN_PATTERNS = [
  // Official TalentXcel.in subdomain preview / features
  /^https:\/\/[a-z0-9-]+\.preview\.talentxcel\.in$/,
  /^https:\/\/[a-z0-9-]+\.talentxcel\.in$/,
  // Exact Vercel deployment URLs strictly scoped to the career-pathways-ai-builder project and talentxcelpro team
  /^https:\/\/career-pathways-ai-builder(-[a-z0-9-]+)*-talentxcelpro\.vercel\.app$/,
  /^https:\/\/career-pathways-ai-builder\.vercel\.app$/,
];
```

### Key Security Properties:
1. **Team-Scoped Vercel Anchoring:** Vercel previews must match `-talentxcelpro.vercel.app$` or the exact production project canonical alias `https://career-pathways-ai-builder.vercel.app`.
2. **Rejection of Third-Party Vercel Projects:** Unrelated projects (e.g. `https://unrelated-project.vercel.app`) or spoofed prefixes (e.g. `https://career-pathways-ai-builder-attacker.vercel.app`) are strictly rejected.
3. **Fail-Closed Header Behavior:** When an unauthorized origin makes a cross-origin request from a browser, `getCorsHeaders()` returns `Access-Control-Allow-Origin: https://talentxcel.in`. Because the response header does not match the untrusted caller's origin, the browser's Same-Origin Policy (SOP) blocks access to the response.
4. **Capacitor Mobile Compatibility:** Required mobile application schemes (`capacitor://localhost`, `http://localhost`) are explicitly permitted.
5. **OPTIONS Preflight Handling:** Preflight requests are answered with complete CORS policy headers and standard HTTP 200 responses.

---

## 3. AUTOMATED TEST SUITE & VERIFICATION EVIDENCE

An automated regression suite was authored in `scripts/verify-task-002e-cors.ts` and executed against the implementation:

- **Command:** `npx tsx scripts/verify-task-002e-cors.ts`
- **Total Invariants Tested:** 21
- **Passed Invariants:** 21
- **Failed Invariants:** 0
- **Pass Rate:** **100.0%**

### Execution Log Evidence:
| Test Vector Category | Tested Origin | Expected Allowed | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Production Primary** | `https://www.talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Production Apex** | `https://talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Subdomain** | `https://jobs.talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Subdomain** | `https://employer.talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Subdomain** | `https://admin.talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Feature Preview** | `https://staging-preview.talentxcel.in` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Vercel Git Branch** | `https://career-pathways-ai-builder-git-main-talentxcelpro.vercel.app` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Vercel Hash Preview** | `https://career-pathways-ai-builder-a1b2c3d4-talentxcelpro.vercel.app` | `true` | Allowed: `true` | **`PASSED`** |
| **Approved Vercel Canonical** | `https://career-pathways-ai-builder.vercel.app` | `true` | Allowed: `true` | **`PASSED`** |
| **Unrelated Vercel Project** | `https://unrelated-project.vercel.app` | `false` | Allowed: `false` | **`PASSED`** |
| **Unrelated Similar Project** | `https://career-pathways-other.vercel.app` | `false` | Allowed: `false` | **`PASSED`** |
| **Malicious Suffix Spoof** | `https://career-pathways-ai-builder.vercel.app.attacker.com` | `false` | Allowed: `false` | **`PASSED`** |
| **Attacker-controlled Vercel App** | `https://career-pathways-ai-builder-evil.vercel.app` | `false` | Allowed: `false` | **`PASSED`** |
| **Spoofed Fake TLD** | `https://career-pathways-ai-builder-attacker-talentxcelpro.fake.app` | `false` | Allowed: `false` | **`PASSED`** |
| **Arbitrary Third-Party Origin** | `https://evil.com` | `false` | Allowed: `false` | **`PASSED`** |
| **Phishing Third-Party Origin** | `https://phishing-talentxcel.com` | `false` | Allowed: `false` | **`PASSED`** |
| **Missing Origin (Empty)** | `""` | `false` | Allowed: `false` | **`PASSED`** |
| **Missing Origin (Null)** | `null` | `false` | Allowed: `false` | **`PASSED`** |
| **Capacitor Mobile Scheme** | `capacitor://localhost` | `true` | Allowed: `true` | **`PASSED`** |
| **Capacitor Webview Scheme** | `http://localhost` | `true` | Allowed: `true` | **`PASSED`** |
| **Local Development Origin** | `http://localhost:5173` | `true` | Allowed: `true` | **`PASSED`** |

---

## 4. CONCLUSION

Condition 2 from Task 002D is fully resolved. SEC-009 is reclassified from `PARTIALLY FIXED` to **`FIXED AND VERIFIED`**.
