# TalentXcel — Google Indexation & Crawl Baseline Audit
**Document**: `SEO_GOOGLE_INDEXATION_BASELINE.md`  
**Property**: `sc-domain:talentxcel.in`  
**Date**: August 25, 2026  
**Auditor**: Senior Principal Technical SEO Architect & Google Search Infrastructure Lead  

---

## 1. Executive Summary & Verified Googlebot Crawl Statistics
Based on Google Search Console Crawl Stats (Settings > Crawl Stats for `talentxcel.in` updated through August 23, 2026):

| Crawl Metric | Value Observed in GSC | Engineering Analysis |
| :--- | :--- | :--- |
| **Total Crawl Requests** | **187,000+** | Massive Googlebot discovery surge reflecting sitemap and link graph ingestion |
| **Total Download Size** | **68.7 GB** | Complete static HTML and pre-rendered resource fetching |
| **Average Response Time** | **81 ms** | **Superior server performance** (well below Google's 300ms latency threshold) |
| **Peak Daily Crawl Volume** | **70,398 requests** on Aug 23 | Googlebot aggressively crawling directory indexes and canonical landing pages |

> [!IMPORTANT]
> **CRAWL $\neq$ INDEX**: While 187K crawl requests confirm Googlebot discovery, Google independently evaluates page value, content depth, search intent, and canonical uniqueness before committing URLs to the primary index.

---

## 2. Platform URL Inventory vs. Indexing Pipeline

| Category | URL Count | Status / Pipeline Stage | Quality Tier |
| :--- | :--- | :--- | :--- |
| **Published Sitemap URLs** | 12,744 | Submitted across 17 segmented sub-sitemaps | Class A & Class B |
| **Static Pre-rendered Documents** | 10,429 | Pre-rendered in `dist/` with full semantic DOM | Class A Priority |
| **Active Verified Jobs** | 6 | Live in DB; 100% valid JobPosting JSON-LD | Class A Priority |
| **Commercial Services** | 10 | Live with Service Schema & conversion CTAs | Class A Priority |
| **Semantic Topic Hubs** | 11 | Live with CollectionPage Schema & subtopics | Class A Priority |
| **Public Feed Posts** | 490 sitemapped | Live with SocialMediaPosting Schema | Class B Discovery |
| **Accredited Indian Colleges** | 10,250 | 901 Tier-A (NIRF/CTC) + 9,349 Tier-B | Class A & Class B |
| **Global Programs & Scholarships**| 59 | Verified tuition-free & funded degrees | Class A Priority |
| **Editorial & Resource Guides** | 1,719 | Sitemapped with Article/WebPage Schema | Class B Discovery |
| **Private / Utility Routes** | 40+ | **Blocked in robots.txt & excluded from sitemaps** | NOINDEX |

---

## 3. Google Search Console Status Breakdown (Observed Data)

| GSC Page Status Classification | Volume | Root Cause / Architecture Solution |
| :--- | :--- | :--- |
| **Job Postings (Enhancements)** | **100% Valid (0 Errors)** | Missing title error resolved; 3 valid items detected on live inspection |
| **Discovered — currently not indexed** | ~9,288 | Googlebot has received URLs in sitemaps and is scheduling crawl passes based on authority flow |
| **Crawled — currently not indexed** | ~6,298 | URLs crawled during the 187K spike currently in Google's quality/intent evaluation pipeline |
| **Page with redirect** | ~4,200 | Historical path normalization (e.g. legacy trailing slash and ID variations) resolving to clean canonicals |
| **Not found (404)** | ~19,681 (historical) | Discontinued legacy paths from experimental crawls; canonical routes now hardened |

---

## 4. Crawl Budget Optimization Strategy
1. **Reduce Wasted Crawls**: Ensure `robots.txt` strictly blocks parameter spam (`?utm_*`, `?fbclid`, `?sort=`, `?page=`) so Googlebot spends 100% of crawl budget on high-value canonical URLs.
2. **Prioritize Tier-1 Discovery**: Route internal link equity from the Homepage and Company Entity (`/company/talentxcel`) down to Commercial Services (`/services/*`), Active Jobs (`/jobs/*`), and Topic Hubs (`/topics/*`).
3. **Eliminate Thin Content Risk**: Maintain strict pre-indexing quality thresholds ($A+/A$) on high-demand pages and suppress thin placeholder entries.
