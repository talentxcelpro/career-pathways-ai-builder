# TALENTXCEL.IN — FUNCTIONAL JOURNEY INVENTORY

**Document ID:** TX-JOURNEYS-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Scope:** Complete End-to-End User Journeys (Job Seeker, Employer, Administrator, Platform Modules)

---

## 1. JOURNEY AUDIT STANDARDS & CLASSIFICATION

Every functional journey has been inspected across frontend UI components, client-side hooks, serverless/edge APIs, database tables, and RLS policies.

### Implementation Status Legend
- **Verified:** Fully operational in code; frontend forms connect to valid endpoints/RPCs with database integrity checks.
- **Partially Verified:** Component and API exist, but edge function has demo/mock fallbacks or unverified external dependencies.
- **Broken / Missing Edge:** Route and UI exist, but trigger calls to non-existent backend functions or broken endpoints.
- **Vulnerable:** Functional in runtime, but bypasses cryptographic or server-side security checks.
- **UI Only:** Visual interface rendered with static data; actions do not mutate the persistent database.

---

## 2. A. JOB SEEKER JOURNEYS (1 TO 22)

| # | Journey | URL | User Type | Components | APIs & Functions | Database Tables / RPCs | Authentication | Expected Outcome | Actual Status | Dependencies & Notes | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Homepage & Landing** | `/` | Guest | `Index.tsx`, `Hero.tsx`, `FeaturedJobs.tsx` | Supabase JS client | `jobs`, `companies` | None | Browse platform value prop, live jobs, and CTAs | **Verified** | Reads public jobs via RLS | `src/pages/Index.tsx` |
| 2 | **Registration** | `/auth/register` | Guest | `Register.tsx`, `AuthLayout.tsx` | `supabase.auth.signUp()` | `auth.users`, `public.profiles` (via trigger `on_auth_user_created`) | None | New user created; email verification sent | **Verified** | PKCE flow with auto-profile trigger | `src/pages/auth/Register.tsx` |
| 3 | **Login & Logout** | `/auth/login` | Guest / Authenticated | `Login.tsx`, `Navbar.tsx` | `supabase.auth.signInWithPassword()`, `signOut()` | `auth.users`, `sessions` | Public / Session | Authenticate user; clear cookies on logout | **Verified** | Cross-subdomain session cookie `.talentxcel.in` | `src/pages/auth/Login.tsx` |
| 4 | **Profile Creation** | `/onboarding` | New Job Seeker | `OnboardingFlow.tsx`, `StepIndicator.tsx` | Supabase JS client | `profiles`, `user_skills`, `user_experience` | User Session | Multi-step capture of skills, education, experience | **Verified** | Guided 4-step wizard | `src/pages/auth/OnboardingFlow.tsx` |
| 5 | **Profile Editing** | `/profile` | Job Seeker | `ProfileLayout.tsx`, `ProfileHeader.tsx`, `SkillsSection.tsx` | Supabase JS client | `profiles`, `user_skills`, `user_education` | User Session (auth.uid = id) | Updates candidate bio, contact, and skills | **Verified** | Strict RLS: `auth.uid() = id` | `src/components/profile/ProfileLayout.tsx` |
| 6 | **Resume Builder** | `/resume/builder` | Job Seeker | `ModernResumeBuilder.tsx`, `ResumePreview.tsx` | Supabase JS client | `resumes`, `resume_sections` | User Session | Interactive live resume editing with templates | **Verified** | Renders HTML & PDF preview | `src/pages/resume/ModernResumeBuilder.tsx` |
| 7 | **Resume Upload & Download** | `/resume` | Job Seeker | `ResumeUploadZone.tsx`, `ResumeDownloadModal.tsx` | `supabase.storage.from('resumes')`, `razorpay-create-oneoff` | `storage.objects`, `resumes`, `resume_downloads` | User Session | Uploads PDF; downloads rendered resume | **Broken / Missing Edge** | First download works; paid download calls missing Edge Fn `razorpay-create-oneoff` | `src/hooks/useResumeDownloads.ts:38` |
| 8 | **ATS Resume Analysis** | `/resume/ats-analyzer` | Job Seeker | `ATSAnalyzer.tsx`, `ATSScoreCard.tsx` | Edge Fn: `comprehensive-ats-analyzer`, `ats-analyzer` | `resumes`, `ats_analysis_results` | User Session | Calculates keyword density, formatting, & ATS score | **Partially Verified** | Relies on `LOVABLE_API_KEY` in Supabase Secrets | `supabase/functions/comprehensive-ats-analyzer/index.ts` |
| 9 | **AI Resume Writing** | `/resume/ai-optimizer` | Job Seeker | `AIOptimizer.tsx`, `AISectionEnhancer.tsx` | Edge Fn: `enhance-resume`, `enhance-section` | `resumes` | User Session | Generates impact bullet points & summary | **Partially Verified** | Calls Lovable/Gemini gateway; fallback heuristic | `supabase/functions/enhance-resume/index.ts` |
| 10| **LinkedIn Optimization**| `/resume/linkedin` | Job Seeker | `LinkedInOptimizer.tsx`, `HeadlineGenerator.tsx` | Edge Fn: `gemini-ai` | `profiles`, `ai_usage_tracking` | User Session | Generates viral headline & 'About' section | **Partially Verified** | Has fallback response if `GEMINI_API_KEY` missing | `supabase/functions/gemini-ai/index.ts:35` |
| 11| **Naukri Optimization** | `/resume/naukri` | Job Seeker | `NaukriOptimizer.tsx` | Edge Fn: `gemini-ai` | `profiles` | User Session | Tailors keywords for Naukri recruiter search | **Partially Verified** | Prompt template in Edge Function | `src/pages/resume/NaukriOptimizer.tsx` |
| 12| **Job Discovery & Search**| `/jobs` | Public / Candidate | `Jobs.tsx`, `JobFilterSidebar.tsx`, `JobCard.tsx` | Supabase JS client | `jobs`, `companies` | Public | Real-time faceted search (role, salary, city) | **Verified** | Filter by remote, walk-in, salary range | `src/pages/Jobs.tsx` |
| 13| **Job Recommendations** | `/dashboard` | Job Seeker | `RecommendedJobs.tsx` | RPC: `get_recommended_jobs` | `jobs`, `user_skills`, `profiles` | User Session | Algorithmic matching based on candidate skills | **Verified** | Vector/skill overlap query | `src/components/dashboard/RecommendedJobs.tsx` |
| 14| **Job Matching Score** | `/job/:jobId` | Job Seeker | `JobMatchBadge.tsx` | RPC: `calculate_job_skill_match` | `jobs`, `user_skills` | User Session | Displays % compatibility against job requirements | **Verified** | Stored procedure calculation | `src/components/jobs/JobMatchBadge.tsx` |
| 15| **Job Detail Page** | `/job/:jobId` | Public / Candidate | `JobDetails.tsx`, `JobHeader.tsx` | Supabase JS client | `jobs`, `companies` | Public | Full description, salary range, company info | **Verified** | Injects Schema.org `JobPosting` structured data | `src/pages/JobDetails.tsx` |
| 16| **Job Application** | `/job/:jobId` | Candidate / Guest | `ApplyJobModal.tsx`, `SupportingDocumentsForm.tsx` | `POST /api/jobs/apply` | `job_applications`, `cv_files`, `storage.objects` | Session or Auto-Provision | Submits CV, phone, cover note; provisions account | **Verified** | Serverless function validates job & uploads resume | `api/jobs/apply.ts` |
| 17| **Application Status** | `/applications` | Job Seeker | `ApplicationTrackerPage.tsx`, `ApplicationCard.tsx` | Supabase JS client | `job_applications`, `jobs`, `companies` | User Session | Shows review status: applied, shortlisted, rejected | **Verified** | RLS: `auth.uid() = user_id` | `src/pages/ApplicationTrackerPage.tsx` |
| 18| **Notifications** | `/notifications` | Job Seeker | `NotificationsPage.tsx`, `NotificationItem.tsx` | Supabase JS client | `notifications` | User Session | In-app alerts on application updates & recruiter views | **Verified** | Realtime subscription supported | `src/pages/NotificationsPage.tsx` |
| 19| **Saved Jobs** | `/saved-jobs` | Job Seeker | `SavedJobs.tsx` | Supabase JS client | `saved_jobs`, `jobs` | User Session | Bookmark jobs for later application | **Verified** | Toggle bookmark status | `src/pages/SavedJobs.tsx` |
| 20| **User Dashboard** | `/dashboard` | Job Seeker | `Dashboard.tsx`, `ProfileStrengthCard.tsx` | Supabase JS client | `profiles`, `job_applications`, `career_passports` | User Session | Unified overview of applications, score, & activity | **Verified** | Real-time metrics rollup | `src/pages/Dashboard.tsx` |
| 21| **Subscription Management**| `/pro` | Job Seeker | `ProOverview.tsx`, `PricingPlans.tsx` | Edge Fn: `razorpay-create-order`, `razorpay-verify-payment` | `subscribers`, `subscription_history` | User Session | Upgrade to Pro; Razorpay checkout | **Partially Verified** | Activates demo order if Razorpay key missing | `supabase/functions/razorpay-create-order/index.ts:75` |
| 22| **Support & Contact** | `/contact` | Public / Job Seeker | `ContactUs.tsx`, `SupportForm.tsx` | Supabase JS client | `contact_requests` | None / User | Submit support tickets and enquiries | **Verified** | Stores request and triggers email notification | `src/pages/ContactUs.tsx` |

---

## 3. B. EMPLOYER AND RECRUITER JOURNEYS (1 TO 14)

| # | Journey | URL | User Type | Components | APIs & Functions | Database Tables / RPCs | Authentication | Expected Outcome | Actual Status | Dependencies & Notes | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Employer Registration** | `/recruiters` | Employer Guest | `RecruiterRegistrationDialog.tsx` | Supabase JS client | `employer_requests`, `companies` | None | Submit company details & recruiter request | **Verified** | Pending admin KYC approval | `src/components/employer/RecruiterRegistrationDialog.tsx` |
| 2 | **Employer Auth** | `/auth/login` | Employer | `Login.tsx` | `supabase.auth.signInWithPassword()` | `auth.users`, `company_team_members` | Public | Authenticate and resolve employer role | **Verified** | Checks active company team membership | `src/navigation/employerRoutes.tsx` |
| 3 | **Company Profile** | `/employer/profile` | Employer | `CompanyProfileEditor.tsx` | Supabase JS client | `companies`, `company_profiles` | Employer Session | Update company description, logo, website, perks | **Verified** | Team member write access | `src/pages/employer/CompanyProfile.tsx` |
| 4 | **Job Posting** | `/employer/jobs/post`| Employer | `JobPostPage.tsx`, `JobForm.tsx` | Supabase JS client | `jobs` | Employer Session | Publish new vacancy with salary & requirements | **Verified** | Automatically linked to employer's company | `src/pages/employer/JobPostPage.tsx` |
| 5 | **Job Management** | `/employer/dashboard`| Employer | `EmployerJobsList.tsx` | Supabase JS client | `jobs`, `job_applications` | Employer Session | Pause, edit, or close existing job postings | **Verified** | Soft-delete / status toggle (`is_active`) | `src/components/employer/EmployerJobsList.tsx` |
| 6 | **Candidate Discovery** | `/employer/candidates`| Employer | `CandidateSearch.tsx`, `CandidateFilterBar.tsx` | View: `employer_cv_database_secure` | `profiles`, `resumes`, `user_skills` | Employer Session | Search pool of candidate profiles and resumes | **Verified** | Only exposes public / opted-in candidates | `src/pages/employer/CandidateSearch.tsx` |
| 7 | **Candidate Profile View**| `/employer/candidate/:id`| Employer | `CandidateProfileView.tsx` | Supabase JS client | `profiles`, `user_experience`, `user_skills` | Employer Session | Review full candidate work history & score | **Verified** | RLS allows verified employers to view | `src/pages/employer/CandidateProfileView.tsx` |
| 8 | **Resume Access** | `/employer/candidate/:id`| Employer | `ResumeViewerModal.tsx` | `supabase.storage.from('resumes')` | `storage.objects`, `resumes` | Employer Session | Read and download candidate resume file | **Verified** | Signed URL generated for authorized recruiters | `src/components/employer/ResumeViewerModal.tsx` |
| 9 | **Candidate Filtering** | `/employer/candidates`| Employer | `CandidateFilterBar.tsx` | Supabase JS client | `employer_cv_database_secure` | Employer Session | Filter by experience, CTC, location, & skills | **Verified** | Faceted filtering in view | `src/components/employer/CandidateFilterBar.tsx` |
| 10| **Candidate Shortlisting**| `/employer/crm` | Employer | `EmployerCRM.tsx`, `KanbanBoard.tsx` | Supabase JS client | `job_applications` | Employer Session | Drag-and-drop candidates across hiring stages | **Verified** | Updates `job_applications.status` | `src/pages/employer/EmployerCRM.tsx` |
| 11| **Recruitment Enquiries** | `/employer/inbox` | Employer | `RecruiterInbox.tsx` | Supabase JS client | `candidate_conversations`, `messages` | Employer Session | Direct communication with applicants | **Verified** | In-app messaging system | `src/pages/employer/RecruiterInbox.tsx` |
| 12| **Employer Subscription**| `/employer/subscription`| Employer | `EmployerPricing.tsx` | Edge Fn: `razorpay-create-order` | `company_subscriptions`, `subscribers` | Employer Session | Purchase candidate unlock credits & job boosts | **Partially Verified** | Demo mode fallback present | `src/pages/employer/EmployerPricing.tsx` |
| 13| **Employer Dashboard** | `/employer/dashboard`| Employer | `EmployerDashboard.tsx`, `HiringMetrics.tsx` | Supabase JS client | `jobs`, `job_applications`, `companies` | Employer Session | Application counts, views, time-to-hire metrics | **Verified** | Aggregated hiring funnel | `src/pages/employer/EmployerDashboard.tsx` |
| 14| **Employer Notifications**| `/employer/notifications`| Employer | `EmployerNotifications.tsx` | Supabase JS client | `notifications` | Employer Session | Alerts on new applicants & candidate replies | **Verified** | Realtime alerts | `src/components/employer/EmployerNotifications.tsx` |

---

## 4. C. PLATFORM AND ADMINISTRATIVE JOURNEYS (1 TO 12)

| # | Journey | URL | User Type | Components | APIs & Functions | Database Tables / RPCs | Authentication | Expected Outcome | Actual Status | Dependencies & Notes | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Admin Authentication** | `/admin` | Admin / Super Admin | `AdminGuard.tsx`, `UnifiedAdminLayout.tsx` | RPC: `get_user_app_role` | `user_roles`, `auth.users` | Admin Session | Validate admin session; fail closed if invalid | **Verified** | Evaluates role against `user_roles` | `src/hooks/useAdminPermissions.ts` |
| 2 | **User Management** | `/admin/users` | Super Admin | `AdminManagement.tsx`, `AddAdminDialog.tsx` | RPC: `assign_user_role_secure_v2` | `user_roles`, `profiles`, `admin_audit_log` | Super Admin | Manage staff roles; audit role assignments | **Critical Risk** | Phone-number based super admin escalation bypass | `src/lib/admin/superAdminPolicy.ts:31` |
| 3 | **Employer Management**| `/admin/employers` | Admin | `EmployerRequestsAdmin.tsx` | RPC: `approve_employer_request` | `employer_requests`, `companies` | Admin Session | Review employer business registration & approve | **Verified** | Stored procedure provisions company & team admin | `src/pages/admin/EmployerRequestsAdmin.tsx` |
| 4 | **Job Moderation** | `/admin/jobs` | Admin | `AdminJobUpload.tsx`, `JobModerationTable.tsx` | Supabase JS client | `jobs` | Admin Session | Approve, edit, deactivate scraped or spam jobs | **Verified** | Status flags & category corrections | `src/pages/AdminJobUpload.tsx` |
| 5 | **Content Management** | `/admin/content` | Admin | `CareerContentAdmin.tsx` | Supabase JS client | `articles`, `learning_courses` | Admin Session | Publish career advice articles & curate courses | **Verified** | Markdown editor and status controls | `src/components/admin/CareerContentAdmin.tsx` |
| 6 | **Platform Configuration**| `/admin/settings` | Admin | `AdminPlatformConfig.tsx` | Supabase JS client | `platform_settings` | Admin Session | Toggle feature flags, maintenance mode | **Verified** | Config table key-value pairs | `src/pages/admin/AdminPlatformConfig.tsx` |
| 7 | **Subscription Admin** | `/admin/subscriptions`| Admin | `SubscriptionAdmin.tsx` | Supabase JS client | `subscribers`, `company_subscriptions` | Admin Session | View subscriber tiers, override expiry dates | **Verified** | Manual grant & renewal controls | `src/pages/admin/SubscriptionAdmin.tsx` |
| 8 | **Payment Records** | `/admin/payments` | Admin | `PaymentAuditLedger.tsx` | Supabase JS client | `claim1_payments`, `subscribers` | Admin Session | View payment transaction IDs, fees, & status | **Verified** | Read-only payment audit trail | `src/pages/admin/PaymentAuditLedger.tsx` |
| 9 | **Lead Management** | `/admin/leads` | Admin | `CampaignManager.tsx`, `LeadTable.tsx` | Supabase JS client | `email_automation_queue`, `leads` | Admin Session | Ingest candidate leads and monitor outreach | **Verified** | Status tracking: queued, sent, bounced | `src/pages/CampaignManager.tsx` |
| 10| **Analytics & Reporting**| `/admin/analytics`| Admin | `AnalyticsAdmin.tsx`, `GscCommandCenter.tsx` | Serverless: `GET /api/udx/overview` | `system_metrics`, `analytics_events` | Admin Session | Real-time traffic, indexing, conversion stats | **Verified** | Aggregated telemetry charts | `src/components/analytics/AnalyticsAdmin.tsx` |
| 11| **Background Jobs** | Serverless / Cron | System / Worker | GitHub Action, Vercel Crons | Edge Fns: `job-expiry-cleanup`, `database-cleanup`| `jobs`, `cleanup_backup_log` | Cron Secret | Automated daily job cleanup & index refresh | **Verified** | Daily cron configured in `.github/workflows` | `.github/workflows/autonomous-publishing-cycle.yml` |
| 12| **API Integrations** | Edge / Serverless | System | AWS SES SDK, Google Indexing, Razorpay | `api/email/_send.ts`, `api/seo/indexnow.ts` | `email_audit_ledger`, `gsc_snapshots` | Service Role | Third-party API coordination & webhooks | **Verified** | Encapsulated serverless endpoints | `api/email/_send.ts` |

---

## 5. D. OTHER IMPLEMENTED MODULES

| Module | URL | User Type | Core Components | APIs / RPCs | Database Dependencies | Expected Outcome | Actual Status | Findings / Risk |
|---|---|---|---|---|---|---|---|---|
| **Claim #1 Bidding** | `/claim` | Authenticated | `Claim1Hub.tsx`, `BidSubmissionModal.tsx` | RPC: `claim1_process_verified_bid` | `claim1_listings`, `claim1_payments`, `claim1_entities` | Auction top sponsored ranking in category | **Vulnerable** | RPC does not verify Razorpay signature; trusts client bid input |
| **TXC Gamification & Rewards** | `/referrals`, `/pro` | Job Seeker | `RetroactiveTXCAdmin.tsx`, `RewardBadge.tsx` | RPC: `award_tokens`, `calculate_txc_mining_reward` | `txc_transactions`, `user_token_balances` | Earn TXC tokens for profile milestones & referrals | **Verified** | Stored procedures enforce token distribution rules |
| **College Campus Ecosystem**| `/colleges` | Student / TPO | `CollegeDirectory.tsx`, `PlacementPortal.tsx` | Supabase JS client | `colleges`, `college_analytics` | 1,250+ Indian colleges directory & campus drives | **Verified** | Static seed catalog enriched with dynamic metrics |
| **Autonomous AI C-Suite** | Internal / Edge | System | Edge Fns: `ai-cfo-*`, `ai-cmo-*`, `ai-cto-*` | Lovable AI Gateway (`gemini-2.5-flash`) | `ai_company_decisions`, `ai_company_metrics` | Automated operational business intelligence | **Partially Verified**| Dependent on `LOVABLE_API_KEY` in Supabase Secrets |
| **Capacitor Mobile / PWA** | Native / Web | Mobile User | `NativeApp.tsx`, `MobileSearch.tsx` | `@capacitor/*`, `@capgo/capacitor-updater` | Local SQLite + Supabase Sync | iOS/Android native app with push notifications | **Verified** | Fully configured Capacitor 7 container |
