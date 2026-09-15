# UDX 100-Objective Empirical Benchmark — Methodology
**Version**: 2.0  
**Corpus Registration**: 2026-09-15  
**Corpus Size**: 100 Pre-registered Real Human Objectives across 6 Domains

---

## 1. Three-Path Blind Comparison Protocol
1. **Path A (Traditional Search)**: Calibrated against published peer-reviewed UX research (NNGroup 2023, Baymard Institute 2023, Google Core Web Vitals P50 2024). Labeled as `TRADITIONAL_PROXY` throughout and excluded from headline scores.
2. **Path B (Generic AI)**: Evaluated directly against local Ollama `phi3:mini` (zero TalentXcel context). The model receives strictly the `rawIntent` string with zero UDX canonicalization or supply metadata.
3. **Path C (UDX Universal OS)**: Evaluated live against `POST /api/udx/resolve` operating in `MODE_B_REALITY = ACTIVE`.

---

## 2. Multi-Stage Separation
- **Time Separation**: `system_latency_ms` != `time_to_first_action_ms` != `time_to_verified_outcome_ms`.
- **Success Separation**: `RESOLUTION_SUCCESS` != `ACTION_SUCCESS` != `OUTCOME_SUCCESS`.
- **Resolution Advantage (RA)**:
  Cost Score = (T_action * 0.25) + (Steps * 0.15) + (Friction * 0.20) + (Uncertainty * 0.20) + ((1 - Quality) * 0.20)
  RA = Cost_GenericAI - Cost_UDX
  - RA > +0.05 -> UDX_WINS
  - RA < -0.05 -> UDX_LOSES
  - Otherwise -> TIE
