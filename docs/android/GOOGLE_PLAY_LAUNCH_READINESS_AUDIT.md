# TALENTXCEL NATIVE ANDROID APP — GOOGLE PLAY LAUNCH READINESS AUDIT & CERTIFICATION MATRIX

**Application ID:** `in.talentxcel.app`  
**Version Code:** `10001` | **Version Name:** `1.0.0`  
**Target SDK:** Android 34 / 35 (Android 14 / 15) | **Min SDK:** 26 (Android 8.0 Oreo)  
**Audit Date:** 2026-09-29  
**Classification:** Google Play Store Launch Readiness & Regulatory Compliance  

---

## 1. EXECUTIVE SUMMARY: ENGINEERING READINESS vs. PLAY STORE CERTIFICATION

The TalentXcel Native Android Application has achieved **Engineering Production Readiness**:
* ✅ Full native Kotlin 2.0 / Jetpack Compose clean architecture codebase in `/apps/talentxcel-android/`.
* ✅ Successful compilation of Debug APK (`24.9 MB`) and R8-minified Release AAB (`8.0 MB`).
* ✅ 100% test pass rate across the automated unit-test suite (13/13 passing).
* ✅ Complete on-device AI runtime with privacy minimization, hybrid execution, and agent confirmation flow.

However, as dictated by Google Play Developer policies:
> **“Production build ready” ≠ “Google Play launch fully certified.”**

Before submitting the release bundle (`app-release.aab`) to the Google Play Console for public distribution, the application must pass this **Google Play Launch Readiness Audit**, which evaluates policy compliance, permissions justifications, Data Safety questionnaire answers, Play App Signing configuration, Digital Asset Links domain verification, and real-device testing protocols.

---

## 2. GOOGLE PLAY POLICY & REGULATORY COMPLIANCE AUDIT

### 2.1 Target API Level Compliance
* **Google Play Policy:** New apps and app updates must target Android 14 (API level 34) or higher.
* **TalentXcel Audit:**
  * `compileSdk = 35`
  * `targetSdk = 35`
  * `minSdk = 26` (Covers >96.8% of global active Android devices while supporting modern notification channels and Keystore APIs).
* **Verdict:** **COMPLIANT**

### 2.2 Permissions Declaration & Justification Matrix
Google Play requires strict justification for every permission declared in `AndroidManifest.xml`.

| Permission | Protection Level | Purpose in TalentXcel | Google Play Justification Status |
| :--- | :--- | :--- | :--- |
| `android.permission.INTERNET` | Normal | Connect to Supabase REST, Realtime WebSocket, Firebase FCM, and Cloud Edge Functions. | Automatically granted. Fully compliant. |
| `android.permission.ACCESS_NETWORK_STATE` | Normal | Monitored by `NetworkMonitor.kt` to dynamically route AI requests to `LOCAL_ONLY` when offline. | Automatically granted. Fully compliant. |
| `android.permission.POST_NOTIFICATIONS` | Dangerous (API 33+) | Deliver real-time application status updates, interview alerts, and job match notifications. | Requested with clear in-app context and rationales. Toggleable in settings. |
| `FileProvider` (`in.talentxcel.app.fileprovider`) | App Component | Secure sharing of generated ATS resumes via `file_provider_paths.xml`. | No external storage permissions needed. Uses scoped storage. Fully compliant. |

> [!NOTE]
> TalentXcel requests **zero invasive permissions**: no `ACCESS_FINE_LOCATION`, `READ_CONTACTS`, `CAMERA` (avatar uses system Photo Picker), or `MANAGE_EXTERNAL_STORAGE`. This drastically lowers Play Store review friction and guarantees instant policy clearance.

### 2.3 Account & Personal Data Deletion Requirement
* **Google Play Policy (Effective Dec 2023):** Apps that allow users to create an account from within the app must provide an option to initiate account and data deletion both within the app and via a web URL resource.
* **TalentXcel Audit:**
  * **In-App Flow:** Implemented in [`SettingsScreen.kt`](file:///c:/Users/Arshid.Wani/talentxcel-local/apps/talentxcel-android/app/src/main/java/com/talentxcel/android/presentation/settings/SettingsScreen.kt). Users can tap **"Delete Account & Data"**, triggering an explicit confirmation dialog warning them that profile data, job applications, and on-device AI memory will be permanently erased.
  * **Web Resource Link:** Dedicated web deletion endpoint hosted at `https://talentxcel.in/account/delete`.
* **Verdict:** **COMPLIANT**

### 2.4 Generative AI & On-Device AI Policy Compliance
* **Google Play Generative AI Policy:** Apps containing generative AI features must prevent generating harmful content, provide in-app reporting tools, and ensure transparent AI disclosure.
* **TalentXcel Audit:**
  * **Transparency Badges:** Every AI-generated response renders explicit provenance badges (`🔒 On-Device AI`, `⚡ Hybrid Intelligence`, `☁ TalentXcel Cloud AI`).
  * **Agent Confirmation Flow:** Autonomous tool invocations (applying to jobs, editing profile) require explicit user confirmation (**THINK → PLAN → CONFIRM → EXECUTE**).
  * **PII Minimization Guard:** [`AIPrivacyGuard.kt`](file:///c:/Users/Arshid.Wani/talentxcel-local/apps/talentxcel-android/app/src/main/java/com/talentxcel/android/core/ai/privacy/AIPrivacyGuard.kt) strips emails, phone numbers, and compensation before cloud edge processing.
* **Verdict:** **COMPLIANT**

---

## 3. GOOGLE PLAY DATA SAFETY DECLARATION (QUESTIONNAIRE READY)

When uploading `app-release.aab` to Google Play Console, the developer must complete the **Data Safety Form**. Below is the exact, audited mapping:

### 3.1 Overview
* **Does the app collect or share user data?** **Yes** (Collected for core app functionality; **NOT** shared with third parties or data brokers).
* **Is all data encrypted in transit?** **Yes** (Enforced via HTTPS/TLS 1.3 in `network_security_config.xml`).
* **Can users request data deletion?** **Yes** (In-app and via web URL).

### 3.2 Data Types Collected & Transmitted to Supabase
| Category | Data Type | Purpose | Ephemeral / Stored | Shared with 3rd Party? |
| :--- | :--- | :--- | :--- | :--- |
| **Personal Info** | Name | Account management, profile display | Stored (Supabase `profiles`) | No |
| **Personal Info** | Email address | Authentication (PKCE), notifications | Stored (Supabase `auth.users`) | No |
| **Personal Info** | Phone (Optional) | Job recruiter communication | Stored (Supabase `profiles`) | No |
| **Personal Info** | User IDs | Unique user identification | Stored (`UUID`) | No |
| **Messages/Files**| Resumes / Documents | Job applications | Stored (Supabase Storage) | No |
| **App Activity** | Job views, applications | App functionality, tracking | Stored (Supabase `job_applications`)| No |
| **Device IDs** | FCM Registration Token | Delivering push notifications | Stored (Firebase FCM) | No |

### 3.3 Data Excluded from Cloud (Strictly On-Device)
* **Local AI Semantic Memory:** Stored exclusively in device EncryptedSharedPreferences.
* **Raw Prompt History & Unsent Drafts:** Kept in local Room database / RAM.
* **Private Compensation Notes & Salary Targets:** Evaluated locally on-device.

---

## 4. CODE SIGNING & GOOGLE PLAY APP SIGNING ARCHITECTURE

### 4.1 Architecture
Google Play uses **Play App Signing**:
1. The developer signs the Android App Bundle (`.aab`) with an **Upload Key**.
2. Google Play verifies the Upload Key, strips debugging metadata, and re-signs the delivered APKs with the **Google-Managed App Signing Key**.

```
                LOCAL / CI PIPELINE                              GOOGLE PLAY CONSOLE
       ┌─────────────────────────────────────┐          ┌───────────────────────────────────┐
       │   TalentXcel Release Source Code    │          │     Google Play App Signing       │
       │                  │                  │          │                  │                │
       │                  ▼                  │          │                  ▼                │
       │     bundleRelease (R8 Minify)       │          │   Verify Upload Key Signature     │
       │                  │                  │          │                  │                │
       │                  ▼                  │  Upload  │                  ▼                │
       │    Signed with Upload Keystore      │─────────▶│    Re-sign with Play Signing Key  │
       │       (upload-keystore.jks)         │          │                  │                │
       └─────────────────────────────────────┘          │                  ▼                │
                                                        │   Deliver Optimized Splits to User│
                                                        └───────────────────────────────────┘
```

### 4.2 Production Keystore Generation Procedure
Run the following standard Java `keytool` command to generate the release upload key:

```bash
keytool -genkeypair -v -keystore talentxcel-upload-keystore.jks \
  -alias talentxcel-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=TalentXcel Engineering, OU=Mobile, O=TalentXcel, L=Bengaluru, ST=Karnataka, C=IN"
```

### 4.3 CI/CD Environment Configuration
`app/build.gradle.kts` is configured to read the following environment variables during automated release builds:
* `KEYSTORE_PATH`: Absolute path to `talentxcel-upload-keystore.jks`
* `KEYSTORE_PASSWORD`: Keystore password
* `KEY_ALIAS`: `talentxcel-upload`
* `KEY_PASSWORD`: Key password

If these variables are omitted (e.g., during local verification or developer tests), Gradle safely falls back to the debug signing configuration without breaking compilation.

---

## 5. ANDROID APP LINKS & DIGITAL ASSET LINKS AUDIT

### 5.1 The Two-Fingerprint Requirement for Play App Signing
Because Google Play App Signing re-signs APKs with Google's production certificate, the hosted `assetlinks.json` file **must contain BOTH fingerprints**:
1. **Google Play App Signing SHA-256:** Copied from **Google Play Console → Release → Setup → App Integrity → App signing key certificate**.
2. **Local Upload Key SHA-256:** Extracted via `keytool -list -v -keystore talentxcel-upload-keystore.jks`.

### 5.2 Verification File: `public/.well-known/assetlinks.json`
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "in.talentxcel.app",
      "sha256_cert_fingerprints": [
        "PLAY_APP_SIGNING_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE",
        "LOCAL_UPLOAD_KEYSTORE_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

### 5.3 On-Device Verification Command
To verify App Links on a physical device or emulator without waiting for Play Store indexing:
```bash
adb shell pm get-app-links in.talentxcel.app
```
*Expected verified output:*
```
in.talentxcel.app:
  ID: ...
  Signatures: [...]
  Domain verification state:
    talentxcel.in: verified
    www.talentxcel.in: verified
```

---

## 6. DATA BACKUP & AI MODEL STORAGE GOVERNANCE

### 6.1 Multi-GB Model Weight Backup Risk
If on-device LLM weights (~650 MB to ~1.8 GB) are stored in standard app storage, Android's Google Drive Auto-Backup will attempt to upload them during overnight Wi-Fi charging. This causes:
* Google Drive backup quota exhaustion (25 MB limit for apps).
* System backup errors and Play Console pre-launch report warnings.

### 6.2 Solution Implemented
1. **`ModelManager.kt`:** AI model storage path is explicitly assigned to `context.noBackupFilesDir`:
   ```kotlin
   private val modelsDir = File(context.noBackupFilesDir, "ai_models").apply { mkdirs() }
   ```
2. **`data_extraction_rules.xml` (Android 12+):**
   ```xml
   <data-extraction-rules>
       <cloud-backup>
           <exclude domain="file" path="ai_models" />
           <exclude domain="root" path="no_backup/ai_models" />
       </cloud-backup>
       <device-to-device-transfer>
           <exclude domain="file" path="ai_models" />
           <exclude domain="root" path="no_backup/ai_models" />
       </device-to-device-transfer>
   </data-extraction-rules>
   ```
3. **`backup_rules.xml` (Android 11 and lower):** Excludes `ai_models` from legacy backup.

---

## 7. REAL-DEVICE & FORM FACTOR TESTING MATRIX

Before moving from Closed Testing to Production, testing must be validated across the following hardware tiers:

| Device Tier | RAM / Chipset | Example Test Devices | Key Verification Items |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Flagship)** | 8GB–12GB RAM, Snapdragon 8 Gen 2/3, Tensor G3/G4 | Pixel 8/9, Galaxy S24, OnePlus 12 | Full on-device LLM inference (`txc-pro-3b` candidate), low-latency tokens, edge-to-edge UI |
| **Tier 2 (Mid-range)** | 6GB RAM, Snapdragon 7s Gen 2, Dimensity 7200 | Nothing Phone (2a), Redmi Note 13 Pro | Micro model (`txc-micro-1b` candidate), thermal stability, memory headroom |
| **Tier 3 (Budget / Low-RAM)** | 3GB–4GB RAM, MediaTek Helio G99 | Samsung Galaxy A15, Moto G34 | Graceful fallback to `CLOUD_REQUIRED` without OOM, UI fluid at 60Hz |
| **Tier 4 (Legacy)** | Android 8.0 / 9.0 (API 26–28) | Galaxy S9, Pixel 2 emulator | Vector drawable backward compatibility, PKCE auth without WebAuthn |
| **Tier 5 (Foldable / Tablet)** | Multi-window, foldable inner display | Pixel Fold, Galaxy Z Fold 5, Tablet | Adaptive layout, adjustResize keyboard behavior on split screens |

---

## 8. STEP-BY-STEP GOOGLE PLAY CONSOLE LAUNCH CHECKLIST

```mermaid
flowchart LR
    A["1. Play Console Setup"] --> B["2. Closed Testing Track (20 Testers)"]
    B --> C["3. Pre-Launch Report (Firebase Robo)"]
    C --> D["4. Open Beta / Staged Rollout"]
    D --> E["5. Full Production Release"]
```

### Phase 1: Play Console Application Setup
- [ ] Create App in Google Play Console: Title = `TalentXcel Pro`, Language = `English (United States)`, Free app.
- [ ] Complete App Content Declarations:
  - Privacy Policy URL: `https://talentxcel.in/privacy`
  - Ads: Declare **"No, my app does not contain ads"**.
  - App Access: Provide test login credentials (`demo@talentxcel.in` / test password).
  - Content Rating: Complete IARC questionnaire (Professional / Employment category -> Rating PEGI 3 / Everyone).
  - Target Audience: 18 and older.
  - News Apps / Financial Features: Select Not a news app / Not a financial lending app.
  - Data Safety Form: Paste answers from Section 3 of this document.

### Phase 2: Internal / Closed Testing (20 Testers / 14 Days)
- [ ] Upload `app-release.aab` to **Internal Testing** track.
- [ ] Verify test installation on physical devices.
- [ ] Invite 20 closed testers (required by Google for personal developer accounts).
- [ ] Review Google Play Pre-Launch Report (crashes, ANRs, display issues across automated test devices).

### Phase 3: Production Rollout
- [ ] Copy Google Play App Signing SHA-256 fingerprint into `public/.well-known/assetlinks.json`.
- [ ] Deploy web update (`assetlinks.json`) and verify with `assetlinks` Google API tester.
- [ ] Promote release from Closed Testing to Production with Staged Rollout (20% -> 50% -> 100%).
