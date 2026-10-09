# TalentXcel Android — Local AI Model & Runtime Benchmark Evaluation

**Document Version:** 1.0  
**Target:** `in.talentxcel.app` (TalentXcel Native Android Application)  
**Architecture:** Provider-Independent On-Device AI Layer  
**Date:** 2026-09-28  

---

## 1. PURPOSE & PRINCIPLES

This document establishes the technical criteria and empirical benchmark framework for selecting on-device language models for TalentXcel. 

**Core Rules:**
- Model identifiers such as `txc-micro-1b` and `txc-pro-3b` are **provisional architecture placeholders**, not locked models.
- TalentXcel's mobile architecture does NOT lock into a single inference engine or single model family.
- Models must be benchmarked specifically for **TalentXcel workloads**:
  1. ATS Resume bullet point rewriting and quantification
  2. Technical skill extraction and categorization
  3. Job description comprehension and match explanation
  4. Behavioral and technical interview question generation
  5. Privacy-first offline career reasoning

---

## 2. CANDIDATE ON-DEVICE LANGUAGE MODELS (2025–2026)

| Model Candidate | Parameter Count | Quantization | Disk Footprint | Working RAM | License & Commercial Redistribution | Primary Strength |
|---|---|---|---|---|---|---|
| **Google Gemma 2 2B** | 2.6B | 4-bit (INT4 / Q4_K_M) | ~1.5 GB | ~2.4 GB | Gemma Terms (Commercial permitted) | Exceptional reasoning and instruction following; official Android MediaPipe integration. |
| **Meta Llama 3.2 1B** | 1.23B | 4-bit (Q4_K_M / Q4_0) | ~720 MB | ~1.3 GB | Llama 3.2 Community License | Ultra-compact, fast execution on mid-tier CPU/GPU, low thermal draw. |
| **Meta Llama 3.2 3B** | 3.21B | 4-bit (Q4_K_M) | ~1.9 GB | ~2.9 GB | Llama 3.2 Community License | High context retention, nuanced career advice, strong drafting capabilities. |
| **Qwen 2.5 1.5B** | 1.54B | 4-bit (Q4_K_M) | ~980 MB | ~1.6 GB | Apache 2.0 (Fully permissive) | High multilingual support (crucial for Indian regional nuances), excellent structured JSON output. |
| **Qwen 2.5 3B** | 3.09B | 4-bit (Q4_K_M) | ~1.85 GB | ~2.8 GB | Apache 2.0 (Fully permissive) | Superior reasoning, code/technical domain understanding, high benchmark scores. |
| **Microsoft Phi-3.5 Mini** | 3.82B | 4-bit (AWQ / INT4) | ~2.2 GB | ~3.4 GB | MIT License | Very strong logical reasoning; higher memory footprint requiring high-tier devices. |

---

## 3. ANDROID LOCAL RUNTIME COMPARISON

The `LocalAIProvider` abstraction allows selecting the best underlying inference runtime without modifying application or agent code:

| Runtime Engine | Hardware Acceleration | Android Integration | Supported Quantizations | Battery & Thermal Efficiency | Production Readiness |
|---|---|---|---|---|---|
| **Google MediaPipe LLM Inference** | GPU (Vulkan/OpenCL), NPU (NNAPI/QNN) | Official Android SDK AAR (`com.google.mediapipe:tasks-genai`) | INT4, INT8 (Gemma, Llama, Falcon) | ⭐⭐⭐⭐⭐ Highly optimized for Qualcomm & MediaTek | **High** (Standard Google solution) |
| **llama.cpp (via Kotlin JNI / libllama)** | CPU (NEON), GPU (Vulkan/OpenCL) | Native NDK JNI bridge | GGUF (Q4_0, Q4_K_M, Q8_0, etc.) | ⭐⭐⭐⭐ Configurable thread count, stable CPU fallback | **High** (Universal compatibility across all Android chips) |
| **ONNX Runtime Mobile** | CPU, GPU, NPU (QNN Execution Provider) | Maven AAR (`com.microsoft.onnxruntime`) | ONNX INT4, FP16 | ⭐⭐⭐⭐ Excellent cross-platform format, high NPU support | **High** (Enterprise standard) |
| **Executorch (Meta PyTorch Mobile)** | CPU, Vulkan, Qualcomm HTP NPU | Kotlin/C++ bridge | PTE INT4 | ⭐⭐⭐ Rapidly maturing, specialized for Llama series | **Medium** (Evolving) |

---

## 4. BENCHMARKING METRICS & PROTOCOL

Each candidate must be evaluated on real Android test hardware across three standardized device tiers:

### 4.1 Device Tiers for Benchmarking
1. **Tier 1 (Entry / Mid):** Qualcomm Snapdragon 680 / 695 / Dimensity 700, 4 GB – 6 GB RAM, Android 12–14.
2. **Tier 2 (Upper Mid):** Snapdragon 778G / 7+ Gen 2 / Dimensity 8200, 8 GB RAM, Android 13–15.
3. **Tier 3 (Flagship):** Snapdragon 8 Gen 2 / Gen 3 / Dimensity 9300, 12 GB+ RAM, Android 14–15 (NPU enabled).

### 4.2 Benchmark Scorecard

| Metric | Target SLA (Tier 1 Mid) | Target SLA (Tier 2 Upper) | Target SLA (Tier 3 Flagship) | Evaluation Method |
|---|---|---|---|---|
| **Model Load Time** | < 2500 ms | < 1500 ms | < 800 ms | Cold start to ready state in RAM |
| **First-Token Latency (TTFT)** | < 1200 ms | < 600 ms | < 300 ms | User tap to first streaming token |
| **Sustained Throughput** | > 8 tokens/sec | > 18 tokens/sec | > 35 tokens/sec | Output token generation speed |
| **Peak RAM Consumption** | < 1.8 GB | < 2.5 GB | < 3.5 GB | Android Profiler RSS allocation |
| **Thermal Delta** | < 4°C rise / 5 min session | < 3°C rise / 5 min session | < 2°C rise / 5 min session | Device battery temperature sensor |
| **Battery Consumption** | < 1.5% per 10 min active chat | < 1.0% per 10 min active chat | < 0.8% per 10 min active chat | Android BatteryManager drain rate |

---

## 5. TASK-SPECIFIC ACCURACY BENCHMARK

Models are evaluated on a 100-point rubric across five standard TalentXcel test prompts:

1. **Prompt 1: Resume Bullet Quantification**
   - *Input:* "Managed a team of developers to build our company app."
   - *Expected Output:* Action verb + scope + quantifiable metric (e.g., "Led a cross-functional engineering team of 7 to deliver high-performance Android client, accelerating daily active users by 35%.").
2. **Prompt 2: Skill Extraction & Categorization**
   - *Input:* Unstructured job description with 15 mixed requirements.
   - *Expected Output:* Categorized list (Languages, Frameworks, Architecture, Cloud, Soft Skills).
3. **Prompt 3: Job Match Explanation**
   - *Input:* User profile (Kotlin, Compose, Coroutines) vs Job (Kotlin, Jetpack Compose, GraphQL, Room).
   - *Expected Output:* Clear strengths analysis and missing skill flag ("Missing GraphQL experience; profile is 85% match").
4. **Prompt 4: Mock Interview Simulation**
   - *Input:* Request for 3 tough technical questions for Senior Mobile Architect.
   - *Expected Output:* Nuanced, non-generic architectural questions covering memory leaks, race conditions, and offline sync.
5. **Prompt 5: Tool Intent Recognition**
   - *Input:* "Apply to the Bengaluru Lead Architect role for me."
   - *Expected Output:* Generates structured tool call intent `applyToJob(jobId="...", confirm=true)` requiring user confirmation.

---

## 6. PROVISIONAL TIER RECOMMENDATIONS

Subject to hardware benchmarking in Phase 11I:

- **Tier 1 (Low / Mid - 4GB to 6GB RAM):**
  - **Recommended Candidate:** **Meta Llama 3.2 1B (Q4_K_M)** or **Qwen 2.5 1.5B (Q4_K_M)**
  - *Rationale:* Memory usage under 1.5 GB; stable execution on CPU NEON without out-of-memory termination.
- **Tier 2 / 3 (Upper Mid / Flagship - 8GB+ RAM):**
  - **Recommended Candidate:** **Google Gemma 2 2B (INT4 via MediaPipe)** or **Meta Llama 3.2 3B (Q4_K_M via Vulkan)**
  - *Rationale:* High semantic accuracy, fast token generation (>25 tok/s on GPU/NPU), rich resume drafting capability.

---

## 7. NEXT STEPS & EXECUTION

1. Maintain placeholder identifiers in `ModelRegistry.kt` as configurable definitions.
2. In Phase 11B/11I, integrate the official MediaPipe / GGUF runner dependencies.
3. Perform device benchmark runs on physical hardware and log results in this document before production AAB signing.
