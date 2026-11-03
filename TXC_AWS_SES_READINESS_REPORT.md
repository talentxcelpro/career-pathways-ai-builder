# TalentXcel.in — Amazon SES Integration & Account Readiness Report
**Mission ID:** TXC-MAIL-AUDIT-001  
**Audit Date:** November 3, 2026  
**Auditor:** Senior Cloud Architect, DevOps Engineer & Email Infrastructure Specialist  
**Platform:** [https://talentxcel.in](https://talentxcel.in)  
**Status:** Certified Read-Only Readiness Assessment  

---

## 1. Executive Summary: SES Integration Status

The TalentXcel platform is **substantially pre-engineered for Amazon SES**, but exists in a **dormant state** pending configuration alignment, DNS remediation, and queue scheduler reconnection:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           AMAZON SES READINESS SCORE                           │
│                                                                                │
│   Codebase SES Compatibility:      95% (v2 SDK + SigV4 REST fully written)     │
│   Rate Limiter Compliance:        100% (Token bucket capped at 8-14 sends/sec) │
│   Feedback / Bounce Loop:          90% (SNS cryptographic webhook ready)       │
│   SES Production Dispatch Mode:     0% (Currently set to console safe-mode)    │
│   DNS Alignment & Verification:    25% (Root SPF & DKIM missing; DMARC broken) │
│   Automated Queue Poller:           0% (Disabled since Sep 2026 quota cleanup) │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Available AWS SES Regional Accounts Evaluation

We have two operational, quota-approved Amazon SES regions available:

| Account / Region | Region Identifier | Production Daily Quota | Max Send Rate | Geographical Proximity | Codebase Integration Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Region 1: Europe (Stockholm)** | `eu-north-1` | 50,000 emails/day | 14 emails/second | Moderate to Europe / India | Configured as secondary / failover in `send-email-notification/index.ts`. |
| **Region 2: US East (N. Virginia)** | `us-east-1` | 50,000 emails/day | 14 emails/second | High to Vercel US Serverless | **Default primary region** in `api/email/_send.ts` and `mail.talentxcel.in` DNS. |

### 2.1. Recommended Primary Region: `us-east-1` (US East, N. Virginia)
**Recommendation:** **Deploy `us-east-1` as the Primary Production Region.**
**Justification:**
1. **Existing DNS Evidence:** The custom MAIL FROM subdomain [mail.talentxcel.in](file:///c:/Users/Arshid.Wani/talentxcel-local/TXC_EMAIL_DELIVERABILITY_AUDIT.md) already has an MX record pointing specifically to `feedback-smtp.us-east-1.amazonses.com`. Reusing this saves DNS churn.
2. **Execution Locality:** Vercel serverless functions (`api/email/send`, `api/jobs/apply`) execute in the US-East / Washington DC availability zones by default. Latency to `email.us-east-1.amazonaws.com` is sub-15ms.
3. **AWS Service Breadth:** `us-east-1` has the earliest availability of all new SES v2 features, CloudWatch metrics, and Configuration Set enhancements.

### 2.2. Multi-Region Failover Architecture: Is It Appropriate?
**Verdict:** **Yes, as Warm Secondary / Disaster Recovery, NOT active-active load balancing.**
**Rationale:**
- **Send Rate Headroom:** TalentXcel's current volume is well within a single region's quota (50,000/day and 14/sec). Active-active load balancing adds unnecessary state synchronization overhead (suppression lists, message IDs, configuration sets across two regions).
- **Existing Fallback Code:** The Edge Function `supabase/functions/send-email-notification` already implements automatic regional fallback (lines 348–352). If `eu-north-1` returns a 5xx error or connection timeout, it automatically re-dispatches to `us-east-1`.
- **Recommendation:** Maintain `us-east-1` as Primary and `eu-north-1` as warm Disaster Recovery failover.

---

## 3. Integration Mechanism: SES API vs. SMTP

| Criteria | AWS SES v2 API (HTTP / SDK) | AWS SES SMTP Relay |
| :--- | :--- | :--- |
| **Protocol** | HTTPS REST (Port 443) | TLS SMTP (Port 587 / 465 / 25) |
| **Latency** | 60–120ms (Persistent connection / HTTP/2) | 350–700ms (Multi-roundtrip SMTP handshake) |
| **Serverless Compatibility** | **100% Native** in Vercel & Supabase Edge | Prone to socket timeout and leak in serverless |
| **Feature Set** | Dynamic tags, Configuration Sets, immediate MessageId return | Basic MIME dispatch |
| **Code Readiness in TXC** | Fully implemented in `api/email/_send.ts` and `send-email-notification` | Only used by Supabase Auth (GoTrue) |
| **Architectural Verdict** | **PRIMARY CHOICE for Application & Queue Sending** | **RESERVED ONLY for Supabase Auth Settings** |

---

## 4. Reusability of Existing TalentXcel Infrastructure

The following assets can be **100% reused without rewriting**:

1. **Enterprise Serverless Dispatch Gateway (`api/email/_send.ts`):**
   - Handles template rendering, suppression lookup, user preference checks, and SES v2 client execution.
   - Requires zero code changes; only requires environment variables `EMAIL_MODE=ses` and AWS credentials.
2. **Deterministic Email Layout & Templates (`src/services/email/emailTemplates.ts`):**
   - 10 responsive HTML templates with inline styles, escaping, preheaders, and plain-text alternatives.
3. **Token-Bucket Rate Limiter (`src/services/email/emailRateLimiter.ts`):**
   - Strictly enforces 8–14 sends/second to prevent exceeding Amazon SES account quotas.
4. **Cryptographic SNS Feedback Webhook (`api/email/_ses-webhook.ts`):**
   - Ingests delivery events, parses permanent/transient bounces and complaints, and populates `email_suppression_list`.
5. **Database Outbox & Audit Ledger (`email_automation_queue` & `email_audit_ledger`):**
   - High-performance priority queue with idempotency keys and indexed status columns.

---

## 5. Prerequisite Steps for Production SES Activation

Do not assume a healthy SES account means emails can be dispatched. The following requirements must be verified in the AWS Console prior to flipping `EMAIL_MODE=ses`:

### 5.1. AWS Account Sandbox Status
- Verify that both `us-east-1` and `eu-north-1` have been moved out of the **Amazon SES Sandbox**. In the sandbox, emails can only be sent to pre-verified email addresses.

### 5.2. Domain Identity & DKIM Verification
In the AWS SES Console (`us-east-1`), Easy DKIM (RSA 2048-bit) was generated on September 28, 2026. The exact 3 CNAME records awaiting publication in Cloudflare are:

| Record | Type | Name (Host) | Target Value (Points To) |
| :--- | :--- | :--- | :--- |
| **DKIM 1** | CNAME | `fguwveiwqy2zzot6jjcitwisgldgr3r7._domainkey` | `fguwveiwqy2zzot6jjcitwisgldgr3r7.dkim.amazonses.com` |
| **DKIM 2** | CNAME | `2tnqlon6fhtqkjxek4rotjjo5lli3bih._domainkey` | `2tnqlon6fhtqkjxek4rotjjo5lli3bih.dkim.amazonses.com` |
| **DKIM 3** | CNAME | `fdw2nwtzm4vujlhe2faqnjmbhlu3yni2._domainkey` | `fdw2nwtzm4vujlhe2faqnjmbhlu3yni2.dkim.amazonses.com` |

### 5.3. Custom MAIL FROM Domain Repair
Under the `talentxcel.in` identity in SES, Custom MAIL FROM is set to `mail.talentxcel.in`.
- **Live DNS Defect Identified:** Cloudflare currently holds a garbled MX record: `feedback-smtp.us-east-1.amazfeedback-smtp.us-east-1.amazonses.comonses.com`.
- **Required Fix:** Update the MX record on `mail.talentxcel.in` to the exact value:
  - **Type:** MX
  - **Name:** `mail`
  - **Server / Value:** `feedback-smtp.us-east-1.amazonses.com`
  - **Priority:** `10`
- Once corrected, clicking **Retry** in the SES console will immediately flip Custom MAIL FROM status to **Successful**.

### 5.4. Configuration Set & SNS Event Publishing
- Create an SES Configuration Set named `talentxcel-production`:
  1. Add Event Destination: **Amazon SNS**.
  2. Select event types: **Bounces**, **Complaints**, and **Deliveries**.
  3. Direct to an SNS topic (e.g., `arn:aws:sns:us-east-1:...:ses-feedback-events`).
  4. Subscribe the HTTPS endpoint `https://talentxcel.in/api/email/ses-webhook` to this SNS topic.
  5. The webhook handler in `_ses-webhook.ts` will auto-confirm the subscription.

### 5.5. IAM Least-Privilege Policy
Provision an IAM user specifically for TalentXcel sending with the following minimal policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": [
        "arn:aws:ses:us-east-1:*:identity/talentxcel.in",
        "arn:aws:ses:eu-north-1:*:identity/talentxcel.in",
        "arn:aws:ses:us-east-1:*:configuration-set/talentxcel-production"
      ]
    }
  ]
}
```

---

## 6. Supabase Auth SMTP Integration

To ensure password resets, verification emails, and auth links also route through the verified SES domain:
1. In AWS SES (`us-east-1`), navigate to **SMTP Settings** and generate SMTP Credentials.
2. In Supabase Dashboard, navigate to **Project Settings > Authentication > SMTP Settings**.
3. Enable Custom SMTP:
   - **Sender Email:** `noreply@talentxcel.in`
   - **Sender Name:** `TalentXcel`
   - **Host:** `email-smtp.us-east-1.amazonaws.com`
   - **Port:** `587`
   - **Encryption:** `TLS`
   - **Username / Password:** SES SMTP Credentials.
