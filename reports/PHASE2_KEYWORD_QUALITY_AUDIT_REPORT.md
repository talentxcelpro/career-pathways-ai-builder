# Phase 2 — Global 1M Corpus Quality & Semantic Deduplication Audit Report

**Audited At:** 2026-11-25T07:42:55.493Z | **Duration:** 394.49s  
**Dictionary Loaded:** 1,99,814 city keys, 736 country keys, 4,321 state/region keys, 48,020 job title keys, 40,341 skill keys.

## Key Entity Recognition Gains (Real Open Taxonomies vs Phase 1)
- **Distinct Job Titles Hit in Corpus:** `163` roles across `6,39,841` rows (up from 16 roles / 454k rows)
- **Distinct Skills Hit in Corpus:** `77` skills across `6,02,752` rows (up from 16 skills)
- **Distinct Validated Cities Hit:** `293` GeoNames-backed cities (up from 26)
- **Explicit Geo Matches vs Unlocated Fixed:** `9,85,994` explicit geo keywords; `22,175` unlocated keywords corrected from false `IN` default to `GLB`
- **Distinct Semantic Page Groups:** `76,855` unique canonical page groups consolidated out of `10,08,169` strings

## 11-State Lifecycle Distribution (Phase 6)
- `VALIDATED`: 6,06,274
- `NORMALIZED`: 2,99,037
- `INVENTORY_MATCHED`: 70,642
- `NEEDS_REVIEW`: 20,903
- `REJECTED`: 5,365
- `GSC_OBSERVED`: 4,233
- `QUALIFIED`: 1,407
- `OPPORTUNITY`: 229
- `DEDUPLICATED`: 79

## Quality Defects Flagged (Zero Fake Data Hidden)
- `MISSING_DEMAND_DATA`: 10,00,267
- `DUPLICATE_INTENT`: 9,31,314
- `MISSING_INVENTORY`: 6,03,275
- `UNLOCATED_DEFAULT_GEO`: 22,175
- `WEAK_INTENT`: 21,034
- `REDUNDANT_TOKEN_NOISE`: 5,359
- `SYNTACTIC_PERMUTATION`: 1,974
- `UNSUPPORTED_CLAIM`: 6