# UDX v4.0 — Supply-Resolution Gap (SRG) Normalization Specification
**Document Version:** `1.0.0-frozen`  
**Effective Window:** Days 1–14 (2026-09-17 to 2026-10-01)  

---

## 1. Objective

To ensure that Demand and Supply are mathematically comparable without dimensional mismatch, this specification defines the common unit and normalization functions for the **Supply-Resolution Gap (SRG)**.

---

## 2. The Common Unit: Equivalent Transaction Capacity (ETC)

Both demand and supply are converted into **Equivalent Transaction Capacity (ETC)** units per 30-day period:
- **1 ETC of Demand:** Represents 1 qualified, actionable human intent seeker seeking immediate fulfillment within a 30-day window.
- **1 ETC of Supply:** Represents verified provider capacity to fulfill 1 qualified intent within a 30-day window.

---

## 3. Normalization Functions

### A. Demand Normalization Function ($D_{\text{norm}}$)
Raw search impressions or signals are converted to ETC Demand via:
$$D_{\text{norm}}(c) = I(c) \times \text{CTR}_{\text{intent}} \times \Phi(c)$$

Where:
- $I(c)$: Gross impressions for intent cluster $c$ over a 30-day period.
- $\text{CTR}_{\text{intent}}$: Fixed empirical baseline clickthrough rate for high-intent queries ($= 0.082$).
- $\Phi(c)$: Intent Purity Index (0.0 to 1.0), measuring the proportion of queries with genuine immediate fulfillment intent (pre-registered per cluster).

### B. Supply Normalization Function ($S_{\text{norm}}$)
Verified partner listings and institutional inventory are converted to ETC Supply via:
$$S_{\text{norm}}(c) = V(c) \times C_{\text{capacity}}$$

Where:
- $V(c)$: Count of verified, active inventory records matching cluster $c$ in the database.
- $C_{\text{capacity}}$: Monthly fulfillment capacity multiplier per verified provider:
  - **CAREER:** $C_{\text{capacity}} = 1.0$ (1 job listing = 1 hire capacity).
  - **EDUCATION:** $C_{\text{capacity}} = 25.0$ (1 university degree program batch = 25 enrollable seats).
  - **BUSINESS:** $C_{\text{capacity}} = \infty$ (Statutory government portals have unconstrained capacity; gap = 0).
  - **LOCAL SERVICES:** $C_{\text{capacity}} = 20.0$ (1 verified master plumber/electrician = 20 service visits/month).
  - **FINANCE:** $C_{\text{capacity}} = 500.0$ (Financial products/calculators have scalable software capacity).

---

## 4. Supply-Resolution Gap Calculation

$$\text{SRG}(\text{domain}, \text{geography}, \text{period}) = D_{\text{norm}} - S_{\text{norm}}$$

- **$\text{SRG} > 0$ (Supply Deficit):** Demand exceeds verified reality. Action: **DO_NOT_BUILD doorway pages**; trigger partner acquisition queue.
- **$\text{SRG} \le 0$ (Supply Saturated / Balanced):** Verified reality exists to satisfy all incoming intent. Action: **CREATE_ACTION_PATH** or **BUILD_TOOL**.

*This normalization function is frozen for the entire 14-day observation window.*
