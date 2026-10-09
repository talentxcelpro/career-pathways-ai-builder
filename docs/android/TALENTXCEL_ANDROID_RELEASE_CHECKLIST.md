# TALENTXCEL NATIVE ANDROID APP — RELEASE & GOOGLE PLAY CHECKLIST

**Application Name:** TalentXcel Pro  
**Package Name / Application ID:** `in.talentxcel.app`  
**Target SDK:** Android 34 / 35 (Android 14 / 15)  
**Min SDK:** Android 26 (Android 8.0 Oreo - covers >96% of active devices)  
**Date:** 2026-09-28  

---

## 1. APPLICATION IDENTITY & METADATA

- [x] **Application ID**: `in.talentxcel.app`
- [x] **Version Code**: `10001`
- [x] **Version Name**: `1.0.0`
- [x] **App Name**: `TalentXcel Pro`
- [ ] **Short Description** (up to 80 chars):
  - *Find jobs, connect with recruiters, and accelerate your career with AI.*
- [ ] **Full Description** (up to 4000 chars):
  - *TalentXcel Pro is your all-in-one AI career co-pilot, professional network, and job search platform. Connect with employers, discover personalized recommendations, track your applications in real-time, and elevate your career.*
- [x] **Launcher & Adaptive Icons**:
  - `ic_launcher` (Foreground + Background XML Vector / PNG)
  - `ic_launcher_round`
  - High-res icon (512x512 PNG, 32-bit color, max 1024KB)
- [ ] **Feature Graphic**:
  - 1024 x 500 PNG/JPEG (no transparency)
- [ ] **Store Screenshots**:
  - Min 4 phone screenshots (1080x1920 or 1080x2400) showcasing:
    1. Home Dashboard & AI Job Matches
    2. Real-time Jobs Feed & Advanced Filters
    3. My Applications Real-time Tracking
    4. Professional Network & Profile Identity
    5. AI Career Coach & Skill Insights

---

## 2. PRIVACY, COMPLIANCE & PERMISSIONS

### 2.1 Manifest Permissions Review
- `android.permission.INTERNET` (Required for Supabase, Firebase, API queries)
- `android.permission.ACCESS_NETWORK_STATE` (Network connectivity monitoring)
- `android.permission.POST_NOTIFICATIONS` (Android 13+ runtime permission for FCM push notifications)
- `android.permission.READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` (Resume and avatar uploads)
- No unnecessary invasive permissions (SMS, Call logs, Location in background are NOT requested).

### 2.2 Google Play Policy Declarations
- [x] **Privacy Policy URL**: `https://talentxcel.in/privacy-policy`
- [x] **Terms of Service URL**: `https://talentxcel.in/terms`
- [x] **Account Deletion Link**: User can request deletion within profile settings or via `https://talentxcel.in/settings/security`
- [x] **Data Safety Form**:
  - Data collected: Name, Email address, Job history, Resume files (all encrypted in transit via TLS 1.3).
  - No data shared with third-party data brokers.
  - User can request data export and deletion.

---

## 3. ANDROID APP LINKS & DIGITAL ASSET LINKS

- [x] Intent filters registered in `AndroidManifest.xml` with `android:autoVerify="true"`:
  - Host: `talentxcel.in`
  - Paths: `/jobs/*`, `/profile/*`, `/applications/*`
- [ ] Digital Asset Links file hosted at:
  - `https://talentxcel.in/.well-known/assetlinks.json`
  - Content:
    ```json
    [{
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "in.talentxcel.app",
        "sha256_cert_fingerprints": [
          "RELEASE_KEY_SHA256_FINGERPRINT_PLACEHOLDER"
        ]
      }
    }]
    ```

---

## 4. CODE SIGNING & KEYSTORE SAFETY

- [x] **Keystore location**: Keystore is generated locally or injected via CI/CD secrets.
- [x] **Git Protection**: `*.jks`, `*.keystore`, and `keystore.properties` are listed in `.gitignore`.
- [x] **Release Signing Configuration**: Configured in `build.gradle.kts` via system environment variables or `local.properties`.
- [x] **Google Play App Signing**: Enroll in Play App Signing with Google-managed key and local upload key.

---

## 5. PROGUARD / R8 OBFUSCATION & OPTIMIZATION

- [x] `minifyEnabled = true` for release build.
- [x] `shrinkResources = true` for release build.
- [x] Proguard rules configured for:
  - Supabase Kotlin SDK models (`@Serializable`)
  - Kotlin Coroutines & Flow
  - Jetpack Compose runtime
  - Firebase FCM and Analytics
  - Room database entities

---

## 6. PRODUCTION SMOKE TEST CHECKLIST

Before promoting an AAB to production tracks:
1. [ ] Clean install on physical Android device (Android 10, 12, 14, 15).
2. [ ] Test sign-in using existing production web account credentials.
3. [ ] Verify profile loads identically to web profile (`https://talentxcel.in/profile`).
4. [ ] Verify jobs feed loads real postings from Supabase `jobs` table.
5. [ ] Execute search and verify filtered results match web catalog.
6. [ ] Submit test application / verify status matches in `My Applications`.
7. [ ] Send test FCM push notification and tap to test deep-link routing.
8. [ ] Tap link `https://talentxcel.in/jobs/<job-id>` in Chrome on Android and verify App Link opens app directly.
9. [ ] Test airplane mode / offline mode and verify cached data display.
10. [ ] Sign out and verify all secure tokens are wiped from `EncryptedSharedPreferences`.

---

## 7. BUILD ARTIFACT GENERATION COMMANDS

```bash
# Clean project
./gradlew clean

# Build release Android App Bundle (AAB)
./gradlew app:bundleRelease

# Build release APK for internal QA testing
./gradlew app:assembleRelease

# Output locations:
# AAB: apps/talentxcel-android/app/build/outputs/bundle/release/app-release.aab
# APK: apps/talentxcel-android/app/build/outputs/apk/release/app-release.apk
```
