# TalentXcel Android — On-Device AI & Personal Agent Specification

**Version:** 1.0  
**Target:** `in.talentxcel.app`  
**Security Standard:** Private by Default, Hardware-Backed Keystore  
**Date:** 2026-09-28  

---

## 1. VISION & ARCHITECTURAL FOUNDATION

TalentXcel treats **On-Device AI as a first-class architectural layer**, providing every user with a personal, private career co-pilot that runs locally on their Android device without exposing personal data to third-party data brokers or remote models unless explicitly required.

```
                    TALENTXCEL
                         │
             ┌───────────┴───────────┐
             │                       │
        CLOUD PLATFORM         ON-DEVICE AI
             │                       │
        Supabase/API           Local AI Runtime
             │                       │
             │                 Small Local LLM
             │                       │
             │                 Personal AI Agent
             │                       │
             └──────────┬────────────┘
                        │
                 USER'S PRIVATE
                  AI WORKSPACE
```

---

## 2. PROVIDER-INDEPENDENT AI ABSTRACTION

The application does NOT hard-code any specific runtime (such as desktop Ollama or a single C++ library). Instead, it implements a pluggable provider abstraction:

```
TalentXcel AI Layer
        │
        ├── AIOrchestrator
        │
        ├── LocalAIProvider
        │       │
        │       └── Android Local LLM Runtime (GGUF / ONNX / MediaPipe)
        │
        ├── CloudAIProvider
        │       │
        │       └── TalentXcel Private Edge Functions (ai-chat)
        │
        └── HybridAIProvider
                │
                ├── Local reasoning
                ├── Local memory
                ├── Secure cloud retrieval
                └── Cloud reasoning when required
```

### 2.1 Provider Contracts
- `AIProvider`: Common interface defining `generateResponse(request)` and `streamResponse(request)`.
- `LocalAIProvider`: Manages execution against on-device quantized models with zero external network connectivity.
- `CloudAIProvider`: Interacts with TalentXcel Supabase serverless functions (`ai-chat`, `passport-ai-coach`).
- `HybridAIProvider`: Coordinates local private reasoning over personal memories with cloud-retrieved real-time data.

---

## 3. DEVICE CAPABILITY & THERMAL MANAGEMENT

`DeviceAIManager` dynamically assesses the physical device before executing local inference:

| Device Tier | Criteria | Model Selected | Behavior |
|---|---|---|---|
| **Low** | < 4 GB RAM or Low Storage | Cloud Default | Prompts user; runs cloud intelligence with data minimization. |
| **Medium** | 4 GB - 6 GB RAM, > 1GB Free Storage | `txc-micro-1b` (Q4_K_M, ~650 MB) | Full local inference enabled for resume analysis, interview prep, and career brainstorming. |
| **High** | > 6 GB RAM, NPU/GPU enabled | `txc-pro-3b` (Q4_K_M, ~1.8 GB) | High-precision local reasoning, deep ATS audit, and career simulations. |

### Battery & Thermal Policy
- Local inference is automatically throttled or deferred if battery level is below 15% and not charging.
- Heavy inference jobs are strictly user-initiated and lifecycle-aware (never running continuous background loops).

---

## 4. MODEL LIFECYCLE & INTEGRITY MANAGEMENT

`ModelManager` and `ModelRegistry` govern model files:
- **Zero Silent Downloads**: Models are downloaded only when the user explicitly opts in via `Settings → AI & Privacy`.
- **Integrity Verification**: Checksums (SHA-256) are calculated prior to loading.
- **User Control**: Users can pause, resume, update, or completely delete downloaded models to reclaim storage.

---

## 5. PRIVACY-FIRST REQUEST ROUTING

The `AIRequestRouter` and `AIPrivacyGuard` programmatic pipeline decides execution targets:

```
User Request
     │
     ▼
AIRequestRouter
     │
 ┌───┴────────────────────────┐
 │ Can local model answer?    │
 └───┬────────────────────────┘
     │
 ┌───┴───┐
YES      NO
 │       │
 │       ▼
 │   Requires Cloud Platform Data?
 │       │
 │   ┌───┴───┐
 │  YES      NO
 │   │       │
 │   │       ▼
 │   │   Hybrid Processing
 │   │   (Local Context + Cloud Data)
 │   │
 ▼   ▼
Execute (Tagged with PrivacyIndicator)
```

### Transparent UI Privacy Badges
- 🔒 **On-Device AI**: Displayed when inference was executed 100% locally on the device.
- ☁ **TalentXcel AI**: Displayed when cloud edge processing was required.
- ⚡ **Hybrid Intelligence**: Displayed when local reasoning was paired with live platform retrieval.

---

## 6. PRIVATE ON-DEVICE MEMORY & SEMANTIC STORE

`MemoryManager` manages local career memory:
- **Memory Categories**: `SHORT_TERM`, `USER_FACT`, `CAREER_GOAL`, `PREFERENCE`, `CONVERSATION`, `TASK`.
- **Security**: Keystore-backed encryption (`AES256_GCM`).
- **Transparency**: Users can view all memories, delete individual facts, or perform a complete wipe at any time.
- **Local Semantic Store**: Vector embedding / similarity search over local resume sections and career notes without cloud leakage.

---

## 7. CONTROLLED AI TOOLS & PERMISSIONS

All agent actions follow the **THINK → PLAN → CONFIRM → EXECUTE → VERIFY → REPORT** workflow:

| Tool | Impact Level | User Confirmation Required? |
|---|---|---|
| `searchJobs` | READ_ONLY | No |
| `getJobDetails` | READ_ONLY | No |
| `getProfile` | READ_ONLY | No |
| `getApplications` | READ_ONLY | No |
| `saveJob` | LOW_IMPACT | No (reversible bookmark) |
| `applyToJob` | **HIGH_IMPACT** | **YES — Requires explicit confirmation dialog** |
| `updateProfile` | **HIGH_IMPACT** | **YES — Requires review before saving** |
| `withdrawApplication`| **HIGH_IMPACT** | **YES — Requires confirmation** |

---

## 8. SUMMARY

The On-Device AI subsystem transforms TalentXcel from a standard mobile client into an autonomous, private, user-aligned career co-pilot that puts data ownership and career velocity in the user's hands.
