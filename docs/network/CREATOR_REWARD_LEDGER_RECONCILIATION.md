# CREATOR REWARD LEDGER & FINANCIAL RECONCILIATION

**Mission ID:** TXC-NETWORK-CREATOR-STUDIO-009  
**Parent Directive:** TXC-NETWORK-MASTER-008  
**Distributable Pool Rate:** 30% of Net Platform Subscription Revenue  
**Status:** SANDBOX AUDIT ONLY (No live payouts permitted)  

---

## 1. Auditable Points Ledger Schema

Every reward point awarded to a creator must be reproducible through verifiable contribution events:

$$\text{Total Points} = \text{round}\Big(0.25 \times V + 0.25 \times E + 20 \times A + 5 \times P + 25 \times M + 10 \times G\Big)$$

* $V$: Verified Human Reach (`profile_views` where `viewer_id != author_id`)
* $E$: Meaningful Engagements (sum of likes, comments, and shares on author's posts)
* $A$: Technical Articles published during the monthly window
* $P$: Quality Posts published during the monthly window
* $M$: Completed Mentorship sessions
* $G$: Net new accepted connections

---

## 2. 30% Net Subscription Reward Pool Model

$$\text{Creator Allocation} = \left(\frac{\text{Creator's Eligible Points}}{\text{Total Network Eligible Points}}\right) \times \left(0.30 \times \text{Net Subscription Revenue}\right)$$

### Financial Safeguards & State Separation:
1. **Estimated (Current Cycle)**:
   - Dynamic real-time estimate based on unit value of points accumulated during the active unfinalized calendar month.
   - Distinctly labeled in the UI as **Estimated (Current Month)**.
2. **Pending Cycle Approval**:
   - Closed monthly cycle points undergoing reconciliation and anti-fraud deduplication.
3. **Approved & Disbursed**:
   - Final authorized payout amounts settled via authorized payment gateway accounts.
   - Displayed as ₹0 during development sandbox mode.

---

## 3. Sandboxing & Gating Policy

* Under no circumstances may frontend actions execute live financial transactions or creator payouts without separate authorized operational clearance.
* The payout tab is permanently sealed with a **Development Sandbox Mode Active** banner until commercial clearinghouse activation.
