# UDX v4.0 — Foresight Clock & Intent Lead Time (T_lead) Rule
**Document Version:** `1.0.0-frozen`  
**Effective Window:** Days 1–14 (2026-09-17 to 2026-10-01)  

---

## 1. Objective

To prevent retrospective or subjective claims of "early trend detection," this rule defines the immutable clock criteria for **Intent Lead Time ($T_{\text{lead}}$)**.

---

## 2. Mathematical Definition

$$T_{\text{lead}} = T_{\text{mainstream}} - T_{\text{first\_observed}} \quad (\text{measured in integer calendar days})$$

---

## 3. Timestamp Definitions & Validation Rules

### A. $T_{\text{first\_observed}}$ (First Empirical Detection)
The immutable timestamp when UDX's `EmergentDiscoveryEngine` or GSC sensor first cataloged the intent cluster:
- **Requirement:** Must have an unedited ProofRecord or database row in `udx_demand_entities` where `first_observed_at == T_first_observed`.
- **Constraint:** Synthetic or manually backdated timestamps are strictly invalid.

### B. $T_{\text{mainstream}}$ (Objective Mainstream Recognition)
To prevent post-hoc cherry-picking of when a trend became "mainstream," $T_{\text{mainstream}}$ is locked to the earliest verified date on which **at least one of the following three objective criteria** is satisfied:

1. **GSC Volume Threshold:** Ingested 30-day GSC impression volume for the cluster exceeds $10,000$ impressions for the first time.
2. **Google Trends Invariant:** Regional Google Trends interest index for the core concept reaches $\ge 50$ (on a 0–100 scale).
3. **SERP Dominance Transition:** The top 3 organic Google SERP positions are captured by tier-1 national aggregator platforms (e.g. Naukri, Indeed, Shiksha, Practo).

---

## 4. Invariant Null Policy (Zero Fabrication)

- **If $T_{\text{mainstream}}$ has not yet occurred:**
  $$T_{\text{lead}} = \mathbf{NULL} \quad (\text{reported as } \texttt{LEAD\_TIME\_UNAVAILABLE})$$
- It is strictly forbidden to estimate, extrapolate, or project $T_{\text{lead}}$ from weak signals alone.
- A cluster remains in `WEAK_SIGNAL` or `EMERGING` trajectory state with `T_lead = NULL` until empirical mainstream confirmation occurs.

*This clock rule is frozen for all evaluations during Days 1–14.*
