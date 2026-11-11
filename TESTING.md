# TalentXcel Analytics & Conversion Verification Guide

This guide details how to verify the GA4 conversion events, new-account detection, first-touch attribution, and authentication flows across TalentXcel.

---

## 1. Summary of Implemented GA4 Events & Key Events

All events adhere strictly to the **DPDP Act (India)** & **GDPR**: **Zero PII** (no email, phone, name, tokens, or passwords) is transmitted to Google Analytics.

| Event Name | Trigger Condition | Parameters Sent | Mark as Key Event in GA4 |
| :--- | :--- | :--- | :--- |
| `sign_up` | New user created (detected via explicit signup form submit, creation within 90s, or email confirmation link click). Fired once per account. | `method` (`google` \| `linkedin` \| `email`), `source_subdomain`, `landing_path`, `page_type` | **Yes (Primary)** |
| `login` | Returning user logs in. Fired instead of `sign_up` to prevent count inflation. | `method` (`google` \| `linkedin` \| `email`), `source_subdomain`, `landing_path`, `page_type` | Optional |
| `apply_job_click` | Visitor clicks "Apply" on a job page (`stage: 'click'`) or completes application (`stage: 'completed'`). | `job_id`, `stage` (`click` \| `completed`), `source_subdomain`, `landing_path`, `page_type` | **Yes (Primary)** |
| `resume_generated` | Visitor downloads/exports a generated resume. | `template_id`, `source_subdomain`, `landing_path`, `page_type` | **Yes (Primary)** |
| `claim_passport` | *Defined in helper, but UI CTA belongs to Step 4 (scheduled after 3-5 day baseline).* | `passport_id`, `source_subdomain`, `landing_path`, `page_type` | *Defer until Step 4* |
| `one_tap_shown` | Google One Tap prompt was rendered and displayed to visitor. | `source_subdomain`, `landing_path`, `page_type` | No |
| `one_tap_dismissed`| Google One Tap prompt dismissed, skipped, or not displayed. | `reason` (`dismissed` \| `skipped` \| `not_displayed`), `source_subdomain`, `landing_path`, `page_type` | No |
| `cta_click` | *Defined in helper, but UI buttons belong to Step 4 (scheduled after 3-5 day baseline).* | `cta_name`, `cta_location`, `source_subdomain`, `landing_path`, `page_type` | No |

---

## 2. New-Account Detection Strategy (Resolving Email Confirmation Gap)

To ensure email sign-ups with email confirmation are not mistakenly counted as returning logins, `trackAuthSession` uses a **triple-detection engine**:

1. **Explicit Sign-Up Trigger (`isExplicitSignUp`):** When a user submits the registration form on `/auth/signup` or `UnifiedAuthForm`, `sign_up` fires immediately upon successful `supabase.auth.signUp()`, storing a persistent deduplication flag (`tx_ga4_signup_fired_<id>`).
2. **Recent Creation (`isCreatedRecently`):** For Google and LinkedIn OAuth (and instant email sessions without confirmation), `user.created_at` within 90 seconds flags the account as new.
3. **Email Confirmation Match (`isJustConfirmed`):** If a user registers, receives a confirmation email, and clicks the link minutes or hours later in a different browser/device, GoTrue issues a session where `last_sign_in_at` and `email_confirmed_at` are within 120 seconds of each other and within 120 seconds of `now`. This detects their first confirmed session and fires `sign_up`.
4. **Returning User Guard:** On subsequent logins (e.g. days later), `created_at` and `email_confirmed_at` are days in the past, while `last_sign_in_at` is `now`. All three new-account checks evaluate to false, correctly dispatching `login`.

---

## 3. GA4 Realtime & DebugView Verification Procedure

### A. Enabling Debug Mode in Browser
1. Install the official **Google Analytics Debugger** Chrome extension, OR
2. Append `?debug_mode=true` to any URL on `talentxcel.in` or its subdomains.
3. Open your browser DevTools Console. In development mode, `[GA4 Event: <name>]` logs output directly to the console with the sanitized payload.

### B. Verifying `sign_up` vs `login` Deduplication
1. **Fresh Google/LinkedIn Account Signup Test:**
   - Open an incognito browser window.
   - Sign up via Google or LinkedIn.
   - Check **GA4 Realtime > Event Count by Event Name** or **Admin > DebugView**.
   - Verify: `sign_up` event appears with parameters:
     - `method`: `google` or `linkedin`
     - `source_subdomain`: `root` (or originating subdomain)
     - `page_type`: `auth` (or originating page)
   - Verify in Supabase Auth Dashboard: user is created; check `user_metadata.first_touch_attribution` to confirm first-touch referrer and landing page are saved.

2. **Returning Account Login Test:**
   - In the same or a fresh session, log in with an existing account.
   - Check **GA4 Realtime**:
   - Verify: `login` event fires with `method`. **`sign_up` DOES NOT fire**, ensuring historical signup stats match Supabase user counts exactly.

3. **Email Sign-Up Test:**
   - Register a new email account on `/auth/signup`.
   - Verify: `sign_up` fires immediately with `{ method: 'email' }`.
   - Log in again with that same email: verify `login` fires and `sign_up` does not.

### C. Verifying Job Apply Return-To Flow (`apply_job_click`)
1. Open an incognito window without logging in.
2. Navigate to a job detail page (e.g., `https://talentxcel.in/jobs/operations-specialist-talentxcel-services-f75fe7b3`).
3. Click the **Apply Now** button.
4. **Expected Behavior:**
   - GA4 fires `apply_job_click` with `{ stage: 'click', job_id: '...' }`.
   - Browser stores return intent and smoothly redirects to `/auth/login?returnTo=%2Fjobs%2F...`.
5. Complete sign-in (Google, LinkedIn, or Email).
6. **Expected Behavior:**
   - User is redirected back to the exact job page.
   - The application modal (`ComprehensiveJobApplicationForm`) opens automatically.
   - A friendly toast notifies: *"Signed in! Please complete your application below."*
7. Submit the application.
8. **Expected Behavior:**
   - GA4 fires `apply_job_click` with `{ stage: 'completed', job_id: '...' }`.

---

## 4. Security & Privacy Audit Findings

1. **Attribution Metadata Security:**
   - First-touch attribution is saved into `auth.users.raw_user_meta_data.first_touch_attribution` via `supabase.auth.updateUser()`.
   - As noted, users can edit their own user metadata via client SDK calls. Therefore, **attribution data is strictly used for analytical reporting and marketing channel evaluation, never for permissions, roles, or access control**.
2. **Row-Level Security (RLS) on Profiles:**
   - The `supabase.from('profiles').update(...)` call uses the client-side Supabase client with the user's session JWT (`auth.uid() = id`). It does not use any service role key in the browser and adheres to Supabase RLS policies.
3. **Google Consent Mode v2 & DPDP:**
   - `index.html` initializes Google Consent Mode v2:
     - `analytics_storage`: `'granted'` (first-party operational analytics)
     - `ad_storage`: `'denied'` (no ad cookies dropped)
     - `ad_user_data`: `'denied'`
     - `ad_personalization`: `'denied'`
   - Privacy Policy has been updated to explicitly explain non-PII first-touch attribution and UTM parameter storage in accordance with India's DPDP Act, 2023.

---

## 5. Email Delivery Mode Verification (`api/email/send.ts`)

- If `EMAIL_MODE === 'ses'` AND `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SES_REGION` are defined:
  - Emails are dispatched live via **Amazon SES API (v3 SDK)**.
- If any of those variables are missing, or `EMAIL_MODE` is not `ses`:
  - It falls back gracefully to `console` mode (logs to server stdout, returns `{ success: true, mode: 'console' }`).

To enable Live Amazon SES in production Vercel:
```env
EMAIL_MODE=ses
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_REGION=ap-south-1  # or your verified SES region
EMAIL_FROM="TalentXcel <notifications@talentxcel.in>"
```

---

## 6. GA4 Admin Key Events Checklist

In Google Analytics (`G-CMYNTTNT56`):
1. Go to **Admin** > **Data display** > **Events**.
2. Mark the following active Step 2 events as **Key Events**:
   - `sign_up` (Primary Key Event)
   - `apply_job_click` (Key Event)
   - `resume_generated` (Key Event)
3. Note: `claim_passport` should be marked only once Step 4 (Public Conversion CTAs) is deployed.
