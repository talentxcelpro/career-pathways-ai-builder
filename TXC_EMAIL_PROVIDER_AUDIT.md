# TalentXcel.in — Existing Email Provider Discovery Audit
**Mission ID:** TXC-MAIL-AUDIT-001  
**Audit Date:** November 3, 2026  
**Auditor:** Senior Solutions Architect, DevOps Engineer & Email Deliverability Specialist  
**Platform:** [https://talentxcel.in](https://talentxcel.in)  
**Status:** Certified Read-Only Discovery Audit  

---

## 1. Provider Discovery Matrix

| Provider | Integration Locations | Sending Domain | Configured Regions | Sender Identities | Operational Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Amazon SES (v2 SDK)** | `api/email/_send.ts`<br>`api/email/_process-queue.ts`<br>`src/services/email/emailProvider.ts` | `talentxcel.in`<br>`mail.talentxcel.in` | Primary: `us-east-1`<br>(Configurable via env) | `noreply@talentxcel.in`<br>`hello@talentxcel.in`<br>`support@talentxcel.in` | **Implemented / Dormant**<br>(Controlled by `EMAIL_MODE=ses`) |
| **Amazon SES (REST / SigV4)** | `supabase/functions/send-email-notification/index.ts` | `talentxcel.in` | Primary: `us-east-1`<br>Failover: `eu-north-1` | `noreply@talentxcel.in` | **Active / Standby**<br>(Ready for Edge invocations) |
| **Zoho Mail (API & SMTP)** | `supabase/functions/zoho-mail-service/index.ts`<br>MX Records on `talentxcel.in` | `talentxcel.in` | India (`mail.zoho.in`, `accounts.zoho.in`) | Dedicated departmental mailboxes (e.g. Sales, Enterprise) | **Active for Inbound MX**<br>**Standby for Outbound Outbox** |
| **Supabase Auth (GoTrue)** | Supabase Managed Auth Service | `talentxcel.in` / Supabase Default | Supabase Project Region | Auth System Sender | **Active & Functional**<br>(Handles verify/reset) |
| **Resend** | *None found* | N/A | N/A | N/A | **Not Configured / Not Present** |
| **SendGrid** | *None found* | N/A | N/A | N/A | **Not Configured / Not Present** |
| **Mailgun** | *None found* | N/A | N/A | N/A | **Not Configured / Not Present** |

---

## 2. In-Depth Provider Breakdown

### 2.1. Amazon SES: Existing Implementation & Dual-Path Architecture

The TalentXcel codebase possesses two distinct, functional implementations of Amazon SES sending logic:

#### Path A: Vercel Serverless Gateway (`api/email/_send.ts`)
- **Library:** `@aws-sdk/client-sesv2` (`SESv2Client`, `SendEmailCommand`).
- **Configuration Pattern:**
  - Evaluates `EMAIL_MODE` (`'ses'` vs `'console'`).
  - Access keys read from `AWS_ACCESS_KEY_ID` / `AWS_SES_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` / `AWS_SES_SECRET_ACCESS_KEY`.
  - Region resolved from `AWS_REGION` / `AWS_SES_REGION` (defaulting to `us-east-1`).
  - Custom MAIL FROM support via header configuration.
  - Tagging: Automatically tags each email with `{ Category, Template, Platform: 'TalentXcel' }` for CloudWatch and SES telemetry.
  - Response handling: Captures the SES `MessageId` and logs it into `public.email_audit_ledger`.

#### Path B: Supabase Edge Function (`supabase/functions/send-email-notification/index.ts`)
- **Library:** Pure standard library / `crypto.subtle` (zero npm dependencies for extreme cold-start speed in Deno).
- **Mechanism:** Implements a full **AWS Signature Version 4 (AWS4-HMAC-SHA256)** signing algorithm manually, posting directly to `https://email.${region}.amazonaws.com`.
- **Cross-Region Failover Logic:**
  - Explicit multi-region resilience: If sending fails in `eu-north-1` on attempt 1, the code automatically initiates a retry against `us-east-1`!
  - If `us-east-1` encounters an unhandled exception, it attempts fallback to `us-west-2`.
  - Parses XML response string `<MessageId>...</MessageId>` and returns execution duration.

---

### 2.2. Zoho Mail: The Business OS & Inbound Architecture

Zoho Mail is an integral part of TalentXcel's current production setup, but serves a **distinct, isolated purpose**:

1. **Inbound Mail Exchange (MX):**
   - Authoritative DNS records for `talentxcel.in` point directly to Zoho Mail India servers:
     - `mx.zoho.in` (Priority 10)
     - `mx2.zoho.in` (Priority 20)
     - `mx3.zoho.in` (Priority 50)
   - All human mailboxes (e.g. `admin@talentxcel.in`, `support@talentxcel.in`, personal team addresses) are hosted on Zoho Mail.

2. **Autonomous Business OS Integration (`supabase/functions/zoho-mail-service`):**
   - Explicitly designed to handle business development, campus outreach, and outbound corporate sales communications.
   - Utilizes Zoho Mail OAuth 2.0 API (`https://accounts.zoho.in/oauth/v2/token` and `https://mail.zoho.in/api/accounts/{accountId}/messages`).
   - Recorded telemetry writes to `claim1_growth_events` with `provider: "ZOHO_MAIL"`.
   - **Architectural Isolation:** The code contains an explicit architectural guarantee:
     > *"Dedicated Zoho Mail Outbound/Inbound Service for Autonomous Business OS. Completely ISOLATED from AWS SES (Existing-user & system email infrastructure)."*

---

### 2.3. Supabase Auth (GoTrue SMTP)

TalentXcel relies on Supabase Auth for core identity management:
- **Authentication Flows Handled:**
  - `supabase.auth.signUp()`: User registration and email confirmation links.
  - `supabase.auth.resetPasswordForEmail()`: Password reset links directed to `/auth/reset-password`.
- **Transport:** Currently dispatched via Supabase's managed mail service / SMTP relay.
- **SES Migration Opportunity:** Supabase allows configuring Custom SMTP under Project Settings > Authentication > SMTP Settings. Amazon SES SMTP credentials can be used here directly to unify reputation.

---

## 3. Environment Variable Audit (Names Only)

The following environment variable names are referenced in the codebase for email providers:

### Amazon SES Variables:
- `AWS_ACCESS_KEY_ID` / `AWS_SES_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` / `AWS_SES_SECRET_ACCESS_KEY`
- `AWS_REGION` / `AWS_SES_REGION`
- `EMAIL_MODE` (Accepted values: `'ses'`, `'console'`)
- `EMAIL_SEND_RATE_PER_SECOND` (Configures rate limiter)
- `EMAIL_UNSUBSCRIBE_SECRET` (For RFC 8058 HMAC verification)
- `CRON_SECRET` (For queue processor authorization)

### Zoho Mail Variables:
- `ZOHO_MAIL_CLIENT_ID`
- `ZOHO_MAIL_CLIENT_SECRET`
- `ZOHO_MAIL_REFRESH_TOKEN`
- `ZOHO_MAIL_ACCOUNT_ID`
- `ZOHO_SMTP_USER`
- `ZOHO_SMTP_PASSWORD`

### Supabase Core Variables:
- `SUPABASE_URL` / `TX_SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` / `TALENTXCEL_SERVICE_ROLE_KEY`

---

## 4. Provider Evaluation & Structural Defects

1. **Dual System Conflict on Root SPF:**
   - Because `talentxcel.in` is actively receiving and sending human email via Zoho Mail, the root SPF TXT record was set to `v=spf1 include:zoho.in ~all`.
   - Amazon SES was omitted from root SPF, resulting in a deliverability conflict whenever SES attempts to send as `*@talentxcel.in`.
2. **Custom MAIL FROM Subdomain Evidence:**
   - A dedicated sending subdomain `mail.talentxcel.in` exists with SPF `v=spf1 include:amazonses.com ~all` and MX pointing to `feedback-smtp.us-east-1.amazonses.com`.
   - This proves an earlier engineer began setting up SES with `mail.talentxcel.in` as the custom MAIL FROM domain, perfectly aligning with best practices to keep root Zoho mail and automated SES mail isolated!
