# TalentXcel.in — Email Implementation & SES Migration Roadmap
**Mission ID:** TXC-MAIL-AUDIT-001  
**Audit Date:** November 3, 2026  
**Auditor:** Senior Solutions Architect, DevOps Engineer & Email Deliverability Specialist  
**Platform:** [https://talentxcel.in](https://talentxcel.in)  
**Execution Rule:** DISCOVERY & AUDIT ONLY — No production modifications until approved.  

---

## 1. Guiding Principles & Smallest Safe Change Set

The goal of this roadmap is to achieve production-grade mailing through Amazon SES with the **smallest possible change set**, reusing 90%+ of the existing architecture and avoiding any recurrence of the September 2026 quota incident.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             IMPLEMENTATION ARCHITECTURE                          │
│                                                                                  │
│   Incoming Triggers ──► Enqueue RPC ──► email_automation_queue                   │
│                                               │                                  │
│                                        [Vercel Cron: 5m]                         │
│                                               │                                  │
│                                               ▼                                  │
│                                     POST /api/email/process-queue                │
│                                               │                                  │
│                                      [Rate Limiter: 10/s]                        │
│                                               │                                  │
│                                               ▼                                  │
│                                      Amazon SES (us-east-1)                      │
│                                      MAIL FROM: mail.talentxcel.in               │
│                                               │                                  │
│                                               ▼                                  │
│                                       Delivery / Bounce                          │
│                                               │                                  │
│                                               ▼                                  │
│                                      AWS SNS Webhook                             │
│                                               │                                  │
│                                               ▼                                  │
│                                     /api/email/ses-webhook                       │
│                                               │                                  │
│                                      email_suppression_list                      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prioritized Implementation Phases

### Phase P0: Critical Transactional Email Delivery (Immediate Priority)
*Objective: Unblock registration welcome emails, application confirmations, password resets, and repair DNS deliverability.*

| Component | What Can Be Reused | What Needs Fixing | What Genuinely Needs Building |
| :--- | :--- | :--- | :--- |
| **DNS Deliverability (DMARC)** | None | **Delete conflicting duplicate DMARC record** `v=DMARC1; p=none` from Cloudflare DNS. Retain single authoritative record. | Nothing to build; DNS configuration only. |
| **DNS Deliverability (DKIM & SPF)** | Subdomain `mail.talentxcel.in` (already has SES MX and SPF). | Generate 3 Easy DKIM CNAME records in Amazon SES `us-east-1` and publish them in Cloudflare DNS. | Nothing to build; DNS records only. |
| **Automated Queue Worker** | `api/email/_process-queue.ts` (100% written and self-contained). | Do **NOT** use `pg_cron` or `net.http_post` inside Postgres (prevents quota recurrences). | Add Vercel Cron in [vercel.json](file:///c:/Users/Arshid.Wani/talentxcel-local/vercel.json) to trigger `POST /api/email/process-queue` every 5 minutes with `CRON_SECRET`. |
| **SES Credentials & Live Dispatch** | `api/email/_send.ts` and `api/email/_process-queue.ts`. | Set `EMAIL_MODE=ses` in Vercel Environment Variables. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for `us-east-1`. | Nothing to build; environment variables only. |
| **Supabase Auth SMTP** | Supabase Auth login/signup workflows. | Configure Custom SMTP in Supabase Project Settings using Amazon SES SMTP credentials to unify deliverability under `noreply@talentxcel.in`. | Nothing to build; dashboard configuration only. |
| **Contact Form Delivery** | [src/pages/Contact.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/pages/Contact.tsx) UI layout. | Replace mock `handleSubmit` with a real call to `/api/email/send`. | Simple fetch handler transmitting message to `support@talentxcel.in`. |

---

### Phase P2: Recruitment, Employer & Application Notifications
*Objective: Restore broken recruiter tools and deliver candidate pipeline updates.*

| Component | What Can Be Reused | What Needs Fixing | What Genuinely Needs Building |
| :--- | :--- | :--- | :--- |
| **Recruiter Candidate Outreach** | [src/components/employer/cv-database/OutreachModal.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/employer/cv-database/OutreachModal.tsx) UI & personalization. | Fix broken call: redirect from non-existent `send-bulk-outreach` to `POST /api/email/send` or `public.enqueue_idempotent_email`. | Lightweight route adapter or direct RPC enqueue. |
| **Application Status Notifications** | Template `application_status` in `src/services/email/emailTemplates.ts`. | Wire employer status change events (Shortlisted, Rejected, Interview) to call `emailService.sendApplicationStatusUpdate()`. | Event listener on `job_applications` status update in employer portal. |
| **Interview Scheduling Reminders** | Trigger `trg_fn_interview_schedule_notification` in `20261103100000_unified_notification_engine.sql`. | Enable email dispatch branch in `supabase/functions/process-notification-outbox` or directly call `enqueue_idempotent_email()`. | Small trigger update to insert email queue record when interview is scheduled. |

---

### Phase P3: Email Analytics, Bounce Management & Deliverability Safeguards
*Objective: Safeguard sending domain reputation and automate suppression handling.*

| Component | What Can Be Reused | What Needs Fixing | What Genuinely Needs Building |
| :--- | :--- | :--- | :--- |
| **SES Feedback Loop (Bounces & Complaints)** | [api/email/_ses-webhook.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_ses-webhook.ts) (fully built with X.509 signature verification). | Connect AWS SES Configuration Set to an Amazon SNS topic and subscribe `https://talentxcel.in/api/email/ses-webhook`. | Nothing to build; AWS SNS subscription configuration. |
| **Suppression List Enforcement** | `public.email_suppression_list` table and pre-send suppression checks. | Ensure all entry points (`_send.ts`, `_process-queue.ts`, `enqueue_idempotent_email`) strictly check this table. | Reused 100% as-is. |
| **One-Click Unsubscribe (RFC 8058)** | [api/email/_unsubscribe.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_unsubscribe.ts) and List-Unsubscribe header builders. | Ensure `EMAIL_UNSUBSCRIBE_SECRET` is set in Vercel environment variables. | Reused 100% as-is. |
| **Delivery Monitoring Dashboard** | [src/components/admin/EmailMonitoringDashboard.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/admin/EmailMonitoringDashboard.tsx) UI. | Reconnect dashboard queries to read from `public.email_audit_ledger` instead of broken test functions. | Direct Supabase query to `email_audit_ledger`. |

---

### Phase P4: Marketing Campaigns, Segmentation & Automation
*Objective: Safely re-enable campaign sending without spam penalties.*

| Component | What Can Be Reused | What Needs Fixing | What Genuinely Needs Building |
| :--- | :--- | :--- | :--- |
| **Campaign Dispatch Engine** | `supabase/functions/send-campaign` and [src/components/admin/BulkEmailCampaign.tsx](file:///c:/Users/Arshid.Wani/talentxcel-local/src/components/admin/BulkEmailCampaign.tsx). | Ensure marketing emails strictly enforce `email_user_preferences.email_marketing = true`. | Opt-in verification step in campaign audience query. |
| **Curated Job Match Digests** | Template `job_match_digest` and `emailGovernor.ts` aggregation logic. | Schedule daily or weekly digest generation via an external cron rather than internal pg_net loops. | Scheduled worker script triggering digest batch. |
| **User Preference Center** | `public.email_user_preferences` table schema. | Wire user settings page to allow candidates and employers to toggle category notification preferences. | User settings frontend UI component. |

---

### Phase P5: Multi-Region Resilience & Disaster Recovery
*Objective: Establish warm failover across AWS regions.*

| Component | What Can Be Reused | What Needs Fixing | What Genuinely Needs Building |
| :--- | :--- | :--- | :--- |
| **Secondary Region (`eu-north-1`)** | Multi-region fallback algorithm in `supabase/functions/send-email-notification/index.ts`. | Verify domain identity and Easy DKIM in `eu-north-1` as standby backup. | Nothing to build; AWS SES Console verification only. |
| **Automated Failover Trigger** | Fallback logic in `send-email-notification`. | Add region parameter fallback to Vercel Serverless gateway `api/email/_send.ts`. | 10 lines of code adding try/catch regional fallback from `us-east-1` to `eu-north-1`. |

---

## 3. Risk Mitigation Summary: Preventing Quota Recurrences

To permanently ensure the platform never suffers another runaway background loop:
1. **Never use `net.http_post` or `pg_cron` to call Edge Functions on continuous 1-minute intervals.**
2. **All queue polling must originate from Vercel Crons or GitHub Actions**, where execution logs, concurrency limits, and timeouts are strictly controlled outside the database engine.
3. **Always enforce the Token-Bucket Rate Limiter (`emailRateLimiter.ts`)**, ensuring TalentXcel never attempts more than 10–14 dispatches per second against Amazon SES.
4. **Always enforce Idempotency Keys** on every transactional and queued email to make retries completely safe against duplicate delivery.
