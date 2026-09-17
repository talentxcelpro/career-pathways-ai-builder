# UDX v3.3 — Ollama Blind Comparator Qualification Report
**Run Timestamp:** 2026-09-16T13:49:21.813Z
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

**Comparator Status:** `COMPARATOR_QUALIFIED`

---

## Phase 1 — 5-Objective Smoke Test
**Status:** PASSED

| ID | Raw Intent | Model Status | Latency | Non-Empty | Min Words | Not Refusal | Actionable | Pass |
|----|------------|--------------|---------|-----------|-----------|-------------|------------|------|
| CAR-01 | frontend developer job in Varanasi with ... | OBJECTIVE_PASSED | 57623ms | ✅ | ✅ | ✅ | ✅ | ✅ |
| EDU-01 | AI master's course under ₹5 lakh... | OBJECTIVE_PASSED | 52255ms | ✅ | ✅ | ✅ | ✅ | ✅ |
| BUS-01 | register MSME in Uttar Pradesh... | OBJECTIVE_PASSED | 50937ms | ✅ | ✅ | ✅ | ✅ | ✅ |
| FIN-01 | reduce monthly expenses by ₹20,000... | OBJECTIVE_PASSED | 51803ms | ✅ | ✅ | ✅ | ✅ | ✅ |
| LOC-01 | find a plumber in Varanasi... | OBJECTIVE_PASSED | 56461ms | ✅ | ✅ | ✅ | ✅ | ✅ |

## Phase 2 — 30-Objective Blind Qualification Suite
**Status:** PASSED

| # | ID | Domain | Latency (ms) | Pass |
|---|-------|--------|--------------|------|
| 1 | CAR-01 | CAREER | 63815 | ✅ |
| 2 | CAR-02 | CAREER | 57590 | ✅ |
| 3 | CAR-03 | CAREER | 56808 | ✅ |
| 4 | CAR-04 | CAREER | 54607 | ✅ |
| 5 | CAR-05 | CAREER | 56772 | ✅ |
| 6 | EDU-01 | EDUCATION | 65452 | ✅ |
| 7 | EDU-02 | EDUCATION | 54714 | ✅ |
| 8 | EDU-03 | EDUCATION | 54876 | ✅ |
| 9 | EDU-04 | EDUCATION | 61752 | ✅ |
| 10 | EDU-05 | EDUCATION | 68536 | ✅ |
| 11 | BUS-01 | BUSINESS | 89441 | ✅ |
| 12 | BUS-02 | BUSINESS | 78118 | ✅ |
| 13 | BUS-03 | BUSINESS | 81777 | ✅ |
| 14 | BUS-04 | BUSINESS | 85075 | ✅ |
| 15 | BUS-05 | BUSINESS | 81921 | ✅ |
| 16 | FIN-01 | FINANCE | 87835 | ✅ |
| 17 | FIN-02 | FINANCE | 89267 | ✅ |
| 18 | FIN-03 | FINANCE | 84981 | ✅ |
| 19 | FIN-04 | FINANCE | 84363 | ✅ |
| 20 | FIN-05 | FINANCE | 87594 | ✅ |
| 21 | LOC-01 | LOCAL_SERVICES | 84111 | ✅ |
| 22 | LOC-02 | LOCAL_SERVICES | 90361 | ✅ |
| 23 | LOC-03 | LOCAL_SERVICES | 96193 | ✅ |
| 24 | LOC-04 | LOCAL_SERVICES | 92885 | ✅ |
| 25 | LOC-05 | LOCAL_SERVICES | 88148 | ✅ |
| 26 | PER-01 | PERSONAL | 99609 | ✅ |
| 27 | PER-02 | PERSONAL | 99270 | ✅ |
| 28 | PER-03 | PERSONAL | 98168 | ✅ |
| 29 | PER-04 | PERSONAL | 100983 | ✅ |
| 30 | PER-05 | PERSONAL | 115127 | ✅ |

## TVO Aggregate (30-Objective Qualification)
| Metric | Value |
|--------|-------|
| Objectives Evaluated | 30 |
| Avg OLLAMA_RESPONSE_LATENCY | 80338ms |
| Avg TIME_TO_FIRST_USEFUL_ACTION | 80338ms |
| Avg PROXY_TIME_TO_OUTCOME | 80489ms |
| VERIFIED_TIME_TO_OUTCOME | NOT_VERIFIED — benchmark data only |

---

## Final Qualification Verdict

```
COMPARATOR_QUALIFIED
World Challenge v4 comparator gate: PASSED
```

---

> **POLICY REMINDER:** COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN.
> The comparator must actually run and pass qualification to enable World Challenge v4.