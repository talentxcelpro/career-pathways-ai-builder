# CREATOR STUDIO TARGET CONFIGURATION

**Mission ID:** TXC-NETWORK-CREATOR-STUDIO-009  
**Configuration File:** `src/config/creatorTargets.ts`  
**Active Version:** `v2026.11.1`  
**Effective From:** `2026-11-01T00:00:00Z`  
**Review Schedule:** Monthly  

---

## 1. Versioned Monthly Targets Matrix

The centrally managed targets for each subscription tier are defined in `src/config/creatorTargets.ts` as follows:

| Metric Name | Free Tier | Starter (₹199/mo) | Pro (₹499/mo) | Premium (₹999/mo) | Unit |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Qualified Human Reach** | 50 | 100 | 500 | 1,500 | unique viewers |
| **Meaningful Engagements** | 5 | 10 | 50 | 150 | reactions & comments |
| **Technical Articles** | 1 | 1 | 2 | 4 | articles published |
| **Helpful Answers** | 1 | 3 | 10 | 25 | validated answers |
| **Mentorship Contributions** | 0 | 1 | 2 | 4 | completed sessions |
| **Quality Posts** | 2 | 4 | 8 | 12 | published posts |
| **Genuine Audience Growth** | 2 | 5 | 20 | 50 | new connections |

---

## 2. Target Governance Rules

1. **Non-Disqualification Principle**:
   - Targets represent performance momentum benchmarks, **not** minimum barriers to earning.
   - A creator earning 45 out of 50 engagements still receives full reward point credit for all 45 engagements.
2. **Point Scoring Independence**:
   - Scoring points per event are strictly identical across all tiers:
     - 1 Human viewer = $0.25\text{ pts}$
     - 1 Meaningful engagement = $0.25\text{ pts}$
     - 1 Technical article = $20.0\text{ pts}$
     - 1 Quality post = $5.0\text{ pts}$
     - 1 Mentorship session = $25.0\text{ pts}$
     - 1 New connection = $10.0\text{ pts}$
   - Higher tiers do **not** artificially inflate point awards; they set higher target milestones.
3. **Historical Audit Preservation**:
   - Changes to target configurations must increment the config version (`v2026.12.1`, `v2027.01.1`) to ensure historical monthly reporting is never distorted.
