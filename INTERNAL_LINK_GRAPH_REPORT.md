# TalentXcel — Internal Link Graph & Topical Authority Report
**Generated**: 2026-08-25T14:17:17.450Z

## 1. Graph Architecture Model
Authority flows contextually across 4 interconnected tiers:

```
                    TALENTXCEL SERVICES (/company/talentxcel)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
   COMMERCIAL SERVICES           TOPIC HUBS                   JOB SEARCH
    (/services/*)               (/topics/*)                    (/jobs)
         │                            │                            │
   ├─ AI Recruitment            ├─ Artificial Intelligence   ├─ Active Openings
   ├─ Staffing & RPO            ├─ Recruitment & Careers     ├─ Role/Location Hubs
   ├─ IT Consulting             ├─ Technology & Leadership   └─ ATS Resume Tools
   └─ Career Coaching           └─ Resume Writing
```

## 2. Tier-1 Hub Connectivity
- **Zero Orphan Tier-1 Pages**: All 28 Core Hubs maintain explicit parent, contextual, and cross-entity link relationships.
- **Bi-directional Flow**: Service pages link back to the Company Hub and related Topic Hubs; Topic Hubs link down to relevant jobs and commercial capabilities.
