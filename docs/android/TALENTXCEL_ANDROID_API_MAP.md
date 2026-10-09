# TalentXcel Android — API Map

**Version:** 1.0  
**Date:** 2026-09-28

This document maps every Android screen to its backend data source.

---

## Authentication

| Android Screen | Repository | Supabase Source | Table / Function |
|---|---|---|---|
| `LoginScreen` | `AuthRepository` | `supabase.auth.signInWithPassword()` | `auth.users` |
| `RegisterScreen` | `AuthRepository` | `supabase.auth.signUp()` | `auth.users` |
| `ForgotPasswordScreen` | `AuthRepository` | `supabase.auth.resetPasswordForEmail()` | `auth.users` |
| `SplashScreen` | `AuthRepository` | `supabase.auth.currentSessionOrNull()` | `auth.sessions` |
| Google OAuth | `AuthRepository` | `supabase.auth.signInWith(Google)` | OAuth provider |
| Push token | `NotificationRepository` | Edge function `register-push-token` | `push_tokens` (or profiles) |

---

## Home Screen

| Data Element | Repository | Supabase Source | Notes |
|---|---|---|---|
| User greeting | `ProfileRepository` | `profiles` table → `full_name` | Cached locally |
| Profile completion % | `ProfileRepository` | `profiles` table → completion calc | Computed client-side |
| Recommended jobs | `JobRepository` | `ai_job_matches` table JOIN `jobs` | Ordered by match score |
| New jobs | `JobRepository` | `jobs` table → `created_at DESC` | Limit 10 |
| Application summaries | `ApplicationRepository` | `job_applications` table | Count by status |
| Unread notifications count | `NotificationRepository` | `notifications` WHERE `is_read=false` | Badge count |
| Career recommendations | `CareerRepository` | `ai_career_recommendations` | Priority ordered |

---

## Jobs

| Android Screen | Repository | Supabase Source | Table / Function |
|---|---|---|---|
| `JobsScreen` (feed) | `JobRepository` | `jobs` table | Paginated, 20 per page |
| `JobsScreen` (search) | `JobRepository` | `jobs` table ILIKE | Full-text search |
| `JobsScreen` (filters) | `JobRepository` | `jobs` table WHERE clauses | Location, industry, type |
| `JobsScreen` (recommended) | `JobRepository` | `ai_job_matches` JOIN `jobs` | Match % from AI |
| `JobDetailScreen` | `JobRepository` | `jobs` table WHERE `id=?` | Single job |
| Save job | `JobRepository` | `saved_jobs` table INSERT | Upsert |
| Check saved | `JobRepository` | `saved_jobs` table SELECT | WHERE user_id + job_id |
| Apply | `ApplicationRepository` | `job_applications` table INSERT | Creates application |
| Similar jobs | `JobRepository` | `jobs` WHERE same industry/skills | Client-side or edge fn |
| AI match % | `JobRepository` | `ai_job_matches.match_score` | Per job |

### Job Data Model (mapped from `jobs` table)
```
Job {
  id: String
  title: String
  company: String
  location: String
  salary_min: Long?
  salary_max: Long?
  currency: String?
  employment_type: String          // full-time, part-time, contract
  work_mode: String                // remote, hybrid, onsite
  experience_min: Int?
  experience_max: Int?
  skills: List<String>
  description: String
  requirements: String?
  benefits: String?
  source: String                   // internal, greenhouse, lever, etc.
  apply_url: String?
  posted_at: String
  expires_at: String?
  is_active: Boolean
  match_score: Int?               // from ai_job_matches
}
```

---

## Applications

| Android Screen | Repository | Supabase Source | Table |
|---|---|---|---|
| `ApplicationsScreen` | `ApplicationRepository` | `job_applications` table | WHERE `user_id=?` |
| Application by status | `ApplicationRepository` | `job_applications` WHERE `status=?` | applied/under_review/shortlisted/interview/selected/rejected |
| Application detail | `ApplicationRepository` | `job_applications` JOIN `jobs` | Single row |
| Real-time updates | `ApplicationRepository` | Supabase Realtime channel | `job_applications` table |

### Application Statuses (mapped from backend)
```
applied → "Applied"
under_review → "Under Review"
shortlisted → "Shortlisted"
interview → "Interview"
selected → "Selected" / "Offer"
rejected → "Rejected"
withdrawn → "Withdrawn"
```

---

## Network

| Android Screen | Repository | Supabase Source | Table |
|---|---|---|---|
| `NetworkScreen` (connections) | `NetworkRepository` | `user_connections` or `connections` table | WHERE `user_id=?` |
| Connection requests | `NetworkRepository` | `connections` WHERE `status=pending` | Incoming |
| Suggested connections | `NetworkRepository` | `profiles` (recommended) | Skill/location match |
| User profile view | `ProfileRepository` | `profiles` table | By user_id or slug |
| Follow/unfollow | `NetworkRepository` | `user_follows` table | INSERT/DELETE |
| Network activity | `NetworkRepository` | `network_posts` or `posts` | Activity feed |
| Send request | `NetworkRepository` | `connections` INSERT | status=pending |
| Accept/decline | `NetworkRepository` | `connections` UPDATE | status change |

---

## Profile

| Android Screen | Repository | Supabase Source | Table |
|---|---|---|---|
| `ProfileScreen` | `ProfileRepository` | `profiles` table | SELECT * WHERE id=user_id |
| Edit profile | `ProfileRepository` | `profiles` UPDATE | UPSERT |
| Profile photo upload | `ProfileRepository` | Supabase Storage + `profiles.profile_picture_url` | `avatars` bucket |
| Skills | `ProfileRepository` | `user_skills` or `profiles.skills` JSON | Embedded or separate |
| Experience | `ProfileRepository` | `user_experiences` table | WHERE `user_id=?` |
| Education | `ProfileRepository` | `user_education` table | WHERE `user_id=?` |
| Certifications | `ProfileRepository` | `user_certifications` table | WHERE `user_id=?` |
| Profile completion | `ProfileRepository` | Computed from profiles fields | Client-side calculation |
| Profile views | `ProfileRepository` | `profile_views` table | Count |
| Resume | `ProfileRepository` | `ai_resumes` table | Latest resume |

---

## Career

| Android Screen | Repository | Supabase Source | Edge Function |
|---|---|---|---|
| `CareerScreen` (recommendations) | `CareerRepository` | `ai_career_recommendations` table | — |
| AI Career Coach | `CareerRepository` | Edge function `ai-chat` | `ai-chat` |
| Passport AI | `CareerRepository` | Edge function `passport-ai-coach` | `passport-ai-coach` |
| Career roadmap | `CareerRepository` | `career_roadmaps` or similar | — |
| Skill recommendations | `CareerRepository` | `ai_career_recommendations WHERE type=skill` | — |
| Resume analysis | `CareerRepository` | `ai_resumes` + edge `enhance-resume` | `enhance-resume` |
| Talent score | `CareerRepository` | Edge function `compute-talent-score` | `compute-talent-score` |

---

## Notifications

| Android Screen | Repository | Supabase Source | Table |
|---|---|---|---|
| `NotificationsScreen` | `NotificationRepository` | `notifications` table | WHERE `user_id=?` ORDER BY `created_at DESC` |
| Unread count (badge) | `NotificationRepository` | `notifications` WHERE `is_read=false` | COUNT |
| Mark as read | `NotificationRepository` | `notifications` UPDATE | `is_read=true` |
| Mark all read | `NotificationRepository` | `notifications` UPDATE all | `is_read=true` |
| Real-time new notifications | `NotificationRepository` | Supabase Realtime | `notifications` channel |
| Notification preferences | `SettingsRepository` | `notification_preferences` or `profiles.preferences` | — |
| Push token registration | `NotificationRepository` | Edge function `register-push-token` | `register-push-token` |

### Notification Data Model (from `notifications` table)
```
Notification {
  id: String
  user_id: String
  module: String          // network, jobs, resume, tools, companies, learning, career_map, employer
  type: String
  title: String
  message: String
  link: String            // deep-link path e.g. "/jobs/123"
  icon: String?
  is_read: Boolean
  priority: String        // low, medium, high
  sound: Boolean
  created_at: String
  expires_at: String?
}
```

---

## FCM Notification → Deep Link Map

| FCM `type` | Notification Data | Android Destination |
|---|---|---|
| `NEW_JOB_MATCH` | `job_id` | `JobDetailScreen(jobId)` |
| `APPLICATION_UPDATE` | `application_id` | `ApplicationsScreen` |
| `CONNECTION_REQUEST` | `user_id` | `NetworkScreen` |
| `NEW_CONNECTION` | `user_id` | `NetworkScreen` |
| `PROFILE_VIEW` | — | `ProfileScreen` |
| `CAREER_RECOMMENDATION` | `recommendation_id` | `CareerScreen` |
| `SYSTEM_UPDATE` | — | `NotificationsScreen` |

---

## Supabase Edge Functions Used by Android

| Function | Called From | Purpose |
|---|---|---|
| `register-push-token` | App launch / token refresh | Register FCM token |
| `send-push-notification` | Server-side only | Trigger push |
| `ai-chat` | CareerScreen | AI career chat |
| `passport-ai-coach` | CareerScreen | Career passport AI |
| `enhance-resume` | ProfileScreen | AI resume enhancement |
| `compute-talent-score` | CareerScreen | Talent score calculation |
| `health-check` | App startup | Backend health verification |

---

## App Links Configuration

### Required `assetlinks.json` (publish to `https://talentxcel.in/.well-known/assetlinks.json`)
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "in.talentxcel.app",
    "sha256_cert_fingerprints": ["<RELEASE_KEYSTORE_SHA256_HERE>"]
  }
}]
```

### Android `AndroidManifest.xml` Intent Filters
```xml
<!-- Jobs deep link -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="https" android:host="talentxcel.in" android:pathPrefix="/jobs"/>
</intent-filter>

<!-- Profile deep link -->
<intent-filter android:autoVerify="true">
  ...
  <data android:scheme="https" android:host="talentxcel.in" android:pathPrefix="/profile"/>
</intent-filter>

<!-- Applications deep link -->
<intent-filter android:autoVerify="true">
  ...
  <data android:scheme="https" android:host="talentxcel.in" android:pathPrefix="/applications"/>
</intent-filter>
```
