# TALENTXCEL.IN — COMPLETE ROUTE INVENTORY

**Document ID:** TX-ROUTES-001  
**Project:** TalentXcel.in  
**Audit Date:** 2026-10-30  
**Unique Paths Identified:** 404  
**Total Route Registrations:** 769  
**Multi-Domain Architecture:** 10 Synchronized Product Universes

---

## 1. ROUTE ARCHITECTURE & DISCOVERY METHODOLOGY

TalentXcel.in implements a hybrid single-page routing architecture:
1. **Explicit Priority JSX Routes (`src/App.tsx` lines 594–885):** High-priority top-level pages, SEO-optimized landing pages, recruiter portals, and dynamic slug handlers registered first to override generic sub-routers.
2. **Modular Route Registries (`src/navigation/*.tsx` & `src/nav-items.tsx`):** Domain-specific arrays exported as `NavItem[]` and mapped into `<Route>` elements inside `App.tsx` (lines 886–900).
3. **Subdomain-Aware Routing (`src/config/domainArchitecture.ts` & `vercel.json`):** Request hostname resolution maps the browser URL to one of 10 primary product universes without requiring separate web applications.
4. **Wildcard & Catch-All Resolvers (`src/App.tsx` lines 901–965):** Handles legacy company slug vanity paths (`/:companySlug`), entity profile redirects, and global 404 boundaries.

### Status Definitions
- **Verified:** Route path, component, and underlying data flow directly verified in repository code.
- **Partially verified:** Component renders UI, but relies on unverified external services, missing edge functions, or mock fallbacks.
- **Broken / Missing Edge Dependency:** Route component exists, but calls a missing Edge Function or broken backend dependency.
- **Unverified:** Route declared, but requires production credentials or runtime state not verifiable in local read-only inspection.

---

## 2. COMPREHENSIVE ROUTE CATALOG BY PRODUCT UNIVERSE

### UNIVERSE 1: CORE CAREER ECOSYSTEM (talentxcel.in / www.talentxcel.in)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/` | `src/pages/Index.tsx` | No | Public / Guest | **Verified** | Primary platform landing page |
| `/dashboard` | `src/pages/Dashboard.tsx` | Yes | Job Seeker | **Verified** | User career dashboard & analytics |
| `/settings` | `src/pages/Settings.tsx` | Yes | Authenticated | **Verified** | User account & notification preferences |
| `/notifications` | `src/pages/NotificationsPage.tsx` | Yes | Authenticated | **Verified** | In-app alerts and notifications |
| `/services` | `src/pages/TalentXcelServices.tsx` | No | Public | **Verified** | Platform career service offerings |
| `/pricing` | `src/pages/pro/PricingPlans.tsx` | No | Public | **Verified** | Pro membership & tier pricing |
| `/pro` | `src/pages/pro/ProOverview.tsx` | Yes | Authenticated | **Partially verified** | Pro benefits; checkout demo fallback |
| `/ai-agent` | `src/pages/ai/AIAgentDashboard.tsx` | No | Public | **Verified** | Interactive AI career companion |
| `/saved-jobs` | `src/pages/SavedJobs.tsx` | Yes | Job Seeker | **Verified** | Bookmarked and applied jobs |
| `/testing` | `src/pages/TestingDashboard.tsx` | No (Dev) | Public / Admin | **Verified** | Notification & workflow testing |
| `/campaigns` | `src/pages/CampaignManager.tsx` | Yes | Admin / Recruiter | **Verified** | Outreach campaigns & lead gen |
| `/feed` | `src/pages/FeedEmbeds.tsx` | No | Public | **Verified** | Social career feed & embedded posts |
| `/referrals` | `src/pages/referral/ReferralDashboard.tsx`| Yes | Job Seeker | **Verified** | TXC token referrals & leaderboards |
| `/about-us` | `src/pages/AboutUs.tsx` | No | Public | **Verified** | Static platform overview |
| `/contact` | `src/pages/ContactUs.tsx` | No | Public | **Verified** | Contact & support submission form |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | No | Public | **Verified** | Legal compliance documentation |
| `/terms` | `src/pages/Terms.tsx` | No | Public | **Verified** | Terms of service |

---

### UNIVERSE 2: AUTHENTICATION & ONBOARDING (/auth/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/auth` | `src/pages/auth/AuthPage.tsx` | No | Guest | **Verified** | Unified sign-in/up entry point |
| `/auth/login` | `src/pages/auth/Login.tsx` | No | Guest | **Verified** | Email/Password & Phone OTP login |
| `/auth/register` | `src/pages/auth/Register.tsx` | No | Guest | **Verified** | Multi-step candidate registration |
| `/auth/forgot-password`| `src/pages/auth/ForgotPassword.tsx` | No | Guest | **Verified** | Password reset request |
| `/auth/reset-password` | `src/pages/auth/ResetPassword.tsx` | No | Guest | **Verified** | Password update token handler |
| `/auth/callback` | `src/pages/auth/OAuthCallback.tsx` | No | Guest | **Verified** | Google OAuth PKCE token exchange |
| `/onboarding` | `src/pages/auth/OnboardingFlow.tsx` | Yes | New User | **Verified** | 4-step candidate profile wizard |

---

### UNIVERSE 3: JOBS & CAREER OPPORTUNITIES (jobs.talentxcel.in / /jobs/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/jobs` | `src/pages/Jobs.tsx` | No | Public / Candidate | **Verified** | Search & faceted job filtering |
| `/job/:jobId` | `src/pages/JobDetails.tsx` | No | Public / Candidate | **Verified** | Full job specification & SEO schema |
| `/jobs/search` | `src/pages/JobSearch.tsx` | No | Public | **Verified** | Advanced query & boolean search |
| `/jobs/remote` | `src/pages/jobs/RemoteJobs.tsx` | No | Public | **Verified** | Filtered remote positions |
| `/jobs/walk-in` | `src/pages/jobs/WalkInDrives.tsx` | No | Public | **Verified** | Offline/in-person hiring drives |
| `/jobs/fresher` | `src/pages/jobs/FresherJobs.tsx` | No | Public | **Verified** | Entry-level / graduate openings |
| `/jobs/category/:cat` | `src/pages/jobs/CategoryJobs.tsx` | No | Public | **Verified** | Department-segmented directory |
| `/jobs/location/:loc` | `src/pages/jobs/LocationJobs.tsx` | No | Public | **Verified** | City & Tier-2 hub job pages |
| `/jobs/company/:slug` | `src/pages/jobs/CompanyJobs.tsx` | No | Public | **Verified** | Employer-specific open listings |
| `/government-jobs` | `src/pages/GovernmentJobs.tsx` | No | Public | **Verified** | PSU, UPSC, SSC examination jobs |
| `/government-jobs/:id`| `src/pages/GovernmentJobDetails.tsx` | No | Public | **Verified** | Government vacancy notification |
| `/applications` | `src/pages/ApplicationTrackerPage.tsx` | Yes | Job Seeker | **Verified** | Track submission status & history |

---

### UNIVERSE 4: RESUME & ATS INTELLIGENCE (resume.talentxcel.in / /resume/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/resume` | `src/pages/ResumeBuilder.tsx` | Yes | Job Seeker | **Verified** | Drag-and-drop resume builder |
| `/resume/builder` | `src/pages/resume/ModernResumeBuilder.tsx`| Yes | Job Seeker | **Verified** | Multi-template live editor |
| `/resume/ats-analyzer`| `src/pages/resume/ATSAnalyzer.tsx` | Yes | Job Seeker | **Partially verified** | Evaluates keyword match via Edge Fn |
| `/resume/ai-optimizer`| `src/pages/resume/AIOptimizer.tsx` | Yes | Job Seeker | **Partially verified** | Gemini/Lovable rewriting |
| `/resume/download` | `src/pages/resume/ResumeDownloadModal.tsx` | Yes | Job Seeker | **Broken / Missing Edge** | Calls missing `razorpay-create-oneoff` |
| `/resume/templates` | `src/pages/resume/ResumeTemplates.tsx` | No | Public | **Verified** | Harvard, Tech, Executive templates |
| `/resume/linkedin` | `src/pages/resume/LinkedInOptimizer.tsx` | Yes | Job Seeker | **Partially verified** | Headline and summary AI coach |
| `/resume/naukri` | `src/pages/resume/NaukriOptimizer.tsx` | Yes | Job Seeker | **Partially verified** | Keyword density for Naukri algorithm |

---

### UNIVERSE 5: RECRUITER OS & EMPLOYERS (employers.talentxcel.in / /recruiters)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/recruiters` | `src/pages/RecruiterLandingPage.tsx` | No | Employer / Guest | **Verified** | Employer acquisition & value prop |
| `/employer/dashboard` | `src/pages/employer/EmployerDashboard.tsx`| Yes | Employer | **Verified** | Company hiring pipeline & KPIs |
| `/employer/jobs/post` | `src/pages/employer/JobPostPage.tsx` | Yes | Employer | **Verified** | Job listing creation form |
| `/employer/candidates`| `src/pages/employer/CandidateSearch.tsx` | Yes | Employer | **Verified** | Talent database & CV filtering |
| `/employer/candidate/:id`| `src/pages/employer/CandidateProfileView.tsx`| Yes | Employer | **Verified** | Candidate resume & score inspection |
| `/employer/team` | `src/pages/employer/TeamManagement.tsx` | Yes | Employer Admin | **Verified** | Recruiter seat & invite management |
| `/employer/subscription`| `src/pages/employer/EmployerPricing.tsx` | Yes | Employer | **Partially verified** | Recruiter plans; demo fallback |
| `/employer/crm` | `src/pages/employer/EmployerCRM.tsx` | Yes | Employer | **Verified** | Candidate stage progression (Kanban) |

---

### UNIVERSE 6: LEARNING & UPSKILLING (learning.talentxcel.in / /learning/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/learning` | `src/pages/learning/LearningHub.tsx` | No | Public / Student | **Verified** | Upskilling catalog & pathways |
| `/learning/courses` | `src/pages/learning/CourseCatalog.tsx` | No | Public | **Verified** | Certifications & partner courses |
| `/learning/course/:id`| `src/pages/learning/CourseDetails.tsx` | No | Public | **Verified** | Curriculum & enrollment details |
| `/assessments` | `src/pages/assessment/AssessmentHub.tsx`| Yes | Job Seeker | **Verified** | Skill testing & benchmarking |
| `/assessment/:id` | `src/pages/assessment/AssessmentTest.tsx`| Yes | Job Seeker | **Verified** | Timed interactive MCQ/coding test |
| `/assessment/result/:id`| `src/pages/assessment/AssessmentResult.tsx`| Yes | Job Seeker | **Verified** | Talent score badge issuance |

---

### UNIVERSE 7: COLLEGES & CAMPUS PLACEMENT (colleges.talentxcel.in / /colleges/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/colleges` | `src/pages/colleges/CollegeDirectory.tsx` | No | Public | **Verified** | 1,250+ Indian colleges directory |
| `/colleges/:slug` | `src/pages/colleges/CollegeDetails.tsx` | No | Public | **Verified** | NIRF rankings, courses, placements |
| `/colleges/placement` | `src/pages/colleges/PlacementPortal.tsx` | Yes | Student / TPO | **Verified** | Campus drive coordination |
| `/colleges/admin` | `src/pages/colleges/CollegeAdminDashboard.tsx`| Yes | College Admin | **Verified** | Student roster & placement stats |

---

### UNIVERSE 8: CAREER MAP & SALARY INTELLIGENCE (careers.talentxcel.in / salary.talentxcel.in)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/career-map` | `src/pages/career/CareerMap.tsx` | No | Public | **Verified** | Interactive React Flow skill graphs |
| `/career-map/:role` | `src/pages/career/RolePathways.tsx` | No | Public | **Verified** | Career progression ladder |
| `/salary` | `src/pages/salary/SalaryCalculator.tsx`| No | Public | **Verified** | Take-home pay & tax deductions |
| `/salary/benchmark` | `src/pages/salary/SalaryBenchmark.tsx` | No | Public | **Verified** | Role & experience CTC ranges |
| `/salary/:role` | `src/pages/salary/RoleSalaryInsights.tsx`| No | Public | **Verified** | City-wise compensation percentiles |

---

### UNIVERSE 9: CAREER PASSPORT (passport.talentxcel.in / /passport/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/passport` | `src/pages/passport/CareerPassportView.tsx`| Yes | Job Seeker | **Verified** | Verifiable credentials & talent score |
| `/passport/verify/:id`| `src/pages/passport/PublicPassportVerification.tsx`| No | Public | **Verified** | QR code credential verification |
| `/passport/badges` | `src/pages/passport/BadgesDirectory.tsx` | Yes | Job Seeker | **Verified** | Skill and achievement badges |
| `/passport/ai-coach` | `src/pages/passport/PassportAICoach.tsx` | Yes | Job Seeker | **Partially verified** | Edge Function `passport-ai-coach` |

---

### UNIVERSE 10: CLAIM #1 BIDDING & LEADERBOARD (/claim/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/claim` | `src/pages/claim/Claim1Hub.tsx` | No | Public / Candidate | **Verified** | Sponsored ranking leaderboard |
| `/claim/:scope` | `src/pages/claim/ScopeLeaderboard.tsx` | No | Public | **Verified** | Category/location rank auctions |
| `/claim/bid/:id` | `src/pages/claim/BidSubmissionModal.tsx`| Yes | Authenticated | **Vulnerable** | Calls `claim1_process_verified_bid` |
| `/claim/verify` | `src/pages/claim/ClaimVerificationPage.tsx`| No | Public | **Verified** | Tokenized claim status confirmation |

---

### UNIVERSE 11: PLATFORM ADMINISTRATION & INTERNAL TOOLS (/admin/*)

| Path | Frontend Component | Auth Required | Target Role | Operational Status | Evidence / Notes |
|---|---|---|---|---|---|
| `/admin` | `src/pages/admin/AdminDashboard.tsx` | Yes | Admin / Super Admin | **Verified** | Core operational dashboard |
| `/admin/users` | `src/pages/admin/AdminManagement.tsx` | Yes | Super Admin | **Critical Risk** | Phone-number based super admin check |
| `/admin/employers` | `src/pages/admin/EmployerRequestsAdmin.tsx`| Yes | Admin | **Verified** | Employer KYC verification |
| `/admin/jobs` | `src/pages/AdminJobUpload.tsx` | Yes | Admin | **Verified** | Bulk CSV job ingestion |
| `/admin/seo` | `src/pages/admin/SEOAdmin.tsx` | Yes | Admin | **Verified** | Sitemaps, IndexNow, GSC metrics |
| `/admin/claim1` | `src/pages/admin/Claim1Admin.tsx` | Yes | Admin | **Verified** | Leaderboard moderation & bids |
| `/admin/logs` | `src/pages/admin/SecurityLogs.tsx` | Yes | Super Admin | **Verified** | Administrative audit ledger |
| `/admin/ai` | `src/pages/AdminAIManagement.tsx` | Yes | Admin | **Verified** | AI provider usage & quotas |
