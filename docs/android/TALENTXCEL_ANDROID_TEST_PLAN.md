# TALENTXCEL NATIVE ANDROID APP — TEST PLAN & QUALITY ASSURANCE

**Target:** `in.talentxcel.app` (TalentXcel Native Android Application)  
**Standard:** Production Grade  
**Date:** 2026-09-28  

---

## 1. TESTING STRATEGY OVERVIEW

The TalentXcel Android native application follows the standard Android Testing Pyramid:

```
           ▲
          / \
         /   \     UI & End-to-End Tests (Compose Test Rule / Espresso)
        /=====\
       /       \   Integration Tests (Supabase Mock Engine, Room DB, FCM)
      /=========\
     /           \ Unit Tests (ViewModels, Use Cases, Repositories, Mappers)
    /=============\
```

---

## 2. UNIT TESTS (Local JVM / Mockk / Coroutines Test)

Target package: `src/test/java/com/talentxcel/android/`

### 2.1 Repositories & Data Sources
- **`AuthRepositoryTest`**:
  - Validates user sign-in with email & password.
  - Verifies token storage in `EncryptedSharedPreferences`.
  - Tests automatic session restoration and refresh flow on token expiration.
  - Validates sign-out cleans all local cached credentials.
- **`JobRepositoryTest`**:
  - Tests job feed pagination and limit parameter handling.
  - Tests filtering criteria combinations (location, role, experience, salary min/max).
  - Tests offline fallback to Room local cached jobs when network is unreachable.
  - Tests bookmarking / saving job toggle logic and optimistic UI updates.
- **`ApplicationRepositoryTest`**:
  - Tests job application submission.
  - Tests status parsing and mapping from Supabase `job_applications`.
- **`NotificationRepositoryTest`**:
  - Verifies notification unread count calculation.
  - Tests mark-as-read mutation.
  - Verifies FCM token registration payload dispatch to edge function `register-push-token`.
- **`ProfileRepositoryTest`**:
  - Tests profile completion percentage calculation.
  - Verifies profile update payload serialization.

### 2.2 Domain Use Cases
- `SearchJobsUseCaseTest`: Validates query sanitization, debouncing, and keyword matching.
- `ApplyToJobUseCaseTest`: Enforces prerequisites before sending application (e.g. valid profile, required fields).
- `DeepLinkRoutingUseCaseTest`: Parses incoming URLs (e.g., `https://talentxcel.in/jobs/123`, `https://talentxcel.in/profile/john-doe`) into strongly-typed navigation arguments.

### 2.3 ViewModels (StateFlow & Coroutines Dispatchers)
- `HomeViewModelTest`: Validates initial state loading, error recovery, profile completion meter computation, and recommended jobs flow.
- `JobsViewModelTest`: Validates search state, filter chips selection, lazy list pagination, and bookmark toggling.
- `NotificationsViewModelTest`: Validates unread badge counts, real-time subscription update appending, and bulk mark-all-read.
- `ProfileViewModelTest`: Validates profile editing validation rules, error banners, and save triggers.

---

## 3. INTEGRATION TESTS (Android Instrumentation / Robolectric)

### 3.1 Local Storage (Room Database)
- Verify `JobDao` inserts, queries with custom SQL filters, and clean truncation.
- Verify `NotificationDao` read status updates and atomic transactions.
- Verify migration paths if database version increments.

### 3.2 Security & Keystore
- Validate `SecureStorage` encryption / decryption using Android Keystore Master Key (`AES256_GCM`).
- Ensure no cleartext credentials or JWT tokens exist in plain `SharedPreferences`.

### 3.3 Deep Link & App Link Intent Resolution
- Simulate incoming intents with action `VIEW` and URLs:
  - `https://talentxcel.in/jobs/test-id-123`
  - `https://talentxcel.in/profile/test-slug`
  - `https://talentxcel.in/applications`
- Verify correct top-level navigation destination and argument passing without crashing.

---

## 4. UI TESTS (Compose Test Rule)

Target package: `src/androidTest/java/com/talentxcel/android/`

### 4.1 Critical User Journeys
1. **Authentication Flow**:
   - Launch app -> Shows Login Screen -> Fill email/password -> Tap "Sign In" -> Verify navigation to Home dashboard.
2. **Job Search & Filter Flow**:
   - Navigate to Jobs tab -> Enter search query "Frontend" -> Click Filter chip "Remote" -> Verify filtered cards render -> Tap a card -> Verify Job Details screen opens with full specifications.
3. **Application Tracking**:
   - Navigate to Me / Applications tab -> Verify statuses render with appropriate color tags (Applied, Shortlisted, Interview, Offer, Rejected).
4. **Notification Centre**:
   - Tap top bar Notification Bell -> Verify list items render -> Tap unread item -> Verify mark as read and navigation to deep-linked entity.

---

## 5. NETWORK FAILURE & EDGE CASE TESTS

- **Airplane Mode / Offline Launch**:
  - Launch app with no internet connectivity -> Verify cached data renders gracefully without throwing unhandled exceptions -> Verify "Offline Mode - displaying cached data" banner shows -> Click Retry when internet returns -> Data refreshes.
- **Token Expiry**:
  - Simulate expired Supabase JWT -> Verify repository automatically calls refresh token endpoint -> If refresh token invalid, gracefully navigates to Login with session expired prompt.
- **Empty States**:
  - Test UI behavior when user has 0 applications, 0 saved jobs, 0 notifications, or when search yields 0 matches -> Ensure clean EmptyState component renders with clear call-to-action.

---

## 6. TEST EXECUTION COMMANDS

```bash
# Run all local unit tests
./gradlew testDebugUnitTest

# Run specific ViewModel tests
./gradlew testDebugUnitTest --tests "com.talentxcel.android.presentation.jobs.JobsViewModelTest"

# Run Android instrumentation / Compose UI tests
./gradlew connectedDebugAndroidTest

# Generate test coverage report
./gradlew jacocoTestReport
```
