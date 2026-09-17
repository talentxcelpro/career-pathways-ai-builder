# UDX v3.3 — Ollama Blind Comparator Qualification Report
**Run Timestamp:** 2026-09-16T11:38:20.181Z
**Endpoint:** http://localhost:11434
**Model Selected:** qwen2.5:7b-instruct-q8_0
**Models Available:** [chatr:business-v1-canonical-q8, chatr:business-v1-q8, chatr:business-v1-raw-q8, qwen2.5:7b-instruct-q8_0, chatr:base-system, chatr:business-latest, chatr:business-v1, chatr:business-v1-raw, qwen2.5:7b-instruct, talentxcel-ceo:latest, chatr:meera-latest, chatr:meera-v1, chatr:coding-latest, chatr:coding-v1, chatr:general-latest, chatr:general-v1, test-model:latest, phi3:mini, llama3.2:3b, phi3:latest]

---

## Handshake — 7-Stage Hard Gate
| Stage | Name | Result |
|-------|------|--------|
| 1 | CONNECTIVITY | ✅ PASSED |
| 2 | MODEL_AVAILABLE | ✅ PASSED |
| 3 | MODEL_RESPONDS | ✅ PASSED |
| 4 | RAW_INTENT_ONLY_PAYLOAD_VERIFIED | ✅ PASSED |
| 5 | LATENCY_CAPTURED | ✅ PASSED |
| 6 | RESPONSE_PARSES | ✅ PASSED |
| 7 | RESULT_STORED | ✅ PASSED |

**Comparator Status:** `COMPARATOR_QUALIFICATION_FAILED`

---

## Phase 1 — 5-Objective Smoke Test
**Status:** FAILED

| ID | Raw Intent | Model Status | Latency | Non-Empty | Min Words | Not Refusal | Actionable | Pass |
|----|------------|--------------|---------|-----------|-----------|-------------|------------|------|
| CAR-01 | frontend developer job in Varanasi with ... | COMPARATOR_MODEL_ERROR | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| EDU-01 | AI master's course under ₹5 lakh... | COMPARATOR_MODEL_ERROR | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| BUS-01 | register MSME in Uttar Pradesh... | COMPARATOR_MODEL_ERROR | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| FIN-01 | reduce monthly expenses by ₹20,000... | COMPARATOR_MODEL_ERROR | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |
| LOC-01 | find a plumber in Varanasi... | COMPARATOR_MODEL_ERROR | N/A | ❌ | ❌ | ❌ | ❌ | ❌ |

## Phase 2 — 30-Objective Blind Qualification Suite
**Status:** SKIPPED

---

## Final Qualification Verdict

```
COMPARATOR_QUALIFICATION_FAILED
World Challenge v4 comparator gate: BLOCKED

Rejection reasons:
  - Phase 1 Smoke Test failed (5/5 objectives failed). Phase 2 skipped.
```

---

> **POLICY REMINDER:** COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN.
> The comparator must actually run and pass qualification to enable World Challenge v4.