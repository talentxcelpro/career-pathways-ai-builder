# UDX v3.1 Friction Calibration & Multi-Dimensional Mechanics

**Standard:** UDX-FRICTION-CALIB-v3.1  
**Operating Mode:** `MODE_B_REALITY = ACTIVE`  
**Purpose:** Elimination of arbitrary score clamping and establishment of orthogonal friction metrics.

---

## 1. Problem: The False Distortion of Composite Clamping

In earlier prototype benchmarks, friction was sometimes reported as a single heuristic number or clamped arbitrarily (e.g. capping an observed 16 down to 10). This obscured the fundamental difference between:
- How fast the computer responded
- How much effort the human had to exert
- How complex the real-world action was to fulfill

UDX v3.1 enforces three strictly orthogonal, un-clamped friction dimensions:

$$\text{Total Friction Experience} = f(\text{System Latency}, \text{Interaction Steps}, \text{Action Procedural Friction})$$

---

## 2. The Three Orthogonal Dimensions

### 2.1 System Latency (`system_latency_ms`)
- **What it measures:** Pure technical API roundtrip duration from HTTP POST intake to JSON response delivery.
- **Empirical Baseline:**
  - In-process domain resolution: **1ms – 11ms** (measured across 6 canonical tests).
  - End-to-end HTTP `/api/udx/resolve`: **363ms median** (100/100 HTTP 200).
- **Epistemic Status:** Directly measured timestamp delta ($t_1 - t_0$). Never modeled or estimated.

### 2.2 User Interaction Friction (`user_interaction_friction` / Steps)
- **What it measures:** The cognitive and physical interaction load imposed on the user before an action is dispatched.
- **Comparison:**
  - **Traditional Search:** Requires query formation, navigating through 10 blue links, overcoming mandatory account registration walls, parsing 18-step application forms, and re-entering resume data manually.
  - **UDX Best Path:** Requires 1 natural intent expression $\rightarrow$ generates authenticated, 1-click executable action directly targeting verified downstream endpoints.
- **Evidence Anchor:** `EVID-EXP-REG-ABANDON-62` (documents 62.1% drop-off rate on legacy 18-step registration walls).

### 2.3 Real-World Action Friction (`action_friction` / 0–100 Scale)
- **What it measures:** The procedural complexity inherent in the real-world fulfillment of the action.
- **Computation:**
  $$\text{Friction Score} = w_{\text{dur}} \cdot \ln(1 + \text{durationDays}) + w_{\text{docs}} \cdot N_{\text{prereqs}} + w_{\text{exec}} \cdot (1 - P_{\text{exec}})$$
- **Calibrated Canonical Domain Examples:**
  1. **Local Trade Dispatch (Plumbing in Varanasi):**
     - Friction Score: **5 / 100** (Upfront ₹199 diagnostic pricing, 2-hour SLA, verified UPI).
  2. **MSME Registration (Udyam Portal):**
     - Friction Score: **6 / 100** (Statutory zero-fee direct filing, Aadhaar OTP authentication).
  3. **Personal Time Audit Protocol:**
     - Friction Score: **15 / 100** (Requires establishing habit consistency over initial 7-day shutdown routine).
  4. **Accredited Degree Intake (AI Master's):**
     - Friction Score: **15 / 100** (Requires academic transcript verification and eligibility compliance).
  5. **Legacy Job Aggregator Portal:**
     - Friction Score: **88 / 100** (High cognitive fatigue, opaque salary bands, 83.4% unresponsiveness).

---

## 3. Calibration Invariant Rules

1. **No Artificial Clamping:** If a complex government or legal action has a friction score of 22, it is reported as 22. It must never be artificially rounded down to 10 or forced into an arbitrary scale.
2. **Distinct Failure Accountability:** If an action fails due to system timeouts, it is logged under `system_latency_ms` and `ACTION_FAILED`. If it requires extensive user documentation, it is logged under `action_friction`.
