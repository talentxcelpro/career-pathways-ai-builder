# Unified Notification Intelligence, Real-Time Activity & Delivery Engine
## Comprehensive Repository, Architecture & Production Audit Report (Phase 0)

**Mission ID:** TXC-NOTIFICATIONS-001  
**Platform:** https://talentxcel.in  
**Audit Date:** 2026-11-03  
**Auditor:** Antigravity Autonomous Engineering Agent  
**Branch:** `feat/notifications-unified-engine`  
**Classification:** P0 — Platform-Wide Infrastructure Certification

---

## 1. Executive Summary

A comprehensive architectural, database, backend, real-time, push notification, and frontend audit of the TalentXcel repository (`talentxcel-local`) was conducted. 

### Key Audit Findings:
1. **Broken Event Pipeline:** The notification pipeline is broken at the event origination layer. Business events across professional networking, job applications, messaging, social interactions, and company updates mutate primary domain tables (`connections`, `post_likes`, `post_comments`, `job_applications`, `messages`, `companies`) but **do not generate in-app notifications, database triggers, or outbox delivery records**.
2. **Database Schema Regressions & Fragmented Tables:**
   - In migration `20250930120941_dc8cd043-1107-46ff-8beb-efc469ebdc69.sql`, a destructive cleanup script dropped `notifications`, `notification_preferences`, `push_notifications`, and `push_subscriptions` with `CASCADE`.
   - In migration `20250930122510_07ae434b-2ded-443b-907a-8146730ef740.sql`, a bare-bones `notifications` table was recreated, but without `actor_id`, `data` (JSONB payload), `expires_at`, `idempotency_key`, `category`, or `entity_type`.
   - `notification_preferences` was **never recreated**, causing all preferences hooks and UI panels (`useComprehensivePushNotifications.ts`, `ComprehensiveNotificationSettings.tsx`) to query non-existent tables or fail silently.
   - Push tokens are fragmented across 3 conflicting tables with divergent schemas: `user_push_tokens`, `push_tokens`, and `push_notification_tokens`.
3. **Security & RLS Vulnerabilities:**
   - `public.notifications` has an insecure RLS policy: `CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);` allowing any authenticated or unauthenticated client to spoof notifications to any user ID.
   - There is **no DELETE policy** on `public.notifications`, causing client-side deletion mutations (`deleteNotification`) to fail silently.
4. **Realtime Disconnection:**
   - `public.notifications` is **not added to the `supabase_realtime` publication** in the active database schema, and `REPLICA IDENTITY FULL` is missing. Postgres changes on `notifications` are not broadcast to connected browser websockets.
5. **Simulated / Mock Push Notification Engine:**
   - Edge Function `send-push-notification/index.ts` logs mock strings (`console.log('Would send web push...')`, `console.log('Would send mobile push...')`) and increments sent counts without contacting FCM v1 or Web Push VAPID endpoints.
   - In the frontend, `public/sw.js` is a kill-switch that calls `self.registration.unregister()` on activation, immediately terminating any service worker registered by `NotificationContext.tsx`.
6. **Frontend State Fragmentation:**
   - Notification state is redundantly implemented across 3 competing stores: `NotificationContext.tsx`, `useNotifications.ts`, and `useNotificationStore.ts`.
   - `AdvancedNotificationDashboard.tsx` displays hardcoded mock analytics (`totalSent: 1247`, `openRate: 68.5%`) rather than querying real telemetry.

---

## 2. Infrastructure Inventory & Topology

### 2.1 Frontend Framework & Component Architecture
- **Framework:** React 18.3.1 + TypeScript + Vite 5.4.1
- **UI System:** Tailwind CSS + Radix UI / Shadcn UI + Lucide React + Sonner Toasts
- **Routing:** React Router DOM v6 (`src/App.tsx`, `src/nav-items.tsx`)
- **State & Data Fetching:** TanStack React Query v5.56.2 + Zustand v4.5.5 + Context API
- **Mobile Runtime:** Capacitor 7.4.3 (`@capacitor/core`, `@capacitor/push-notifications`, `@capacitor/android`, `@capacitor/ios`)

### 2.2 Supabase Infrastructure
- **Supabase JS:** `2.58.0`
- **Client Factory:** `src/integrations/supabase/client.ts` with `crossSubdomainStorage` PKCE session persistence and `usageGuardFetch`.
- **Database:** PostgreSQL on Supabase (`dthlgsnakhoftinssokm.supabase.co`).
- **Edge Functions:** 56 functions under `supabase/functions/`, including `send-push-notification`, `register-push-token`, `send-email-notification`, `process-email-queue`, and `notify-joining-bonus`.

---

## 3. Evidence-Based Feature Matrix

| Feature | UI Surface | Backend Event Trigger | Database Table | Supabase Realtime | Push Delivery | Result |
|---|---|---|---|---|---|---|
| **Connection Request** | `useConnectionRequests.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Connection Accepted** | `useConnectionRequests.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **New Job Published** | `useJobPublisher.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Job Matched** | `JobAlertsManager.tsx` | **FAIL** (No matcher worker) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **New Company Followed** | `useCompanyFollow.ts` | **FAIL** (Trigger dropped) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Company Verified** | `useCompaniesManagement.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Post Liked** | `useInstantInteractions.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Post Commented** | `useInstantInteractions.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Comment Replied** | `useInstantInteractions.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Direct Messaging** | `ExecutiveMessenger.tsx` | **FAIL** (Only broadcast) | **FAIL** (No notification written) | **FAIL** (No notification record) | **FAIL** (Mock only) | **FAIL** |
| **Application Submitted** | `useJobApplications.ts` | **FAIL** (Only external email) | **FAIL** (No applicant/employer notif) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |
| **Application Status Change** | `useJobApplications.ts` | **FAIL** (None) | **FAIL** (No notification written) | **FAIL** (Not streaming) | **FAIL** (Mock only) | **FAIL** |

---

## 4. Root Cause Analysis for Failures

### Failure 1: Connection Request & Acceptance Workflows
1. **Exact Feature:** Professional networking connection requests and approvals.
2. **Expected Behaviour:** When User A sends a connection request to User B, User B immediately receives a `CONNECTION_REQUEST_RECEIVED` notification with badge counter increment, realtime toast, and deep link to `/network/requests`. When User B accepts, User A receives `CONNECTION_REQUEST_ACCEPTED` with a link to User B's profile.
3. **Actual Observed Behaviour:** The record is inserted into `public.connections`, but zero notifications are generated in `public.notifications`. Recipient's bell badge remains `0`.
4. **Root Cause:** In migration `20250727194342-2021e150-acb9-40c5-91b3-09f325b40b04.sql`, `notify_connection_trigger` called `public.create_notification`. In subsequent migrations (`20250904` and `20250930`), `create_notification` and trigger definitions were dropped with `CASCADE`. In `useConnectionRequests.ts`, no event dispatch exists.
5. **Relevant Files:** `src/hooks/useConnectionRequests.ts`, `src/hooks/useInstantInteractions.ts`, `supabase/migrations/20250727194342-2021e150-acb9-40c5-91b3-09f325b40b04.sql`.
6. **Severity:** P0.
7. **Proposed Remediation:** Implement automated PostgreSQL trigger `trg_connections_notification_event` calling a secure event outbox dispatcher, plus a centralized TypeScript event delivery service.
8. **Verification Test:** Create two test accounts, initiate a connection request, assert a row in `notifications` with `user_id = recipient_id`, verify badge updates via Realtime without page refresh.

### Failure 2: Post Likes, Comments, and Replies
1. **Exact Feature:** Social feed engagement notifications.
2. **Expected Behaviour:** When a user likes or comments on a post, the post author receives `POST_LIKED` or `POST_COMMENTED`. When someone replies to a comment, the parent comment author receives `COMMENT_REPLIED`.
3. **Actual Observed Behaviour:** `useInstantInteractions.ts` writes directly to `post_likes` and `post_comments`. No notifications are written. Post author is unaware of any engagement.
4. **Root Cause:** No database triggers exist on `post_likes` or `post_comments`. No backend event queue exists.
5. **Relevant Files:** `src/hooks/useInstantInteractions.ts`, `src/hooks/useLinkedInFeed.ts`.
6. **Severity:** P0.
7. **Proposed Remediation:** Add database triggers on `post_likes` and `post_comments` to dispatch `POST_LIKED`, `POST_COMMENTED`, and `COMMENT_REPLIED` with actor suppression (do not notify self-likes/self-comments) and idempotency keys to prevent duplicate notifications on rapid like/unlike toggles.
8. **Verification Test:** Insert a like from Account B on a post by Account A; assert exactly 1 notification for Account A; unlike and re-like; verify idempotency deduplication.

### Failure 3: Job Application Lifecycle Notifications
1. **Exact Feature:** Candidate job applications and employer status updates.
2. **Expected Behaviour:** 
   - Upon candidate applying: Candidate receives `APPLICATION_SUBMITTED`; employer/recruiter receives `JOB_APPLICATION_RECEIVED`.
   - Upon employer updating status (viewed, shortlisted, rejected, interview scheduled): Candidate receives corresponding application state notification.
3. **Actual Observed Behaviour:** In `useJobApplications.ts`, only the candidate record is saved to `job_applications`, followed by an edge function call `forward-application-to-publisher` (which only emails external publishers). No platform in-app notification is created for either applicant or employer.
4. **Root Cause:** Lack of backend application notification triggers and absence of recruiter notification dispatcher.
5. **Relevant Files:** `src/hooks/useJobApplications.ts`, `src/hooks/useApplicationIntelligence.ts`.
6. **Severity:** P0.
7. **Proposed Remediation:** Add triggers on `job_applications` for `INSERT` and `UPDATE` on `status`, generating notifications with deep links to `/jobs/applications` and recruiter candidate review consoles.
8. **Verification Test:** Submit application; verify applicant and recruiter both receive appropriate notification records with correct deep links.

### Failure 4: Direct Messaging Notifications
1. **Exact Feature:** Direct messaging between platform members.
2. **Expected Behaviour:** When User A sends a message to User B, User B receives a `MESSAGE_RECEIVED` notification if they are not active in that exact conversation, updating unread counts and firing push notifications.
3. **Actual Observed Behaviour:** `ExecutiveMessenger.tsx` sends a temporary broadcast on `talentxcel-global-broadcast-v1` and inserts into `messages`. If the recipient is on any other page or offline, no notification is persisted, badge remains `0`, and no push notification is delivered.
4. **Root Cause:** Missing trigger on `messages` table to bridge incoming messages to `notifications`.
5. **Relevant Files:** `src/components/network/ExecutiveMessenger.tsx`, `src/hooks/useConversations.ts`.
6. **Severity:** P0.
7. **Proposed Remediation:** Implement message event trigger on `messages` table checking recipient presence and user notification preferences, inserting into `notifications` with deep link `/messages/:conversationId`.
8. **Verification Test:** Send message from User A to User B; navigate away from chat on User B's session; assert notification bell badge displays unread message count and clicking navigates directly to the conversation.

### Failure 5: Push Notification Delivery Simulation & Service Worker Kill-Switch
1. **Exact Feature:** Web push and mobile push notification delivery.
2. **Expected Behaviour:** Device registers token; backend sends payload through Web Push (VAPID) or FCM v1; device receives notification in foreground/background.
3. **Actual Observed Behaviour:** 
   - `send-push-notification/index.ts` has dummy `console.log('Would send web push...')` and `console.log('Would send mobile push...')`.
   - `public/sw.js` is a kill switch that calls `self.registration.unregister()` and wipes cache, killing any Web Push worker.
   - Three push token tables exist: `user_push_tokens`, `push_tokens`, and `push_notification_tokens`.
4. **Root Cause:** Incomplete transition from proof-of-concept push code to production-grade provider delivery architecture.
5. **Relevant Files:** `supabase/functions/send-push-notification/index.ts`, `supabase/functions/register-push-token/index.ts`, `public/sw.js`, `public/sw-notifications.js`, `src/contexts/NotificationContext.tsx`.
6. **Severity:** P0.
7. **Proposed Remediation:**
   - Consolidate push token schema into `public.notification_devices` with active status, provider, token, and platform metadata.
   - Update `send-push-notification` Edge function to perform real Web Push delivery with VAPID signing and FCM HTTP v1 delivery.
   - Replace `/sw.js` with active notification service worker supporting background push, click actions, and offline caching.
8. **Verification Test:** Register device token; dispatch push notification; verify receipt, action click navigation, and delivery log entry.

### Failure 6: Security and RLS Permissions
1. **Exact Feature:** Notification privacy and spoofing prevention.
2. **Expected Behaviour:** Users can read and update only their own notifications. Notifications can only be created by trusted system triggers or secure backend services with service-role privileges. Users can dismiss/delete their own notifications.
3. **Actual Observed Behaviour:**
   - `CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);` allows any client to insert arbitrary notifications for any user.
   - No `DELETE` policy exists on `public.notifications`, preventing users from deleting notifications.
4. **Root Cause:** Flawed RLS policy definition in migration `20250930122510_07ae434b-2ded-443b-907a-8146730ef740.sql`.
5. **Severity:** P0 (Security).
6. **Proposed Remediation:**
   - Drop insecure `INSERT WITH CHECK (true)` policy.
   - Restrict `INSERT` to `SECURITY DEFINER` database triggers/functions or service-role edge functions.
   - Add `DELETE` policy: `CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);`
8. **Verification Test:** Attempt unprivileged INSERT from client A with `user_id = B` (must fail with 42501 RLS error); execute DELETE on owned notification (must succeed).

### Failure 7: Dropped Preferences Table & Fragmented Frontend Stores
1. **Exact Feature:** User notification preferences & unified notification center state.
2. **Expected Behaviour:** User preferences (channels, categories, quiet hours) are saved in `notification_preferences`. All notification bell, badge, center, and filter components observe a single source of truth.
3. **Actual Observed Behaviour:**
   - `notification_preferences` table does not exist in DB (dropped in `20250930120941`).
   - Three different notification stores operate concurrently without synchronized state (`NotificationContext`, `useNotifications`, `useNotificationStore`).
   - `AdvancedNotificationDashboard.tsx` uses mock data.
4. **Root Cause:** Premature schema drop and lack of unified state management pattern.
5. **Relevant Files:** `src/contexts/NotificationContext.tsx`, `src/hooks/useNotifications.ts`, `src/stores/useNotificationStore.ts`, `src/components/notifications/AdvancedNotificationDashboard.tsx`.
6. **Severity:** P1.
7. **Proposed Remediation:**
   - Recreate `public.notification_preferences` with category, channel, quiet hours, and frequency settings, seeded on user signup.
   - Unify frontend notification state into a single authoritative `NotificationContext` + React Query architecture.
   - Wire `AdvancedNotificationDashboard.tsx` to read real telemetry from `notification_delivery_logs`.
8. **Verification Test:** Toggle a preference setting; verify persistence; trigger notification matching disabled category; assert notification is filtered out according to preference.

---

## 5. Architectural Blueprint for Phase 1-4 Implementation

```mermaid
flowchart TD
    subgraph Client Surfaces
        A[User Activity: Connect, Apply, Like, Comment, Message, Job]
        NB[Notification Bell & Unread Badge]
        NC[Notification Center & Page]
        NS[Notification Settings & Preferences]
        AdminD[Admin Notification Operations Dashboard]
    end

    subgraph Data & Event Layer
        T_CONN[(connections)]
        T_POST[(post_likes / post_comments)]
        T_APP[(job_applications)]
        T_MSG[(messages)]
        T_JOB[(jobs)]
        T_COMP[(companies / company_follows)]
        
        TRIGGERS[SECURITY DEFINER Postgres Triggers]
        DISPATCH[public.dispatch_notification_event]
        
        T_NOTIF[(public.notifications)]
        T_PREF[(public.notification_preferences)]
        T_DEV[(public.notification_devices)]
        T_LOG[(public.notification_delivery_logs)]
    end

    subgraph Delivery & Realtime Engine
        RT_PUB[Supabase Realtime Publication]
        EDGE_PUSH[Edge Function: send-push-notification]
        FCM[Firebase Cloud Messaging v1 / Web Push]
        SW[Service Worker: sw-notifications.js]
    end

    A -->|Business Mutation| T_CONN & T_POST & T_APP & T_MSG & T_JOB & T_COMP
    T_CONN & T_POST & T_APP & T_MSG & T_JOB & T_COMP -->|Database Trigger| TRIGGERS
    TRIGGERS --> DISPATCH
    DISPATCH -->|Check Preferences & Deduplicate| T_PREF
    DISPATCH -->|Persist Notification| T_NOTIF
    DISPATCH -->|Log Delivery Attempt| T_LOG
    
    T_NOTIF -->|Realtime Stream| RT_PUB
    RT_PUB -->|Websocket Delta| NB & NC
    
    DISPATCH -->|Invoke Push Worker| EDGE_PUSH
    EDGE_PUSH -->|Query Active Tokens| T_DEV
    EDGE_PUSH -->|Deliver Payload| FCM
    FCM -->|Push Event| SW
    SW -->|Display Notification| Client Surfaces

    NS <-->|Manage Preferences| T_PREF
    AdminD <-->|Monitor & Retry| T_LOG
```

---

## 6. Implementation Phase Plan

1. **Phase 1: Database Migration & Security Hardening**
   - Create idempotent version-controlled migration: `20261103000000_unified_notification_engine.sql`.
   - Update `public.notifications` schema: add `actor_id`, `data`, `entity_type`, `entity_id`, `idempotency_key`, `category`, `delivery_status`.
   - Create `public.notification_preferences`, `public.notification_devices`, `public.notification_delivery_logs`.
   - Implement `public.dispatch_notification_event()` function with permission validation, preference checks, and deduplication.
   - Implement triggers on `connections`, `post_likes`, `post_comments`, `job_applications`, `messages`, `companies`, and `company_follows`.
   - Enable `REPLICA IDENTITY FULL` on `notifications` and add to `supabase_realtime` publication.
   - Enforce rigorous RLS: deny public inserts, allow owner reads/updates/deletes.
   - Provide safe rollback migration: `20261103000000_unified_notification_engine_rollback.sql`.

2. **Phase 2: Push Notification & Service Worker Infrastructure**
   - Upgrade `supabase/functions/send-push-notification/index.ts` with real delivery handling.
   - Upgrade `supabase/functions/register-push-token/index.ts` targeting `notification_devices`.
   - Replace `/sw.js` with active, standards-compliant notification service worker.

3. **Phase 3: Frontend Consolidation & Navigation Wiring**
   - Unify `NotificationContext.tsx` with live unread counter, infinite pagination, category filtering, and audio alerts.
   - Update `NotificationBell.tsx` with instant badge updates and deep-link routing.
   - Connect `ComprehensiveNotificationSettings.tsx` to `notification_preferences`.
   - Connect `AdvancedNotificationDashboard.tsx` to `notification_delivery_logs`.
   - Ensure `/notifications` route is registered and accessible.

4. **Phase 4: Automated Testing & Certification**
   - Verify all 7 core platform workflows end-to-end.
   - Run build and type check.
   - Certify zero regressions and production readiness.
