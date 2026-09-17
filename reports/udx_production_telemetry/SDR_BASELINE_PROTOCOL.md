# UDX v4.0 — Search Displacement Rate (SDR) Baseline Protocol
**Document Version:** `1.0.0-frozen`  
**Effective Window:** Days 1–14 (2026-09-17 to 2026-10-01)  

---

## 1. Objective

To prevent subjective or post-hoc scoring of "search steps eliminated," this protocol pre-registers the exact baseline interaction model used to calculate **Search Displacement Rate (SDR)** throughout the production telemetry window.

---

## 2. Predetermined Interaction Step Models

### A. Traditional SERP Interaction Model (Standard 7-Step Model)
Derived from empirical search task studies (Nielsen Norman Group, Baymard Institute):

1. **Step 1 — Query Entry:** User formulates and types initial keyword phrase into search engine.
2. **Step 2 — SERP Evaluation:** User scans sponsored ads, featured snippets, and top organic links.
3. **Step 3 — First Navigation:** User clicks top organic result to reach 3rd-party aggregator/directory.
4. **Step 4 — Page Filtration & Triage:** User dismisses cookie banners, pop-ups, and scans landing page content.
5. **Step 5 — Pogo-Sticking / Multi-Tab Inspection:** User realizes landing page lacks verified target; navigates back or opens 2–3 alternative listings.
6. **Step 6 — Gating & Registration:** User reaches provider portal; navigates interstitial account gating or lead capture forms.
7. **Step 7 — Action Execution:** User finally submits application, requests quote, or files statutory form.

### B. UDX Interaction Model (Deterministic 2-Step Model)
1. **Step 1 — Intent Articulation:** User expresses raw human need (natural language, speech, or agent signal).
2. **Step 2 — Action Execution:** UDX traverses the possibility graph and directly presents the verified, authenticated target (e.g. direct statutory portal or partner role application link).

---

## 3. Domain-Specific Baseline Interaction Matrix

For intents in specific verticals, the baseline interaction steps are frozen as follows:

| Domain | Baseline SERP Steps ($S_{\text{trad}}$) | Standard UDX Steps ($S_{\text{udx}}$) | Displaced Steps ($\Delta S$) | Theoretical Max SDR |
| :--- | :---: | :---: | :---: | :---: |
| **CAREER** | 8.0 | 2.0 | 6.0 | **75.0%** |
| **EDUCATION** | 10.0 | 2.0 | 8.0 | **80.0%** |
| **BUSINESS** | 12.0 | 2.0 | 10.0 | **83.3%** |
| **FINANCE** | 6.0 | 2.0 | 4.0 | **66.7%** |
| **LOCAL SERVICES** | 5.0 | 2.0 | 3.0 | **60.0%** |
| **PERSONAL** | 4.0 | 2.0 | 2.0 | **50.0%** |

*Refusal Exception: When UDX returns `NO_RELIABLE_PATH`, $S_{\text{udx}} = 1.0$ (immediate honest answer; zero wasted navigation).*

---

## 4. Empirical Calculation Rule

For each resolved cohort event:
$$\text{SDR}_i = \frac{S_{\text{trad}}(\text{domain}_i) - S_{\text{udx}}(\text{actual}_i)}{S_{\text{trad}}(\text{domain}_i)}$$

Average SDR for a cohort is the arithmetic mean across all resolved events:
$$\overline{\text{SDR}} = \frac{1}{N} \sum_{i=1}^{N} \text{SDR}_i$$

*This procedure is frozen and must not be altered during the Day 14 analysis.*
