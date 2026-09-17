# UDX v4.0 — 01: The Intent Universe
## Next-Generation Intent-First Discovery Architecture

### 1. The Paradigm Shift: Keyword vs Intent

Traditional search marketing treats the keyword as the atomic unit of demand:
$$\text{Keyword} \to \text{Landing Page} \to \text{Crawl} \to \text{Index} \to \text{Rank} \to \text{Click} \to \text{Conversion}$$

This paradigm has broken down due to keyword inflation, automated programmatic spam, and search engine pogo-sticking. 

In **UDX v4.0**, the atomic unit of discovery is the **Human Intent**:
$$\text{Signal} \to \text{Human Intent} \to \text{World Understanding} \to \text{Verified Reality} \to \text{Possibility Graph} \to \text{Best Path} \to \text{Action} \to \text{Outcome} \to \text{Learning} \to \text{Foresight}$$

A search query is merely a **signal**. Multiple queries across languages, devices, and geographies represent the exact same underlying human objective.

---

### 2. Transformation Pipeline

UDX transforms raw search observations through a 5-stage pipeline:
$$\text{RAW QUERIES} \to \text{NORMALIZED SIGNALS} \to \text{INTENT CLUSTERS} \to \text{CANONICAL INTENTS} \to \text{INTENT TRAJECTORIES}$$

```mermaid
flowchart LR
    A[Raw Queries: GSC, Telemetry, Internal] --> B[Normalized Signals]
    B --> C[Intent Clusters]
    C --> D[Canonical Intents]
    D --> E[Intent Trajectories & Velocity]
```

1. **Raw Queries:** Ingested from Google Search Console sensor, internal site search, telemetry logs, and agent query logs.
2. **Normalized Signals:** Lowercased, stripped of punctuation and stopword artifacts, tagged with cryptographic Evidence ID and confidence score.
3. **Intent Clusters:** Grouped semantically by target entity, geography, and domain without generic career collapse.
4. **Canonical Intents:** Synthesized into a singular actionable statement of human purpose (e.g. *"AI master's course under ₹5 lakh"*).
5. **Intent Trajectories:** Monitored over rolling 7-day and 30-day windows to compute velocity ($\frac{dD}{dt}$) and acceleration ($\frac{d^2D}{dt^2}$).

---

### 3. Intent Universe Schema

Every entry in the `IntentUniverse` contains:
- `intentId`: Stable UUID / slug identifying the canonical intent
- `canonicalIntent`: Human-readable statement of purpose
- `domain`: `CAREER` | `EDUCATION` | `BUSINESS` | `FINANCE` | `LOCAL_SERVICES` | `PERSONAL`
- `querySignals`: Array of verified GSC/telemetry query observations
- `entitySignals`: Identified roles, skills, institutions, locations, and tools
- `geography`: Explicit country, state/region, and municipality/city
- `audience`: `fresher` | `employer` | `career_changer` | `student` | `professional`
- `stage`: `WEAK_SIGNAL` | `EMERGING` | `ACCELERATING` | `MAINSTREAM` | `SATURATED`
- `demand`: Aggregate impressions, clicks, average position, and estimated search volume
- `velocity`: Rolling trajectory rate of change
- `supply`: Real-time count of verified active inventory, matching pages, and executable action paths
- `outcome`: Resolved count, action completion count, verified outcome count, and computed IRR
- `epistemicStatus`: `CONFIRMED` | `HYPOTHESIS` | `REFUTED`

---

### 4. Canonical Intent Clusters in TalentXcel

| Canonical Intent | Domain | Stage | Demand (30d) | Verified Supply | Supply Status |
|---|---|---|---|---|---|
| Frontend developer job in Varanasi | CAREER | MAINSTREAM | 4,280 imp | 16 roles | BALANCED |
| Senior backend engineer remote Golang | CAREER | ACCELERATING | 2,940 imp | 24 roles | DEMAND_EXCEEDS |
| AI master's course under ₹5 lakh | EDUCATION | ACCELERATING | 3,120 imp | 4 programs | BALANCED |
| AKTU state admissions B.Tech CSE | EDUCATION | MAINSTREAM | 5,890 imp | 12 colleges | DEMAND_EXCEEDS |
| Statutory zero-fee MSME enterprise registration | BUSINESS | MAINSTREAM | 6,450 imp | 1 statutory gateway | BALANCED |
| Varanasi emergency plumbing guild dispatch | LOCAL_SERVICES | EMERGING | 890 imp | 4 guild providers | BALANCED |
| High-yield risk-free 40% returns | FINANCE | REFUTED | 1,240 imp | 0 (Fraud boundary) | NO_VERIFIED_SUPPLY |

---

### 5. Multi-Sensor Grounding

UDX does not treat Google Search Console as "the truth". GSC is treated as **one sensor among many**:
- **GSC Sensor:** Observes what queries Google decides to sample and serve impressions for.
- **First-Party Site Search:** Captures unconstrained user queries entered directly on `talentxcel.in`.
- **Telemetry Sensor:** Captures user navigation behavior, dropdown selections, and pogo-stick bounces.
- **Agent Discovery Sensor:** Captures structured programmatic API calls initiated by autonomous LLM agents.

Every observation is committed to the immutable `ProofLedger` with source timestamp and evidence reference.
