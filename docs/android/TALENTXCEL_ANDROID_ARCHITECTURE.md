# TalentXcel Android — Architecture Document
## With On-Device AI & Personal Agent Layer Addendum

**Version:** 2.0 (Enhanced with On-Device AI & Personal Agent Architecture)  
**Date:** 2026-09-28  
**Package:** `in.talentxcel.app`  

---

## 1. SYSTEM TOPOLOGY

TalentXcel Android operates as a **dual-engine client**: connecting to the global cloud platform while running an isolated, private on-device AI workspace.

```
                    TALENTXCEL PLATFORM
                             │
             ┌───────────────┴───────────────┐
             │                               │
       CLOUD PLATFORM                  ON-DEVICE AI
             │                               │
      Supabase REST/Realtime           Local AI Runtime
      Edge Functions / Auth                   │
             │                         Local Quantized LLM
             │                               │
             │                         Personal AI Agent
             │                               │
             └───────────────┬───────────────┘
                             │
                      USER'S PRIVATE
                       AI WORKSPACE
```

---

## 2. ON-DEVICE AI & PERSONAL AGENT SUBSYSTEM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AI ORCHESTRATOR                                 │
│  Coordinates user requests, privacy inspection, tool dispatch, & response  │
└──────┬──────────────────────┬──────────────────────┬─────────────────┬──────┘
       │                      │                      │                 │
┌──────▼──────┐       ┌───────▼───────┐       ┌──────▼──────┐   ┌──────▼──────┐
│  PRIVACY    │       │   REQUEST     │       │   TOOL      │   │  CONTEXT &  │
│   GUARD     │       │   ROUTER      │       │  REGISTRY   │   │   MEMORY    │
│ Minimization│       │ Local vs Cloud│       │ Permissions │   │ Short/Long  │
└─────────────┘       └───────┬───────┘       └─────────────┘   └─────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                                 │
      ┌──────▼────────┐                 ┌──────▼────────┐
      │  LOCAL AI     │                 │   CLOUD AI    │
      │  PROVIDER     │                 │   PROVIDER    │
      │               │                 │               │
      │ • Local LLM   │                 │ • Edge Fns    │
      │   Runtime     │                 │ • Realtime DB │
      │ • Device      │                 │ • Cloud       │
      │   AI Manager  │                 │   Reasoning   │
      │ • Model       │                 │               │
      │   Registry    │                 │               │
      └───────┬───────┘                 └───────┬───────┘
              │                                 │
              └────────────────┬────────────────┘
                               │
                       ┌───────▼───────┐
                       │   HYBRID AI   │
                       │   PROVIDER    │
                       │ Local reasoning│
                       │ + Cloud fetch │
                       └───────────────┘
```

---

## 3. CORE AI ABSTRACTIONS

### 3.1 AI Providers
- **`LocalAIProvider`**: Executes inference entirely on-device using quantized models (GGUF/ONNX/TFLite/MediaPipe). Zero data leaves the device.
- **`CloudAIProvider`**: Dispatches requests requiring global data or massive compute to TalentXcel Edge Functions (`ai-chat`, `passport-ai-coach`, `enhance-resume`).
- **`HybridAIProvider`**: Combines local reasoning over private context with cloud-retrieved live data (e.g. live job postings).

### 3.2 AI Request Router (`AIRequestRouter`)
Programmatically categorizes tasks into:
1. **LOCAL_ONLY**:
   - Resume bullet rewriting
   - Skills extraction from local documents
   - Interview prep questions
   - Career brainstorming
   - Summarizing past conversations
   - Document analysis
2. **CLOUD_REQUIRED**:
   - Live job searches across Supabase
   - Real-time application status queries
   - Global employer verification
   - Market salary benchmark aggregation
3. **HYBRID**:
   - Comparing local profile against newly fetched jobs
   - Gap analysis between user skills and cloud job requirements

### 3.3 Device Capability Detection (`DeviceAIManager`)
Infers hardware tier dynamically:
- **Low Tier (< 4GB RAM, low CPU/GPU)**: Cloud AI default, lightweight local tasks only.
- **Medium Tier (4GB - 8GB RAM)**: Compact quantized models (~1B - 2B parameters).
- **High Tier (> 8GB RAM, NPU/GPU enabled)**: High-precision quantized models (~3B - 4B parameters).
- **Thermal & Battery Guards**: Suspends local inference when battery < 15% or device throttling.

### 3.4 Model Management (`ModelManager`)
- Explicit user opt-in for model downloads (zero silent downloads).
- Checksum verification (SHA-256).
- Pause / resume / cancel / delete downloads.
- Storage requirement auditing.

### 3.5 Personal AI Memory (`AgentMemory`)
Stored in encrypted Room tables:
- **ShortTermMemory**: Current active session context.
- **UserFacts**: Key user declarations (preferred roles, work style).
- **CareerMemory**: Experience highlights, achievements, target salaries.
- **Preferences**: Remote preference, commute tolerance, relocation.
- **User Control**: Full view, edit, and wipe capabilities under `Settings -> AI & Privacy`.

### 3.6 Tool System & Permissions (`AgentPermissionManager`)
Agent actions follow the **THINK -> PLAN -> CONFIRM -> EXECUTE -> VERIFY -> REPORT** cycle:
- Read-only tools (`searchJobs`, `getProfile`, `getApplications`) can execute within session boundaries.
- State-mutating tools (`applyToJob`, `updateProfile`, `withdrawApplication`) **strictly require user confirmation dialogs**.

---

## 4. FULL REPOSITORY ARCHITECTURE

```
apps/talentxcel-android/
├── app/
│   ├── src/main/java/com/talentxcel/android/
│   │   ├── TalentXcelApplication.kt
│   │   ├── MainActivity.kt
│   │   │
│   │   ├── core/
│   │   │   ├── ai/                      # [NEW] On-Device & Personal AI Subsystem
│   │   │   │   ├── AIOrchestrator.kt
│   │   │   │   ├── agent/
│   │   │   │   │   ├── PersonalAIAgent.kt
│   │   │   │   │   └── AgentState.kt
│   │   │   │   ├── router/
│   │   │   │   │   ├── AIRequestRouter.kt
│   │   │   │   │   └── ProcessingTarget.kt
│   │   │   │   ├── runtime/
│   │   │   │   │   ├── AIProvider.kt
│   │   │   │   │   ├── LocalAIProvider.kt
│   │   │   │   │   ├── CloudAIProvider.kt
│   │   │   │   │   └── HybridAIProvider.kt
│   │   │   │   ├── model/
│   │   │   │   │   ├── ModelManager.kt
│   │   │   │   │   ├── ModelRegistry.kt
│   │   │   │   │   └── DeviceAIManager.kt
│   │   │   │   ├── memory/
│   │   │   │   │   ├── AgentMemory.kt
│   │   │   │   │   ├── MemoryManager.kt
│   │   │   │   │   └── LocalSemanticStore.kt
│   │   │   │   ├── privacy/
│   │   │   │   │   ├── AIPrivacyGuard.kt
│   │   │   │   │   └── PrivacyIndicator.kt
│   │   │   │   └── tools/
│   │   │   │       ├── AITool.kt
│   │   │   │       ├── AIToolRegistry.kt
│   │   │   │       └── AgentPermissionManager.kt
│   │   │   │
│   │   │   ├── auth/                    # Supabase PKCE Auth
│   │   │   ├── network/                 # Supabase Client Singleton
│   │   │   ├── database/                # Room DB + Encrypted entities
│   │   │   ├── notifications/           # FCM Push + Local NotificationManager
│   │   │   ├── navigation/              # Compose Navigation + App Links
│   │   │   ├── security/                # Android Keystore SecureStorage
│   │   │   └── analytics/               # Privacy-preserving event metrics
│   │   │
│   │   ├── data/                        # Repositories, Room DAOs, Supabase sources
│   │   ├── domain/                      # Use Cases, Models, Repository interfaces
│   │   └── presentation/                # Compose UI, M3 Theme, ViewModels
```
