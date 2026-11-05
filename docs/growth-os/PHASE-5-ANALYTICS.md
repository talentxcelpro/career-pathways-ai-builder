# TALENTXCEL GLOBAL GROWTH OS — PHASE 5: UNIFIED ANALYTICS & 15-EVENT TAXONOMY

**Document ID:** TXC-GROWTH-PHASE-5  
**Timestamp:** 2026-11-05T13:28:00Z  
**Status:** IMPLEMENTED & INSTRUMENTED  
**Objective:** Establish a standardized, privacy-preserving event taxonomy across all 10 subdomains to track attribution, activation, engagement, and viral referral loops without vendor lock-in.

---

## 1. The Canonical 15-Event Acquisition & Growth Taxonomy

To measure organic acquisition and user progression toward 100K daily registrations, the following 15 events have been formalized in `src/lib/analytics/growthFunnelTracker.ts`:

| # | Event Name | Trigger Point | Key Payload Attributes |
| :--- | :--- | :--- | :--- |
| **1** | `landing_view` | Initial page load on any domain/subdomain | `source`, `medium`, `campaign`, `landing_page`, `device` |
| **2** | `tool_started` | User initiates free ATS scan or salary calculator | `tool_name`, `landing_page` |
| **3** | `tool_completed` | Diagnostic score or salary benchmark generated | `tool_name`, `ats_score`, `metrics` |
| **4** | `signup_modal_triggered` | Unauthenticated visitor clicks gated action | `source`, `intent`, `tool_name` |
| **5** | `sign_up` | Candidate or employer submits registration | `role`, `source`, `campaign`, `hiring_domain` |
| **6** | `login` | Existing user establishes active session | `user_id`, `role`, `device` |
| **7** | `email_verified` | User clicks email confirmation link | `user_id`, `verification_time_seconds` |
| **8** | `passport_activated` | User generates/initializes Career Passport | `user_id`, `passport_id`, `tier` |
| **9** | `passport_shared` | User clicks QR share, link copy, or vCard | `passport_id`, `share_channel` |
| **10** | `job_apply_clicked` | Candidate clicks "Apply Now" or "Quick Apply" | `job_id`, `job_title`, `company` |
| **11** | `recruiter_inquiry` | Employer initiates contact with candidate | `candidate_id`, `employer_id`, `role` |
| **12** | `invite_accepted` | New user registers via referral code or link | `inviter_id`, `invitee_id`, `campaign` |
| **13** | `profile_completed` | User reaches 80%+ profile completeness | `user_id`, `skills_count`, `experience_years` |
| **14** | `resume_uploaded` | Resume uploaded and parsed into profile | `user_id`, `file_format`, `skills_detected` |
| **15** | `job_match_viewed` | AI-matched jobs rendered to seeker | `match_count`, `top_score` |

---

## 2. Multi-Channel Attribution Engine

The `getAcquisitionContext()` utility automatically decodes attribution parameters without external cookies:
- **UTM Parameters**: Captures `utm_source`, `utm_medium`, and `utm_campaign`.
- **Organic Referrer Analysis**: Automatically classifies referring hosts into `google` (organic), `search` (bing, duckduckgo, yahoo), `social` (linkedin, twitter, facebook), or `referral`.
- **Device Classification**: Resolves user agent into `mobile`, `tablet`, or `desktop`.
- **Session Continuity**: Creates a transient session token `tx_growth_sid` in `sessionStorage` ensuring event stitching throughout the user journey.

---

## 3. Triple-Dispatch Pipeline

Every tracked event is processed across three simultaneous channels:
1. **Google Analytics 4**: Dispatched via `window.gtag('event', ...)` when GA4 is loaded.
2. **Local Custom DOM Events**: Dispatched via `window.dispatchEvent(new CustomEvent('tx:growth_funnel_event', ...))` enabling decoupled UI components (modals, toasts, gamification) to react instantly.
3. **Internal Telemetry**: Logged during development for debugging without console flooding in production.
