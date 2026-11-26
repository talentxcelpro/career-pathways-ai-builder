# 1M Keyword Corpus Streaming Import Report

**Executed At:** 2026-11-25T10:40:56.763Z  
**Source CSV:** `C:\Users\ARSHID~1.WAN\AppData\Local\Temp\tx-si-test-kPWMDF\mini.csv`  
**Tier 1 Warehouse:** `C:\Users\ARSHID~1.WAN\AppData\Local\Temp\tx-si-test-kPWMDF\mini.db`  
**Processing Duration:** 0.05s  

> **Truth-in-Measurement Policy:** Every row in `TalentXcel_1M_SEO_Keyword_Universe.csv` carries `Search volume status = Generated candidate; volume not verified`. Zero volumes were invented or treated as verified demand.

## Core Import Metrics
| Metric | Value |
|---|---|
| Total rows processed | 4 |
| Unique keywords (exact normalized hash) | 2 |
| Duplicate keywords skipped | 1 |
| Near-duplicate semantic variants flagged | 0 |
| Invalid / rejected keywords | 1 |
| Classified keywords | 2 |
| Unclassified keywords | 0 |
| Semantic clusters created | 2 |
| Country coverage count | 2 |
| City coverage count | 1 |
| Industry coverage count | 1 |
| Role coverage count | 1 |
| Skill coverage count | 1 |

## Re-Mapped Canonical Search Intent Distribution
- `job_search`: 1
- `resume_ats`: 1

## Top Canonical TalentXcel Destinations (Fixing Legacy `/career/` Mappings)
- `/jobs/software-engineer/bangalore`: 1 keywords
- `/resume/ats-check`: 1 keywords

## Top 15 Semantic Keyword Clusters
| Cluster Key | Primary Keyword | Members | Hub Route |
|---|---|---|---|
| `job_search|role:software-engineer|in` | software engineer jobs in bangalore | 1 | `/jobs/software-engineer/bangalore` |
| `resume_ats|skill:ats-optimization|glb` | free ats resume check | 1 | `/resume/ats-check` |