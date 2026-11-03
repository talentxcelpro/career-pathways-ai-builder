# TalentXcel.in — Existing DNS & Domain Deliverability Audit
**Mission ID:** TXC-MAIL-AUDIT-001  
**Audit Date:** November 3, 2026  
**Auditor:** Senior Email Deliverability Specialist & DevOps Engineer  
**Domain Under Audit:** `talentxcel.in`  
**DNS Provider:** Cloudflare (`damian.ns.cloudflare.com`)  
**Status:** Certified Live DNS Read-Only Investigation  

---

## 1. Executive Summary & Deliverability Verdict

A live, non-intrusive DNS query of `talentxcel.in` and its subdomains revealed **two critical deliverability barriers** that currently guarantee high spam placement or outright delivery rejection if Amazon SES were to dispatch emails under the root domain:

> [!CAUTION]
> **CRITICAL ISSUE 1: Conflicting Duplicate DMARC Records (RFC 7489 Violation)**  
> `_dmarc.talentxcel.in` contains **two separate, conflicting TXT records** (`p=none` AND `p=reject; pct=100`). Under RFC 7489 Section 6.6.3, receiving mail servers (Google, Microsoft, Yahoo) encountering multiple DMARC records must either treat the domain as having a **DMARC policy of PERMERROR** or enforce the strictest policy (`p=reject`), resulting in instant rejection of misaligned mail.

> [!WARNING]
> **CRITICAL ISSUE 2: Root SPF Does Not Authorize Amazon SES**  
> `talentxcel.in` SPF authorizes only Zoho Mail (`v=spf1 include:zoho.in ~all`). Amazon SES (`include:amazonses.com`) is **absent** from the root domain SPF record. Any email dispatched by SES with a Return-Path of `@talentxcel.in` will fail SPF validation (`SPF: Softfail` or `Fail`).

---

## 2. Live Authoritative DNS Evidence

Live DNS records queried directly from Cloudflare authoritative nameservers on November 3, 2026:

### 2.1. Root Domain: `talentxcel.in`

| Record Type | Host | TTL | Value / Data | Deliverability Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `talentxcel.in` | 300 | Priority 10: `mx.zoho.in`<br>Priority 20: `mx2.zoho.in`<br>Priority 50: `mx3.zoho.in` | **Active Zoho Mail.** All inbound human communications route to Zoho Mail India infrastructure. |
| **TXT (SPF)** | `talentxcel.in` | 300 | `v=spf1 include:zoho.in ~all` | **Zoho Only Authorized.** Amazon SES is **not included**. |
| **TXT (Verification)** | `talentxcel.in` | 300 | `zoho-verification=zb21826952.zmverify.zoho.in` | Zoho domain ownership token. |
| **TXT (Verification)** | `talentxcel.in` | 300 | `google-site-verification=nTmI_33A3373kHEXPI2gE41jbDB1Xly7qKUBaAucsnM` | Google Search Console token. |

---

### 2.2. DMARC Policy: `_dmarc.talentxcel.in`

| Record Type | Host | TTL | Value / Data | Standard Compliance | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TXT (DMARC #1)** | `_dmarc.talentxcel.in` | 300 | `v=DMARC1; p=none` | Non-enforcing monitoring policy | **FATAL CONFLICT** |
| **TXT (DMARC #2)** | `_dmarc.talentxcel.in` | 300 | `v=DMARC1; p=reject; pct=100; rua=mailto:admin@talentxcel.in; ruf=mailto:admin@talentxcel.in; fo=1` | Strict 100% rejection policy | **FATAL CONFLICT** |

#### Why this breaks delivery:
1. RFC 7489 explicitly states that a domain **must not have more than one DMARC record**.
2. When Gmail, Outlook, or Yahoo evaluate inbound mail, multiple DMARC records trigger a `DMARC PERMERROR`.
3. If a receiving gateway resolves Record #2 first, it enforces `p=reject`. Because Amazon SES is currently not in root SPF and lacks aligned DKIM on the root domain, **100% of emails sent via SES would be rejected at the gateway**.

---

### 2.3. Sending Subdomain: `mail.talentxcel.in` (Custom MAIL FROM)

| Record Type | Host | TTL | Value / Data | Deliverability Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **TXT (SPF)** | `mail.talentxcel.in` | 300 | `v=spf1 include:amazonses.com ~all` | **Valid.** Authorizes Amazon SES custom MAIL FROM. |
| **MX** | `mail.talentxcel.in` | 300 | Priority 10: `feedback-smtp.us-east-1.amazfeedback-smtp.us-east-1.amazonses.comonses.com` | **FATAL TYPO / COPY-PASTE COLLISION.** The domain was accidentally doubled during DNS entry. AWS SES cannot verify MX until corrected to `feedback-smtp.us-east-1.amazonses.com`. |

---

### 2.5. DKIM Records: `*._domainkey.talentxcel.in`

Amazon SES in `us-east-1` generated the following 3 RSA 2048-bit Easy DKIM CNAME records on September 28, 2026. **None of them are currently published in Cloudflare DNS:**

1. **Record 1:**
   - **Type:** `CNAME`
   - **Name:** `fguwveiwqy2zzot6jjcitwisgldgr3r7._domainkey.talentxcel.in` (or `fguwveiwqy2zzot6jjcitwisgldgr3r7._domainkey`)
   - **Target / Value:** `fguwveiwqy2zzot6jjcitwisgldgr3r7.dkim.amazonses.com`
2. **Record 2:**
   - **Type:** `CNAME`
   - **Name:** `2tnqlon6fhtqkjxek4rotjjo5lli3bih._domainkey.talentxcel.in` (or `2tnqlon6fhtqkjxek4rotjjo5lli3bih._domainkey`)
   - **Target / Value:** `2tnqlon6fhtqkjxek4rotjjo5lli3bih.dkim.amazonses.com`
3. **Record 3:**
   - **Type:** `CNAME`
   - **Name:** `fdw2nwtzm4vujlhe2faqnjmbhlu3yni2._domainkey.talentxcel.in` (or `fdw2nwtzm4vujlhe2faqnjmbhlu3yni2._domainkey`)
   - **Target / Value:** `fdw2nwtzm4vujlhe2faqnjmbhlu3yni2.dkim.amazonses.com`

---

## 3. RFC 8058 One-Click Unsubscribe & Compliance

Inspected in [src/services/email/emailUnsubscribe.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/src/services/email/emailUnsubscribe.ts) and [api/email/_send.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_send.ts):

### Header Compliance
For all non-transactional categories (`product_notification`, `engagement`, `marketing`), TalentXcel generates compliant RFC 8058 headers:
```http
List-Unsubscribe: <https://talentxcel.in/api/email/unsubscribe?token=...&email=...>, <mailto:unsubscribe@talentxcel.in?subject=unsubscribe:...>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Cryptographic Security
- The unsubscribe token is generated using `HMAC-SHA256` signed with `EMAIL_UNSUBSCRIBE_SECRET`.
- Transactional messages (passwords, OTPs, application confirmations) are strictly exempt from unsubscribe footers and headers to comply with security standards.

---

## 4. Bounce, Complaint & Suppression Architecture

Inspected in [api/email/_ses-webhook.ts](file:///c:/Users/Arshid.Wani/talentxcel-local/api/email/_ses-webhook.ts):

1. **Amazon SNS Cryptographic Verification:**
   - Webhook intercepts SNS notifications from Amazon SES.
   - Uses `verifySnsSignature` with official AWS X.509 certificate validation to prevent spoofing.
   - Strictly validates `SubscribeURL` to prevent Server-Side Request Forgery (SSRF).
2. **Permanent Bounce Handling:**
   - Evaluates `bounceType === 'Permanent'`.
   - Immediately upserts the recipient into `public.email_suppression_list` with `is_active = true` and `reason = 'Permanent Bounce'`.
   - Logs the event to `public.email_audit_ledger` with `status = 'bounced'`.
3. **Complaint Handling:**
   - When a recipient flags an email as spam, SES emits a `Complaint` event.
   - Handler immediately adds the recipient to `public.email_suppression_list` with `reason = 'Spam Complaint'`.
   - Updates `public.email_user_preferences` setting `unsubscribed_all_non_essential = true`.
4. **Transient Bounce Handling:**
   - Logs transient bounce (mailbox full, greylisting) without immediate suppression, allowing the retry backoff to function.

---

## 5. Required Deliverability Remediations (Before SES Production Dispatch)

To achieve 100% inbox placement and eliminate spam penalties:

1. **Delete Conflicting DMARC Record:** Remove `v=DMARC1; p=none` from Cloudflare DNS. Keep the single authoritative DMARC record, adjusting policy to `p=none` temporarily during SES verification, then promoting to `p=quarantine` or `p=reject` once DKIM aligns.
2. **Configure Custom MAIL FROM on SES:** Configure Amazon SES to send via `mail.talentxcel.in` (already has SES MX and SPF) rather than the root domain.
3. **Publish 3 SES Easy DKIM CNAME Records:** Generate 3 DKIM tokens in Amazon SES (`us-east-1`) and publish them in Cloudflare DNS.
4. **Update Root SPF (If sending from root domain):** If sending directly from `noreply@talentxcel.in` without custom return-path:
   ```
   v=spf1 include:zoho.in include:amazonses.com ~all
   ```
