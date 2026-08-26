# TalentXcel — 100M+ Query Evidence Scale Architecture
## High-Throughput Search Demand Ingestion, Normalization, & Evidence Lake Design

---

## 1. The Critical Architectural Separation

The core principle of TalentXcel's SEO architecture is the strict decoupling of **Search Demand Evidence** from **Published Web Documents**:

```
+--------------------------------------------------------------------+
| 100M+ THEORETICAL COMBINATORIAL SPACE (Entity Graph Permutations) |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
| 10M+ NORMALIZED SEMANTIC INTENT CLUSTERS (Deduplication Engine)   |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
| 1M+ PAGE CANDIDATES EVALUATED (Quality Gate & Inventory Check)    |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
| 10K - 100K+ GENUINELY VALUABLE CANONICAL ASSETS (Published Reality)|
+--------------------------------------------------------------------+
```

> **The Golden Law:** We never mass-produce 100M URLs. We capture 100M evidence signals, cluster them into ~10M unique intents, and publish only the subset of canonical assets that satisfy our 9-criterion anti-doorway quality gate.

---

## 2. Partitioning & Storage Topology

To process 100,000,000+ query evidence records without database contention or memory exhaustion, the Query Evidence Lake implements a 3-tier partitioning hierarchy:

```
evidence_lake/
  +-- {product_surface}/          # 14 Top-Level Partitions (e.g., JOBS, RESUME_ATS)
        +-- {country_code}/       # Regional Isolation (e.g., IN, US, GLOBAL)
              +-- {year_month}/   # Temporal Batches (e.g., 2026-08)
                    +-- {evidence_id}.json
```

### Storage Math at 100M Records
- **Average Record Size:** $\approx 1.8 \text{ KB}$ (compressed JSON with full provenance)
- **Total Uncompressed Storage:** $100{,}000{,}000 \times 1.8 \text{ KB} \approx 180 \text{ GB}$
- **Per-Surface Partition Size:** $\approx 12.8 \text{ GB}$ across 14 surfaces
- **Monthly Ingestion Chunk:** $\approx 1.06 \text{ GB}$ per month per surface
- **Lookup Performance:** Direct partition key `surface + country + year_month` enables $O(1)$ batch reads and $O(\log N)$ indexed binary lookups.

---

## 3. Collision-Resistant Deduplication Pipeline

Every query entering the ingestion engine passes through an immutable SHA-256 normalization hash:

$$\text{evidence\_id} = \text{"ev\_"} + \text{SHA256}(\text{normalized\_query} \parallel \text{surface} \parallel \text{country})[0..7]$$

```
Raw Query: "  Python Developer Jobs In Bangalore 2026!  "
       |
       v (Lowercase, Strip Punctuation, Stopword Removal)
Normalized: "python developer bangalore"
       |
       v (SHA256 Hash + Truncation)
Evidence ID: "ev_d533a1d0"
```

If an incoming query hash matches an existing record in the lake:
1. If incoming source has **higher confidence** (e.g., GSC API vs. Keyword Planner), metrics are updated.
2. If incoming source has **equal or lower confidence**, timestamp and observation count are updated without duplicating the record.

---

## 4. Progressive Population Lifecycle

Query records traverse three distinct confidence states based on empirical data availability:

```
+-----------------------------+     Third-Party Demand Evidence     +-----------------------------+
| POPULATION C:               | ----------------------------------> | POPULATION B:               |
| Theoretical Candidate       |   (Keyword Planner / Competitor)    | Evidenced Demand            |
| (Combinatorial Entity Graph)|                                     | (External Volume Verified)  |
+-----------------------------+                                     +-----------------------------+
                                                                                   |
                                                                                   | Google Search Console
                                                                                   | Impressions Captured
                                                                                   v
                                                                    +-----------------------------+
                                                                    | POPULATION A:               |
                                                                    | GSC Observed Signal         |
                                                                    | (Empirical Reality)         |
                                                                    +-----------------------------+
```

### Transition Gates
1. **$C \rightarrow B$ Promotion:** Occurs when Google Keyword Planner, Ahrefs, or Semrush reports $\ge 100$ monthly searches for the query cluster.
2. **$B \rightarrow A$ Promotion:** Occurs when Googlebot crawls the page and GSC Search Analytics logs $\ge 1$ live impression for the query.
3. **Demotion / Pruning:** If a Population C candidate receives zero external evidence across 180 days, it is archived from the active evaluation queue.

---

## 5. Streaming Batch Ingestion Architecture

```
+-----------------------------------------------------------------------------------+
| Continuous Ingestion Pipeline (scripts/seo/gscIngestionPipeline.ts)              |
+-----------------------------------------------------------------------------------+
       |                                |                               |
       v                                v                               v
[Google Search Console]     [Google Keyword Planner]       [Competitor SERP Crawlers]
(25,000 Rows/Day API)       (Batch Keyword Sync)           (Apna, Naukri, Shiksha)
       |                                |                               |
       +--------------------------------+-------------------------------+
                                        |
                                        v
                    +---------------------------------------+
                    | Ingestion Normalizer & Intent Cluster |
                    | (src/lib/seo/intentClusterEngine.ts)  |
                    +---------------------------------------+
                                        |
                                        v
                    +---------------------------------------+
                    | Quality Gate & Decision Router        |
                    | (src/lib/seo/acquisition/decision...) |
                    +---------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
     [OPTIMIZE_EXISTING Asset]                     [CREATE_CANONICAL Asset]
     - Title / CTR Hook Refresh                    - Static HTML Pre-render
     - FAQ / HowTo Schema Injection                - XML Sub-Sitemap Entry
     - Internal Link Authority Boost               - Quality Gate Registration
```

---

## 6. Freshness & Invariant Enforcement

- **180-Day Reverification Policy:** Records in Population A/B with timestamps older than 180 days are flagged `needs_reverification: true` and scheduled for fresh API synchronization.
- **Zero Fabricated Metrics Invariant:** Unconnected or third-party unavailable sources must emit `null` for all numerical metrics.
- **Strict GSC vs. Live SERP Isolation:** `gsc_average_position` (historical search console mean) is permanently quarantined from `serp_observed_position` (single-point live crawl rank).

---

## 7. Scaling Trajectory (Roadmap to 100M)

| Stage | Horizon | Evidence Lake Records | Population A (GSC) | Population B (Demand) | Canonical Pages |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 14 Seed (Current)** | Day 0 | 30 Seed Records | 12 | 10 | 12,592 |
| **Milestone 1 (GSC Active)** | Month 1 | 25,000 | 5,000 | 15,000 | 13,500 |
| **Milestone 2 (Multi-Source)**| Month 6 | 500,000 | 50,000 | 250,000 | 25,000 |
| **Milestone 3 (Full Graph)** | Month 18 | 10,000,000 | 500,000 | 4,500,000 | 75,000 |
| **Scale Target (Universal)** | Month 36 | 100,000,000+ | 5,000,000+ | 45,000,000+ | 150,000 - 300,000 |

*Note: The canonical page count scales conservatively based on evidence density, not by combinatorial multiplication.*
