# TalentXcel.in — Existing Email & Mailing Infrastructure Inventory
**Mission ID:** TXC-MAIL-AUDIT-001  
**Audit Date:** November 3, 2026  
**Auditor:** Senior Solutions Architect, DevOps Engineer, Supabase Architect & Deliverability Specialist  
**Platform:** [https://talentxcel.in](https://talentxcel.in)  
**Status:** Certified Read-Only Discovery Audit  

---

## 1. Executive Summary & Architecture Overview

TalentXcel possesses a surprisingly sophisticated, enterprise-grade email delivery framework that has evolved through several iterations between June 2025 and November 2026. However, this infrastructure is currently **fragmented across four separate runtime layers**, suffering from a **stalled execution queue** following an emergency database cron shutdown in September 2026, and afflicted by **severe DNS deliverability conflicts**.

### The Four Runtime Layers

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                TALENTXCEL RUNTIME TOPOLOGY                  │
                               └─────────────────────────────────────────────────────────────┘
                                                              │
         ┌──────────────────────────────┬─────────────────────┴───────────────┬─────────────────────────────┐
         ▼                              ▼                                     ▼                             ▼
 ┌────────────────┐            ┌─────────────────┐                  ┌──────────────────┐           ┌─────────────────┐
 │ Vercel Serverless │          │ Supabase Edge   │                  │ PostgreSQL / DB  │           │ Client / React  │
 │ API Gateway    │            │ Functions       │                  │ Infrastructure   │           │ Application     │
 └───────┬────────┘            └────────┬────────┘                  └────────┬─────────┘           └────────┬────────┘
         │                              │                                    │                              │
         ├─ /api/email/send             ├─ send-email-notification           ├─ email_automation_queue      ├─ src/services/email
         ├─ /api/email/process-queue    ├─ process-email-queue               ├─ email_suppression_list      ├─ src/lib/sendEmail.ts
         ├─ /api/email/ses-webhook      ├─ unified-email-service             ├─ email_user_preferences      ├─ src/lib/emailTemplates
         └─ /api/email/unsubscribe      ├─ zoho-mail-service                 ├─ email_audit_ledger          └─ Admin Test Tools
                                        ├─ send-campaign                     └─ notification_events            (Many broken UI
                                        └─ notify-joining-bonus                 (Outbox pattern)                mocks)
```

1. **Vercel Serverless Email Gateway (`api/email/`):** Built with `@aws-sdk/client-sesv2` and cryptographic Amazon SNS signature verification. Completely self-contained, supporting priority routing, suppression list enforcement, user preference checking, and audit ledger writes.
2. **Supabase Edge Functions (`supabase/functions/`):** Contains Deno-based microservices (`send-email-notification`, `process-email-queue`, `send-campaign`, `unified-email-service`, and `zoho-mail-service`). Implements custom AWS Signature Version 4 HMAC-SHA256 signing for SES and dedicated Zoho Mail API integration.
3. **Supabase PostgreSQL Schema:** A comprehensive relational outbox with priority queues, idempotency constraints, suppression lists, audit logs, and granular user preferences.
4. **React Frontend Services (`src/services/email/`):** Complete client-side abstractions (`EmailService`, `EmailQueueManager`, `EmailGovernor`, `EmailProvider`, `EmailRateLimiter`) designed to interact with the database queue and local fallback.

---

## 2. Inventory of Server-Side API Routes (Vercel Serverless)

All serverless endpoints are hosted under `api/email/` and routed via [vercel.json](file:///c:/Users/Arshid.Wani/talentxcel-local/vercel.json):

| Endpoint Route | Implementation File | Primary Dependencies | Authentication / Authorization | Operational Function |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/email/send` | [api/email/_send.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_send.ts) | `@aws-sdk/client-sesv2`, `@supabase/supabase-js` | Bearer `TALENTXCEL_SERVICE_ROLE_KEY`, `CRON_SECRET`, or `x-vercel-cron: 1` | Immediate or queued dispatch via AWS SES; checks suppression & user preferences; writes to `email_audit_ledger`. |
| `GET /api/email/send` | [api/email/_send.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_send.ts) | None | Public / Diagnostic | Health check returning `emailMode`, `hasAwsKeys`, `awsSdkAvailable`, and `region`. |
| `POST /api/email/process-queue` | [api/email/_process-queue.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_process-queue.ts) | `@aws-sdk/client-sesv2`, `@supabase/supabase-js` | Bearer `CRON_SECRET`, `TALENTXCEL_SERVICE_ROLE_KEY`, or `x-vercel-cron: 1` | Batch processor for `email_automation_queue`; fetches pending items ordered by priority ASC and created_at ASC; enforces exponential backoff. |
| `POST /api/email/ses-webhook` | [api/email/_ses-webhook.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_ses-webhook.ts) | `crypto`, `@supabase/supabase-js`, `snsVerifier.ts` | Amazon SNS Cryptographic Signature Verification (X.509 certificate) | Ingests SES delivery, bounce, and complaint notifications; automatically adds hard bounces and complaints to `email_suppression_list`. |
| `GET / POST /api/email/unsubscribe` | [api/email/_unsubscribe.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_unsubscribe.ts) | `crypto`, `@supabase/supabase-js` | HMAC-SHA256 Token or Email query param | RFC 8058 compliant one-click unsubscribe handler; updates `email_user_preferences`. |

---

## 3. Inventory of Supabase Edge Functions

Inspected from directory [supabase/functions/](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions):

| Edge Function Name | Main Entry Point | Primary Provider / Integration | Underlying Mechanism | Status & Observability |
| :--- | :--- | :--- | :--- | :--- |
| `send-email-notification` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/send-email-notification/index.ts) | Amazon SES (`us-east-1`, fallback to `eu-north-1`) | Native REST API with AWS Signature Version 4 (HMAC-SHA256) | **Active & Functional**; supports template rendering, suppression lookup, and cross-region failover. |
| `process-email-queue` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/process-email-queue/index.ts) | Internal invocation of `send-email-notification` | Queries `email_automation_queue` (limit 50), updates retries, invokes `send-email-notification` per record. | **Dormant**; no automated cron currently calls it. |
| `unified-email-service` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/unified-email-service/index.ts) | Supabase DB Queue | Inserts into legacy table `email_queue` (NOT `email_automation_queue`); invokes `process-email-queue` for high priority. | **Partially Disconnected**; writes to separate legacy table. |
| `zoho-mail-service` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/zoho-mail-service/index.ts) | Zoho Mail REST API (`mail.zoho.in`) | OAuth 2.0 token refresh + REST dispatch for Autonomous Business OS / sales acquisition; isolated from SES. | **Implemented & Isolated**; requires Zoho OAuth secrets in Supabase vault. |
| `send-campaign` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/send-campaign/index.ts) | Supabase DB Queue | Queries `profiles` by target audience (`job_seekers`, `employers`); bulk inserts jobs into `email_automation_queue`. | **Active for Enqueueing**; execution relies on stalled queue worker. |
| `notify-joining-bonus` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/notify-joining-bonus/index.ts) | Supabase DB Queue | Scans `txc_transactions` for unnotified joining bonuses; inserts welcome trigger into `email_automation_queue`. | **Functional for Enqueueing**. |
| `process-notification-outbox` | [index.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/functions/process-notification-outbox/index.ts) | Web Push / FCM / APNs | Outbox worker for `notification_events` table (created Nov 3, 2026). Currently only dispatches `channel = 'push'`. | **Push Only**; email dispatch branch is not wired. |

---

## 4. Database Schema & Data Models

The Supabase PostgreSQL database contains several generations of email-related tables. The canonical, production tables are defined in migration `20260928120000_production_email_infrastructure.sql` and `20261103100000_unified_notification_engine.sql`:

### 4.1. Canonical Production Tables

#### A. `public.email_automation_queue`
Central outbox table for asynchronous email delivery:
- `id` (uuid, PK)
- `trigger_type` (text, e.g. `'welcome'`, `'application_confirmation'`)
- `recipient_email` (text, indexed)
- `recipient_name` (text)
- `template_data` (jsonb)
- `category` (text: `'transactional'`, `'product_notification'`, `'engagement'`, `'marketing'`)
- `priority` (integer: `1`=Critical, `2`=High, `3`=Normal, `4`=Low)
- `idempotency_key` (text, UNIQUE indexed where not null)
- `user_id` (uuid, nullable)
- `status` (text: `'pending'`, `'processing'`, `'sent'`, `'failed'`, `'cancelled'`, `'suppressed'`)
- `retry_count` (integer, default 0, max 3)
- `scheduled_at` (timestamptz)
- `sent_at` (timestamptz)
- `provider_message_id` (text, captures SES MessageId)
- `error_message` (text)
- `created_at` / `updated_at` (timestamptz)

#### B. `public.email_suppression_list`
Critical reputation protection table preventing outbound sends to bad addresses:
- `id` (uuid, PK)
- `email_address` (text, UNIQUE indexed, lowercase)
- `suppression_type` / `reason` (text: `'bounce'`, `'complaint'`, `'manual'`)
- `is_active` (boolean, default true)
- `source` (text, e.g. `'ses_webhook'`, `'admin'`)
- `metadata` (jsonb, diagnostic codes, bounce subtypes)
- `created_at` (timestamptz)

#### C. `public.email_user_preferences`
User unsubscribe and communication preferences:
- `id` (uuid, PK)
- `user_id` (uuid, REFERENCES `auth.users(id)`, UNIQUE)
- `email` (text, UNIQUE)
- `email_job_alerts` (boolean, default true)
- `email_job_matches` (boolean, default true)
- `email_application_updates` (boolean, default true)
- `email_career_recommendations` (boolean, default true)
- `email_product_updates` (boolean, default false)
- `email_marketing` (boolean, default false)
- `email_weekly_digest` (boolean, default true)
- `frequency_cap_daily` (integer, default 3)
- `unsubscribed_all_non_essential` (boolean, default false)
- `unsubscribe_token` (text)
- `unsubscribed_at` (timestamptz)

#### D. `public.email_audit_ledger`
Immutable compliance and delivery telemetry ledger:
- `id` (uuid, PK)
- `recipient_email` (text)
- `user_id` (uuid, nullable)
- `category` (text)
- `template_name` (text)
- `subject` (text)
- `priority` (integer)
- `status` (text: `'queued'`, `'sent'`, `'suppressed'`, `'failed'`, `'frequency_capped'`, `'preference_blocked'`)
- `provider_message_id` (text)
- `error_message` (text)
- `idempotency_key` (text)
- `metadata` (jsonb)
- `created_at` (timestamptz)

#### E. `public.notification_events` (Unified Outbox Engine)
Created Nov 3, 2026, for multi-channel notification fan-out:
- `id` (uuid, PK)
- `event_type` (text, e.g. `'APPLICATION_SUBMITTED'`, `'JOB_MATCHED'`)
- `recipient_id` (uuid, REFERENCES `auth.users`)
- `payload` (jsonb)
- `idempotency_key` (text, UNIQUE)
- `status` (text: `'pending'`, `'processing'`, `'completed'`, `'retrying'`, `'failed'`, `'dead_letter'`)
- `retry_count` / `max_retries`
- `scheduled_for` (timestamptz)

### 4.2. Legacy & Deprecated Database Tables
- `email_queue` / `email_queue_simple` (Created July 2025; superseded by `email_automation_queue`).
- `email_templates` / `email_templates_v2` (Legacy dynamic template tables).
- `email_delivery_events` / `email_analytics_daily` / `email_delivery_tracking` (Early telemetry schemas).
- `email_automation_settings` / `email_notification_settings`.

---

## 5. PostgreSQL Functions & Stored Procedures

| Function Name | Security Type | Input Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| `public.enqueue_idempotent_email` | `SECURITY DEFINER` | `p_trigger_type`, `p_recipient_email`, `p_recipient_name`, `p_template_data`, `p_category`, `p_priority`, `p_idempotency_key`, `p_delay_minutes`, `p_user_id` | Checks suppression list; checks idempotency key; inserts into `email_automation_queue`; writes initial audit record to `email_audit_ledger`. |
| `public.dispatch_notification_event` | `SECURITY DEFINER` | `p_recipient_id`, `p_actor_id`, `p_event_type`, `p_title`, `p_message`, `p_link`, `p_module`, `p_category`, `p_priority`, `p_icon`, `p_entity_type`, `p_entity_id`, `p_idempotency_key` | Inserts into `notifications` (in-app) and `notification_events` (outbox). Evaluates quiet hours for push notifications. |
| `public.enqueue_email_event` | `SECURITY DEFINER` | `p_event_key`, `p_recipient_email`, `p_recipient_name`, `p_template_data`, `p_delay_minutes` | Legacy enqueuing RPC function. |
| `public.track_outreach_usage` | `SECURITY DEFINER` | `employer_uuid`, `email_count` | Deducts employer outreach quota. |

---

## 6. Forensic Audit: The September 2026 Quota Incident

A critical historical artifact was discovered in migration [20260929160000_kill_all_cron_and_halt_quota_drain.sql](file:///c:/Users/Arshid.Wani/talentxcel-local/supabase/migrations/20260929160000_kill_all_cron_and_halt_quota_drain.sql):

### Incident Root Cause
In September 2026, a `pg_cron` job named `process-email-queue-every-2-minutes` ran over 3,550 times in rapid succession, firing continuous HTTP POST requests via the `pg_net` extension (`net.http_post`) to Supabase Edge Functions. A migration had silently recreated this job unconditionally. This resulted in thousands of redundant Edge Function invocations, exhausting execution quotas and bloating Postgres logs.

### Remediation Applied
On September 29, 2026:
1. All `pg_cron` jobs were unconditionally unscheduled.
2. `cron.job_run_details` was truncated.
3. `net._http_response` was purged.
4. Failing queue records with `retry_count >= 3` were marked `'cancelled'`.

### Unintended Side Effect (The Current State)
Because `pg_cron` was completely stripped and **no external cron replacement** (such as a Vercel Cron or GitHub Action) was established to poll `/api/email/process-queue`, **the entire automated email processing pipeline has remained paused in production**. Newly queued emails (welcome emails from registration, job application confirmations) enter `email_automation_queue` but stay in `'pending'` state indefinitely.
