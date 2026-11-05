# TALENTXCEL GLOBAL GROWTH OS — PHASE 13: ATS PRIVACY, DATA INTEGRITY & SECURITY REPORT

**Document ID:** TXC-GROWTH-PHASE-13-SECURITY  
**Timestamp:** 2026-11-05T13:54:00Z  
**Security Lead:** Principal Security & Cloud Architecture Lead  
**Platform:** https://www.talentxcel.in  
**Audit Scope:** End-to-end data lifecycle of resumes, diagnostic scorecards, authentication tokens, cross-account boundaries, and Supabase Row Level Security (RLS).

---

## 1. Resume Processing & Data Minimization Lifecycle

```
[ User Selects File ] ──► [ Client File Validation (Max 5MB, PDF/DOCX/TXT) ]
                                   │
                                   ▼
                       [ In-Memory Parsing & Analysis ]
                                   │
                                   ▼
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
     [ Raw Binary / Content ]              [ Structured Diagnostic Report ]
     • Processed strictly in-memory        • overall score (0-100)
     • NEVER written to unauthenticated    • found keywords (technical tags)
       storage buckets                     • missing keyword gaps
     • Discarded immediately after         • formatting score (0-100)
       feature extraction                  • Cached in session: txc_saved_ats_report
```

---

## 2. Privacy & Security Safeguards Implemented

| Control Vector | Implementation Mechanism | Verification Evidence |
| :--- | :--- | :--- |
| **Explicit Consent Disclosure** | Injected diagnostic consent notice under file upload zone. | [`src/pages/resume/ATSOptimizer.tsx`](file:///c:/Users/Arshid.Wani/talentxcel-local/src/pages/resume/ATSOptimizer.tsx): *"Resumes are parsed locally in memory. Raw documents are never sold, advertised, or shared."* |
| **Strict File Size Limits** | `useDropzone` configured with `maxSize: 5 * 1024 * 1024` (5MB). | Rejected files trigger `toast.error('Resume exceeds maximum 5MB size limit')`. |
| **MIME Type Validation** | Strict accept mapping: `application/pdf`, `.docx`, `text/plain`. | Executable and binary types (`.exe`, `.sh`, `.bat`) rejected at drag-and-drop boundary. |
| **User Delete Controls** | Added "Delete Report" button in report header and share panel. | Calling `handleClearReport()` purges report state, `localStorage`, and `sessionStorage`. |
| **Logout Session Cleanup** | Injected cache clearing into `signOut()` in [`OptimizedAuthContext.tsx`](file:///c:/Users/Arshid.Wani/talentxcel-local/src/contexts/OptimizedAuthContext.tsx). | Purges `txc_saved_ats_report`, `tx_growth_sid`, and `txc_active_workspace` upon signout. |
| **Zero RLS Bypass** | All database calls execute via standard Supabase client with user JWT. | Anonymous callers cannot read `unified_candidates` or other users' `resumes`. |
| **NoIndex Is Not Auth** | Server-side RLS protects data; `noindex, follow` is used purely for search hygiene. | Authenticated workspaces are gated by `useOptimizedAuth()` route protection. |

---

## 3. Cross-Account Multi-Tenant Isolation Audit

| Persona / Actor | Access to Resume / Report | Access to Other Candidate Data | RLS Policy Enforced | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Anonymous Visitor** | Only temporary local in-memory scan | **BLOCKED (0 records returned)** | `unified_candidates` RLS selects 0 rows | **SECURE** |
| **Candidate A (User 1)** | Own uploaded resumes & saved reports | **BLOCKED** from User 2 records | `user_id = auth.uid()` | **SECURE** |
| **Candidate B (User 2)** | Own uploaded resumes & saved reports | **BLOCKED** from User 1 records | `user_id = auth.uid()` | **SECURE** |
| **Employer Account** | Can search anonymized candidate pool | Cannot access raw private PII without candidate inquiry | Profile privacy flag + RLS | **SECURE** |
| **Platform Administrator** | Audited administrative dashboard | Restricted to governance & invariant verification | Admin role verification | **SECURE** |

---

## 4. Telemetry PII Gating

Prior to dispatching events to Google Analytics 4 via `GrowthFunnelTracker.track()`, all payloads pass through `sanitizeForAnalytics()`:
- `email`, `phone`, `full_name`, `name`, `password`, and auth tokens are stripped.
- GA4 only receives coarse metadata: `tool_name: 'ats_optimizer'`, `score: 84`, `role: 'full-stack-engineer'`, `device: 'desktop'`.
