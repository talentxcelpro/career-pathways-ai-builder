# TalentXcel Android — Complete Platform Audit

**Audit Date:** 2026-09-28  
**Auditor:** Antigravity AI  
**Scope:** Full repository scan before native Android development

---

## Repository Overview

| Property | Value |
|---|---|
| App ID | `in.talentxcel.app` |
| App Name | `TalentXcel Pro` |
| Supabase Project | `dthlgsnakhoftinssokm` |
| Supabase URL | `https://dthlgsnakhoftinssokm.supabase.co` |
| Site URL | `https://talentxcel.in` |
| Frontend Stack | React 18 + Vite + TypeScript + TailwindCSS |
| Mobile Bridge | Capacitor 7 (partially wired) |
| State Management | Zustand + React Query |
| Auth | Supabase Auth (PKCE flow) |

---

## A. Already Implemented

### Authentication System
- ✅ `OptimizedAuthContext` — full session management with PKCE flow
- ✅ `AuthContext` — legacy context (both maintained)
- ✅ `useOptimizedAuth` hook — session, user, signOut, refreshSession
- ✅ `useProductionAuth` hook
- ✅ `useSecureSession` hook
- ✅ `NativeAuthPage` — dedicated auth page for Capacitor/native
- ✅ `OAuthCallback` — Google OAuth handled
- ✅ `NativeForgotPassword` + `NativeResetPassword` — native-specific flows
- ✅ Session persistence via localStorage (must switch to EncryptedSharedPreferences on Android)
- ✅ Auto-refresh tokens enabled

### Supabase Integration
- ✅ Full Supabase JS client (`src/integrations/supabase/client.ts`)
- ✅ Complete TypeScript type definitions auto-generated from schema (`types.ts`)
- ✅ `usageGuardFetch` — custom fetch wrapper for usage tracking
- ✅ Edge functions base URL: `https://dthlgsnakhoftinssokm.supabase.co/functions/v1`
- ✅ Config constants: `src/config/constants.ts` — contains URL + anon key
- ✅ `secureSupabaseClient.ts` — additional secure wrapper

### Jobs System
- ✅ `src/pages/Jobs.tsx`, `JobDetail.tsx`, `MobileJobs.tsx`, `NewJobs.tsx`, `JobsByLocation.tsx`, `JobsByRole.tsx`, `JobsBySkill.tsx`, `GovernmentJobs.tsx`
- ✅ `src/services/jobService.ts`
- ✅ `useRealtimeJobs.ts`, `useMatrixJobs.ts`, `useScrapedJobs.ts`, `useTrustedJobScraper.ts`
- ✅ AI job matching: `ai_job_matches` table in Supabase
- ✅ Job save/bookmark functionality
- ✅ External job tracking: `trackExternalJobClick.ts`
- ✅ Government jobs: `GovernmentJobDetail.tsx`

### Applications System
- ✅ `src/pages/MyApplications.tsx` — applications tracking page
- ✅ Application status tracking (applied, under review, shortlisted, interview, selected, rejected)
- ✅ Employer applications: `src/pages/EmployerApplications.tsx`
- ✅ `useRealTimeATS.ts` — real-time application tracking

### Profile System
- ✅ `src/pages/Profile.tsx`, `TalentXcelProfile.tsx`, `UserProfile.tsx`, `SlugProfile.tsx`
- ✅ `useProfile.ts` hook with Supabase `profiles` table
- ✅ Profile fields: full_name, title, location, email, phone, website, about, headline, profile_picture_url, cover_image_url, linkedin_url, github_url, portfolio_url, talentxcel_id
- ✅ `useProfileCompletion.ts` — profile completion tracking
- ✅ `useProfileUpdate.ts`, `useProfileViews.ts`, `useProfileStats.ts`
- ✅ Public profile (slug-based): `PublicPassportView.tsx`, `SlugProfile.tsx`
- ✅ Resume builder: `src/pages/ResumeBuilder.tsx` + full service layer

### Network System
- ✅ `src/pages/Network.tsx`, `NetworkPage.tsx`
- ✅ `src/pages/network/Messages.tsx`, `People.tsx`
- ✅ `useNetworkData.ts`, `useNetworkManagement.ts`, `useRealtimeConnections.ts`
- ✅ `useNetworkPosts.ts` — network activity feed
- ✅ `useUserFollow.ts` — follow/unfollow functionality
- ✅ QR networking: `QRNetworking.tsx`
- ✅ `useRealtimeNetworkManagement.ts` — live network updates

### Notifications System
- ✅ `src/pages/NotificationsPage.tsx`
- ✅ `useNotifications.ts` — full notification CRUD with Supabase `notifications` table
- ✅ Notification model: id, user_id, module, type, title, message, link, is_read, priority, sound, created_at, expires_at
- ✅ Notification modules: network, jobs, resume, tools, companies, learning, career_map, employer
- ✅ `useNotificationPreferences.ts` — user-controlled preferences
- ✅ `useNotificationPersonalization.ts`
- ✅ `useSmartNotifications.ts`
- ✅ `useTaskNotifications.ts`

### Push Notifications (Capacitor)
- ✅ `@capacitor/push-notifications` installed and configured
- ✅ `usePushNotifications.ts` — full implementation:
  - Permission request
  - Native push registration (`PushNotifications.register()`)
  - Registration token listener
  - Push received listener
  - Push action performed listener
  - Token registration with Supabase edge function `register-push-token`
- ✅ Edge function `send-push-notification` exists
- ✅ Edge function `register-push-token` exists
- ✅ Web push (VAPID) partially implemented (hardcoded test key — needs real key)

### Capacitor / Mobile Bridge
- ✅ `capacitor.config.ts` — configured:
  - appId: `in.talentxcel.app`
  - appName: `TalentXcel Pro`
  - androidScheme: `https`
  - PushNotifications plugin
  - Camera plugin
- ✅ `@capacitor/core@7.4.3`
- ✅ `@capacitor/android@7.4.3`
- ✅ `@capacitor/ios@7.4.3`
- ✅ `@capacitor/camera@7.0.2`
- ✅ `@capacitor/filesystem@7.1.4`
- ✅ `@capacitor/push-notifications@7.0.2`
- ✅ `src/NativeApp.tsx` — dedicated native app entry with `HashRouter`
- ✅ `src/components/MobileAppInitializer.tsx` — native platform detection
- ✅ `PageSpecificBottomNav` — bottom navigation for native
- ✅ Android folder at `/android/app/src/main/res/values-v27/styles.xml` — partial Capacitor-generated project with Material3 theme

### Career / AI Features
- ✅ `src/pages/AICareerIntelligence.tsx`, `AICareerHub.tsx`
- ✅ `ai_career_recommendations` table in Supabase
- ✅ `useRealCareerData.ts`, `useOptimizedCareerData.ts`
- ✅ Edge functions: `passport-ai-coach`, `ai-chat`, `ai-tools`
- ✅ Career map: `src/pages/CareerMap.tsx`, `CareerDashboard.tsx`
- ✅ Career passport: `src/pages/passport/CareerPassportDashboard.tsx`

### Design / Branding
- ✅ Tailwind design system with custom colors
- ✅ Logo assets: `talentxcel-logo.png`, `talentxcel-logo.webp`
- ✅ Mascot: `txc-mascot.jpg`, `career-mascot.jpg`
- ✅ Radix UI + shadcn/ui component library (50+ components)
- ✅ `next-themes` — dark/light mode support
- ✅ Framer Motion animations

### Analytics
- ✅ Vercel Analytics + Speed Insights integrated
- ✅ `analyticsService.ts`
- ✅ `usePageTracking.ts`
- ✅ Multiple tracking hooks: `useVideoViewTracking.ts`, `useProfileViews.ts`, etc.

### Offline / Caching
- ✅ `useOfflineSync.ts` — offline sync infrastructure
- ✅ `useOnlineStatus.ts`
- ✅ `serviceWorkerRegistration.ts` + PWA setup
- ✅ `optimizedStorage.ts`, `storageMonitor.ts`
- ✅ `useRedisCache.ts`, `useUpstashCache.ts` — Redis caching via Upstash

### Supabase Edge Functions (56 total)
Key functions relevant to Android:
- `register-push-token` — register FCM/APNS token
- `send-push-notification` — dispatch push notifications
- `ai-chat` — AI career coach conversations
- `ai-resume-parser` — resume parsing
- `enhance-resume` — AI resume enhancement
- `compute-talent-score` — talent scoring
- `passport-ai-coach` — career passport AI
- `health-check` — backend health
- `gemini-ai` — Gemini AI integration
- `notify-joining-bonus` — notification triggers
- `send-email-notification` — email notifications

---

## B. Partially Implemented

### Android Native Project
- ⚠️ `/android/` folder exists but contains ONLY `app/src/main/res/values-v27/styles.xml` — the Material3 `AppTheme.IncomingCall` style
- ⚠️ No `AndroidManifest.xml`, no `build.gradle`, no Kotlin source files — this is an incomplete Capacitor sync
- ⚠️ The project was likely created by `npx cap add android` but sync was not fully completed
- ⚠️ No `google-services.json` for Firebase
- ⚠️ No deep-link / App Links configuration in the existing Android folder

### Push Notifications
- ⚠️ `usePushNotifications.ts` is complete for Capacitor, but:
  - VAPID key is a placeholder/test key
  - FCM is used through Capacitor's abstraction — no native Firebase SDK directly
  - No deep-link routing when notification is tapped on Android
  - `pushNotificationActionPerformed` listener is a console.log stub

### Authentication on Native
- ⚠️ `NativeAuthPage` exists but uses web localStorage for session storage
- ⚠️ Google OAuth redirect may not work correctly in native Android without Intent handling
- ⚠️ PKCE flow may need adjustment for native deep links

### Bottom Navigation
- ⚠️ `PageSpecificBottomNav` exists as a React/web component — works as a WebView overlay
- ⚠️ Not a native Android BottomNavigationView

### Deep Links
- ⚠️ No `assetlinks.json` configured for Android App Links
- ⚠️ No intent filters in AndroidManifest for App Links
- ⚠️ `src/utils/urlHelpers.ts` exists but no native deep-link routing

### Install Banner
- ⚠️ `src/components/install/` directory exists
- ⚠️ `src/components/pwa/` directory exists
- ⚠️ No smart Android-specific install CTA or Play Store link yet

---

## C. Available Through Existing Backend

All of the following are immediately consumable by the Android app via Supabase REST/Realtime:

### Database Tables (confirmed in types.ts)
- `profiles` — user profiles
- `jobs` / job-related tables
- `notifications` — full notification system
- `ai_career_recommendations` — career AI recommendations
- `ai_job_matches` — job match scores
- `ai_chat_messages`, `ai_chat_sessions` — AI chat
- `ai_resumes`, `ai_cover_letters` — resume/cover letter
- `assessment_attempts`, `assessment_questions`, `assessment_categories` — skill assessments
- `admin_activity_log` — audit log

### Edge Functions (API layer)
All 56 edge functions are accessible from the Android client using the same Supabase anon key.

### Authentication
- Email + password login: ready
- PKCE OAuth (Google): ready with redirect URL configuration
- Session refresh: ready
- Token storage: needs native secure storage adaptation

### Realtime
- Supabase Realtime subscriptions: ready for jobs, notifications, network activity

---

## D. Missing (Must Build for Android)

### Native Android Project
- ❌ `build.gradle.kts` (project + app level)
- ❌ `settings.gradle.kts`
- ❌ `AndroidManifest.xml` with correct permissions, deep links, FCM
- ❌ Kotlin source files
- ❌ Jetpack Compose UI layer
- ❌ Navigation Compose graph
- ❌ Material 3 theme with TalentXcel branding
- ❌ ViewModel + StateFlow architecture
- ❌ Repository pattern for all data domains

### Firebase
- ❌ Firebase project setup (or confirm existing one)
- ❌ `google-services.json`
- ❌ Firebase Cloud Messaging (native, not via Capacitor)
- ❌ Firebase Crashlytics
- ❌ Firebase Analytics

### Android App Links
- ❌ `/.well-known/assetlinks.json` on talentxcel.in
- ❌ Intent filters in `AndroidManifest.xml`
- ❌ Deep-link navigation handler in Android app

### Secure Storage
- ❌ `EncryptedSharedPreferences` for auth tokens
- ❌ Keystore for sensitive credentials

### Native Design System
- ❌ TalentXcel Material 3 theme (Kotlin/Compose)
- ❌ Native typography scale
- ❌ Native color palette
- ❌ Native component library (JobCard, ProfileCard, NotificationItem, etc.)

### Offline/Cache Layer
- ❌ Room database for local caching
- ❌ WorkManager for background sync
- ❌ Offline-first data strategy

---

## E. Needs Refactoring

### Auth Storage
- `usePushNotifications.ts` → `registerPushToken` needs to handle token refresh/update, not just first registration
- Session handling in `OptimizedAuthContext` uses `window.localStorage` — needs platform abstraction

### Supabase Client Configuration
- Anon key is hardcoded in `src/config/constants.ts` — acceptable for web anon key, but Android must keep it in `BuildConfig` and never commit signing keys

### Notification Deep Links
- `useNotifications.ts` stores `link` field as a string path — Android needs to parse this into a deep-link destination

### VAPID Key
- `usePushNotifications.ts` line ~65: hardcoded placeholder VAPID key must be replaced with real key for web push to work

---

## F. Should NOT Be Changed

| Item | Reason |
|---|---|
| `src/integrations/supabase/client.ts` | Production Supabase client — any change breaks web app |
| `src/integrations/supabase/types.ts` | Auto-generated from schema — do not edit manually |
| `src/config/constants.ts` | App-wide config — reading is fine, do not alter values |
| All Supabase migrations in `/supabase/migrations/` | Production schema — never alter without explicit approval |
| All existing SEO pages/routes | Production SEO — do not modify URL structure |
| `capacitor.config.ts` | Capacitor config — changes affect both web and native |
| All production edge functions | Live serverless functions — do not modify |
| `vercel.json` | Deployment config — do not touch |
| `.env` / `.env.local` | Production secrets — do not commit additional secrets |
| `public/` directory | Static assets + sitemap + robots.txt — do not alter SEO files |

---

## Reusable Code for Android

| Web Asset | Android Equivalent | Notes |
|---|---|---|
| `useProfile.ts` profile type | `Profile` data class | Direct mapping |
| `useNotifications.ts` Notification interface | `Notification` data class | Direct mapping |
| `Supabase URL + anon key` | `BuildConfig.SUPABASE_URL` | Same credentials |
| Job types in `src/types/jobs/` | `Job` data class | Map fields directly |
| `notifications` table schema | Room entity | Can mirror columns |
| Edge function names | `SupabaseService.kt` | Same function names |
| Auth flow (PKCE) | `GoTrue` Supabase Android SDK | Same flow |
| `APP_CONFIG.SITE_URL` | `BuildConfig.SITE_URL` | For deep links |

---

## Existing Android Folder Assessment

**Location:** `/android/app/src/main/res/values-v27/styles.xml`  
**Content:** Single Material3 theme file `AppTheme.IncomingCall`  
**Assessment:** This is a stub from an incomplete Capacitor `cap sync android` run. It contains:
- Correct `appId` base
- Material3 DayNight theme
- Background color `#050A14` (dark — inconsistent with light-mode web app)

**Decision:** Preserve this file. The new native Android project will be created at `/apps/talentxcel-android/` as a proper standalone Gradle project. The `/android/` Capacitor folder remains untouched for the existing web+Capacitor architecture.

---

## Backend Requirements for Android

### Required (exists):
- Supabase REST API for all tables
- Supabase Auth for login/signup
- Edge function `register-push-token`
- Edge function `send-push-notification`
- Edge function `ai-chat`
- Realtime subscriptions on `notifications`

### Required (needs setup):
- Firebase project linked to `in.talentxcel.app`
- `google-services.json` for FCM
- VAPID key replacement for web push
- `assetlinks.json` published at `https://talentxcel.in/.well-known/assetlinks.json`

### Optional / V2:
- Edge function for AI career coach streaming
- Dedicated Android analytics endpoint

---

## Summary Statistics

| Category | Count |
|---|---|
| Source directories in `/src` | 20+ top-level |
| React components | 300+ |
| React hooks | 200+ |
| Supabase edge functions | 56 |
| Pages/routes | 130+ |
| Database migrations | 100+ |
| TypeScript types | Full auto-generated schema |
| Existing Capacitor plugins | 5 (core, android, ios, camera, push-notifications, filesystem) |
| Existing Android files | 1 (styles.xml) |
| Existing native Kotlin code | 0 |
