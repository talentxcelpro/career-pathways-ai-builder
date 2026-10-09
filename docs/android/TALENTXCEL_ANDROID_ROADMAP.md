# TALENTXCEL NATIVE ANDROID APP — ROADMAP & EXECUTION MILESTONES
## Including On-Device AI & Personal Agent Layer

**Project Target:** `in.talentxcel.app` (TalentXcel Native Android Application)  
**Architecture:** Clean Architecture + MVVM + Jetpack Compose + Supabase Kotlin SDK + FCM + Android App Links + On-Device AI Subsystem  
**Status:** In Active Execution  

---

## 1. COMPREHENSIVE PHASE BREAKDOWN

| Phase | Milestone | Focus Areas | Status |
|---|---|---|---|
| **Phase 1** | **Technical Platform Audit & Architecture Documentation** | Complete audit of repository, Supabase DB tables, auth lifecycle, edge functions, existing Capacitor stubs, API mapping, test strategy, release plan, and On-Device AI architecture addendum. | ✅ **COMPLETED** |
| **Phase 2** | **Project Scaffolding & Gradle Build Engine** | Initialize `/apps/talentxcel-android/`, `build.gradle.kts`, `settings.gradle.kts`, `libs.versions.toml`, Gradle wrapper, Android manifest, Proguard rules, network security config. | ✅ **COMPLETED** |
| **Phase 3** | **Design System & Foundation Layer** | TalentXcel M3 Design Tokens (Colors, Typography, Shapes), reusable components (`TXCButton`, `TXCCard`, `TXCTextField`, `TXCChip`, `TXCAvatar`, `LoadingState`, `EmptyState`, `ErrorState`). | ✅ **COMPLETED** |
| **Phase 4** | **Core Infrastructure & Authentication Engine** | Supabase Kotlin client singleton, PKCE auth repository, EncryptedSharedPreferences token persistence, session recovery, login/signup/forgot password UI & ViewModels. | 🔄 **IN PROGRESS** |
| **Phase 5** | **Navigation & App Shell** | Navigation Compose routing, bottom navigation (`Home`, `Jobs`, `Network`, `Career`, `Me`), top app bar with notification bell & unread counter. | 🔄 **PLANNED** |
| **Phase 6** | **Home Dashboard** | Personalized dashboard, greeting, profile completion meter, recommended opportunities, recent applications ticker, career AI highlights, quick actions. | 🔄 **PLANNED** |
| **Phase 7** | **Native Jobs Engine** | Real-time job feed from `jobs` table, query & multi-facet filters (role, location, salary, experience, remote/hybrid), AI match score badge (`ai_job_matches`), job details sheet, job bookmarks (`saved_jobs`), application submission flow. | 🔄 **PLANNED** |
| **Phase 8** | **Application Tracking (`My Applications`)** | Real-time ATS status sync (`job_applications`), status badge chips (applied, under review, shortlisted, interview, offer, rejected), interview schedules. | 🔄 **PLANNED** |
| **Phase 9** | **Professional Network Experience** | Professional connections list, incoming connection requests, profile discovery/suggestions, follow/unfollow capabilities, network activity feed. | 🔄 **PLANNED** |
| **Phase 10** | **Career Identity & Native Profile** | Profile view & edit (`profiles` table), career overview, experience timeline, education, skills tags, resume preview & management, profile view metrics. | 🔄 **PLANNED** |
| **Phase 11A** | **On-Device AI Architecture & Abstraction** | Provider-agnostic AI layer (`AIOrchestrator`, `LocalAIProvider`, `CloudAIProvider`, `HybridAIProvider`). Replaceable inference engine interface. | 🔄 **IN PROGRESS** |
| **Phase 11B** | **Local Model Runtime & Download Manager** | Local quantized model lifecycle (`ModelManager`, `ModelRegistry`), user opt-in download, pause/resume/delete, integrity verification, storage guards. | 🔄 **IN PROGRESS** |
| **Phase 11C** | **Device Capability & Thermal Detection** | Hardware tier assessment (`DeviceAIManager`): RAM, CPU/NPU, battery health, thermal throttling guards. Automatic capability-based model selection. | 🔄 **IN PROGRESS** |
| **Phase 11D** | **Personal AI Agent Engine** | Personalized career agent (`PersonalAIAgent`), career identity context, user-specific goals, resume intelligence, proactive guidance. | 🔄 **IN PROGRESS** |
| **Phase 11E** | **Local Semantic Memory** | Private encrypted memory (`AgentMemory`, `MemoryManager`), user facts, preferences, conversation recall. User inspection and deletion controls. | 🔄 **IN PROGRESS** |
| **Phase 11F** | **AI Tool System & Permission Guard** | Controlled tools (`searchJobs`, `applyToJob`, `updateProfile`, etc.) with strict schemas and user confirmation dialogs for high-impact actions. | 🔄 **IN PROGRESS** |
| **Phase 11G** | **Privacy Router & Indicators** | `AIRequestRouter` and `AIPrivacyGuard` for local-first decisioning and data minimization. UI privacy indicators (🔒 On-Device vs ☁ TalentXcel AI). | 🔄 **IN PROGRESS** |
| **Phase 11H** | **Hybrid AI Orchestration** | Combined private local reasoning over user context with secure cloud retrieval of real-time job and application data. | 🔄 **IN PROGRESS** |
| **Phase 11I** | **AI Benchmarking & Resource Monitoring** | First-token latency, tokens/sec, battery and memory profiling. | 🔄 **PLANNED** |
| **Phase 11J** | **AI Settings & Privacy Controls** | `Settings → AI & Privacy` UI: on-device preference toggle, memory viewer, model management, data wipe. | 🔄 **IN PROGRESS** |
| **Phase 12** | **Notification Centre & Push Services** | In-app notification inbox (`notifications` table), priority indicators, read/unread states, FCM push service (`FirebaseMessagingService`), token registration (`register-push-token`). | 🔄 **PLANNED** |
| **Phase 13** | **Deep Links & Android App Links** | Digital Asset Links verification, deep-linking into `/jobs/{id}`, `/profile/{slug}`, `/applications/{id}`, notification routing engine. | 🔄 **PLANNED** |
| **Phase 14** | **Web Install Experience & Seamless Handoff** | Smart mobile web banner on `talentxcel.in` to detect Android client, prompt app install or open deep-link natively without SEO disruption. | 🔄 **PLANNED** |
| **Phase 15** | **Analytics, Crashlytics & Security Hardening** | Privacy-preserving telemetry (zero prompt logging), Crashlytics non-fatal error logging, Proguard obfuscation, HTTPS certificate enforcement. | 🔄 **PLANNED** |
| **Phase 16** | **Verification, Test Suite & Release Build** | Unit test suite (Repositories, ViewModels, UseCases, AI Router), integration tests, release bundle (AAB) configuration. | 🔄 **PLANNED** |

---

## 2. PARALLEL EXECUTION & NON-BLOCKING ASSURANCE
- Core product features (Auth, Jobs, Applications, Network, Profile) and the AI architecture are implemented in lockstep.
- If local AI inference is unavailable or disabled on a low-end device, the entire TalentXcel application functions seamlessly with cloud fallback or standard UI.
- Private on-device memory and user tokens are protected with Android Keystore encryption (`AES-256 GCM`).
