# TALENTXCEL GLOBAL GROWTH OS — PHASE 13: END-TO-END ANALYTICS RECONCILIATION

**Document ID:** TXC-GROWTH-PHASE-13-ANALYTICS  
**Timestamp:** 2026-11-05T13:54:30Z  
**Analytics Lead:** Senior Growth & Analytics Engineer  
**Platform:** https://www.talentxcel.in  
**Audit Scope:** Event nomenclature reconciliation, cross-subdomain attribution bridging, duplicate dispatch suppression, and strict conversion boundary enforcement.

---

## 1. Funnel Event Reconciliation & Canonical Mapping

During earlier growth phases, several tactical event strings were introduced across components (`ats_started`, `ats_completed`, `signup_completed`). Below is the definitive reconciliation mapping connecting all legacy events into the unified 15-event taxonomy:

| Legacy / Tactical Event | Canonical Taxonomy Event | Trigger Mechanism | Distinction / Guardrail |
| :--- | :--- | :--- | :--- |
| `ats_started` | `tool_started` | User drops resume or clicks demo | Indicates tool initiation; NOT a signup. |
| `ats_completed` | `tool_completed` | Diagnostic score generated | Indicates diagnostic value delivered; NOT an account creation. |
| `signup_cta_view` | `signup_modal_triggered` | Conversion bridge rendered into viewport | Impression of registration incentive; NOT a click or signup. |
| `signup_cta_click` | `apply_cta_clicked` / Intent CTA | User clicks "Save Score & Unlock Jobs" | Seeker intention to register; NOT a confirmed account creation. |
| `signup_completed` | `sign_up` | Supabase `signUp()` succeeds without error | **CONFIRMED NEW ACCOUNT**: Only fires when backend creates user. |
| `signin_completed` | `login` | Supabase `signInWithPassword()` succeeds | Existing user returning; strictly segregated from `sign_up`. |
| `email_confirmed` | `email_verified` | Confirmation link clicked | Auth token verified; distinct from initial registration. |
| `passport_created` | `passport_activated` | Career Passport row written | Platform activation milestone. |
| `social_share_initiated` | `passport_shared` | QR, vCard, or Social share clicked | Viral distribution action. |

---

## 2. Critical Conversion Boundaries Enforced

To guarantee honest metrics and prevent artificial inflation of registration numbers:

1. **CTA Click $\neq$ Registration**:
   - Clicking "Save Score & Unlock Matching Jobs" on `/resume/ats-check` triggers `conversionTelemetry.track('signup_cta_click')`. It **NEVER** increments the registration counter.
2. **Form Submission $\neq$ Account Creation**:
   - Submitting the signup form sets loading state. If Supabase returns an error (e.g. `User already registered`, `Password too short`), no `sign_up` event is fired.
3. **Login $\neq$ Registration**:
   - Existing users logging in fire `GrowthFunnelTracker.track('login')`. Logins are tracked in a separate metric column and are never mixed with new user acquisition.
4. **Email Verification $\neq$ New Registration**:
   - Verifying an email marks account activation; it does not increment newly acquired user volume.

---

## 3. Cross-Subdomain Attribution Architecture

Because standard browser security prevents `sessionStorage` or `localStorage` from being read across distinct subdomains (e.g., `resume.talentxcel.in` cannot read storage from `talentxcel.in`), TalentXcel implements a tri-tier attribution bridge:

```
[ Visitor Lands on Primary Domain ] (e.g., talentxcel.in via Google)
                   │
                   ▼
       Generates sid_8f9a2b_173000000
                   │
                   ├─────────────────────────────────────────┐
                   ▼                                         ▼
   1. Writes First-Party Cookie            2. URL Query Param Forwarding
   Domain: .talentxcel.in                  Appends ?_tx_sid=sid_8f9a2b_...
   Path: /                                 to cross-subdomain links
   SameSite: Lax; Secure                   (e.g., to resume.talentxcel.in)
                   │                                         │
                   └────────────────────┬────────────────────┘
                                        ▼
                   [ Visitor Arrives on Subdomain ]
                   (e.g., resume.talentxcel.in or jobs.talentxcel.in)
                                        │
                                        ▼
                   getStoredSessionId() reads cookie or _tx_sid,
                   re-attaching identical session to GA4 & CustomEvents
```

---

## 4. Deduplication & OAuth Resumption Guardrails

To prevent duplicate event firing during browser page reloads or OAuth redirects:
- `GrowthFunnelTracker.trackOnce(eventName, uniqueKey, payload)` checks `sessionStorage.getItem('tx_fired_' + eventName + '_' + uniqueKey)`.
- If already fired in the current session, subsequent calls are safely suppressed.
- Guarantees exactly one `sign_up` event per registered user session.
