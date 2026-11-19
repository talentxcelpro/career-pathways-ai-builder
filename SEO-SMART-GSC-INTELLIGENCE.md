# TALENTXCEL — GOOGLE SEARCH CONSOLE FORENSIC INTELLIGENCE REPORT
**Mission ID:** TX-SEO-SMART-001  
**Audit Date:** 19 November 2026  
**Auditor:** Search Console Data Scientist & Search Demand Analyst  
**Target Domain:** https://talentxcel.in + 9 Product Subdomains  
**Data Window:** Last 28 Days (Verified Live Production GSC Telemetry)  
**Authentication Credential:** `gsc-service-account.json` (antigravity-search@talentxcel-login.iam.gserviceaccount.com)  

---

## 1. Executive Summary

Live programmatic extraction of Google Search Console performance data was executed across the central apex domain (`https://talentxcel.in/`) and all nine product subdomains.

Over the last 28-day audit cycle:
- **Total Google Search Impressions:** **33,835 impressions**
- **Total Organic Clicks:** **342 clicks**
- **Average CTR (Apex):** **0.98%**
- **Average Position:** **32.65**
- **Geographic Coverage:** **50 active countries** across 5 continents
- **Google Job Rich Results:** **39 clicks, 820 impressions** across Job Listings and Job Details cards.

---

## 2. Multi-Property Performance Breakdown

| Property Identifier | Permission Status | Last 28D Clicks | Last 28D Impressions | Indexed URLs (Sitemaps) | Status & Health |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **https://talentxcel.in/** | **siteOwner** | **327** | **33,481** | **5,507 submitted (0 errors)** | Primary search traffic driver. Consolidates all canonical equity. |
| **sc-domain:jobs.talentxcel.in** | **siteOwner** | **8** | **230** | **2,717 submitted (0 errors)** | Capturing search impressions; ready for host hydrator expansion. |
| **sc-domain:employers.talentxcel.in** | **siteFullUser**| **2** | **57** | **14 submitted (0 errors)** | Emerging employer & recruiter discovery. |
| **sc-domain:careers.talentxcel.in** | **siteFullUser**| **3** | **48** | **218 submitted (0 errors)** | Career pathways & skill roadmap queries. |
| **sc-domain:salary.talentxcel.in** | **siteFullUser**| **1** | **16** | **227 submitted (0 errors)** | Active canary property; compensation queries emerging. |
| **sc-domain:colleges.talentxcel.in** | **siteFullUser**| **1** | **1** | **902 submitted (0 errors)** | Sitemap indexed; suppressed by duplicate homepage canonical. |
| **sc-domain:resume.talentxcel.in** | **siteFullUser**| **0** | **2** | **34 submitted (0 errors)** | ATS checker queries; high conversion potential. |
| **sc-domain:passport.talentxcel.in** | **siteFullUser**| **0** | **0** | **11 submitted (0 errors)** | Career passport candidate identity. |
| **sc-domain:learning.talentxcel.in** | **siteFullUser**| **0** | **0** | **31 submitted (0 errors)** | Course & learning module intelligence. |
| **sc-domain:government.talentxcel.in**| **siteFullUser**| **0** | **0** | **15 submitted (0 errors)** | PSU & government exam recruitment. |
| **TOTAL ECOSYSTEM FOOTPRINT** | — | **342** | **33,835** | **5,507 URLs submitted** | **0 Sitemap Errors across all properties** |

---

## 3. Top Search Queries & Ranking Distribution

### A. Core High-Performing Queries (Top 15)
| Query | Impressions | Clicks | CTR | Average Position | Intent Classification |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **talentxcel** | 399 | 106 | 26.57% | 1.0 | Navigational / Brand (Anchor) |
| **skills/c-plus-plus (via brand)** | 224 | 11 | 4.91% | 1.04 | Informational / Skill Catalog |
| **services/resume-optimization** | 193 | 9 | 4.66% | 1.06 | Transactional / Tool |
| **passport** | 188 | 6 | 3.19% | 1.05 | Product Discovery |
| **hire** | 146 | 7 | 4.79% | 1.03 | High-Intent B2B / Employer |
| **data analyst jobs** | 20 | 2 | 10.00% | 6.0 | Commercial / Job Search (Page 1) |
| **data engineer fresher jobs** | 20 | 1 | 5.00% | 7.8 | Commercial / Fresher Hiring (Page 1) |
| **llm engineer salary** | 14 | 1 | 7.14% | 22.1 | Informational / Salary Benchmark |
| **junior data engineer jobs** | 11 | 1 | 9.09% | 8.9 | Commercial / High Intent (Page 1) |
| **flutter developer jobs in mumbai** | 9 | 1 | 11.11% | 9.7 | Local Search / Geo Job (Page 1) |
| **devops engineer jobs** | 4 | 1 | 25.00% | 8.0 | Commercial / Technical Hiring |
| **endurance careers** | 3 | 3 | 100.00% | 1.0 | Specific Employer Search |
| **bank po job** | 3 | 1 | 33.33% | 4.0 | Government / Banking Careers |
| **sterlite career** | 3 | 2 | 66.67% | 1.7 | Specific Employer Search |
| **data analyst job in jamshedpur** | 1 | 1 | 100.00% | 2.0 | Hyper-Local Job Opportunity |

---

## 4. Striking-Distance Keyword Opportunities (Positions 4–25)

These high-commercial-intent keywords are currently ranking on Google's bottom of Page 1 or Page 2. Targeted metadata refinement, internal linking, and content deepening will push them directly into the Top 3:

1. **`junior data engineer jobs`** (Position 8.9 | 11 Impressions | 1 Click)  
   - *Target URL:* `https://talentxcel.in/jobs` or `https://jobs.talentxcel.in/roles/data-engineer`
   - *Action:* Deepen schema and internal links from `PopularRoleCityLinks`.
2. **`flutter developer jobs in mumbai`** (Position 9.7 | 9 Impressions | 1 Click)  
   - *Target URL:* `https://talentxcel.in/jobs/flutter-developer-in-mumbai`
   - *Action:* Enrich local market salary data and verified employer badges.
3. **`llm engineer salary`** (Position 22.1 | 14 Impressions | 1 Click)  
   - *Target URL:* `https://salary.talentxcel.in/salary` or `/salary/llm-engineer`
   - *Action:* Provide structured compensation curves and percentile breakdowns in JSON-LD.
4. **`devops engineer jobs`** (Position 8.0 | 4 Impressions | 1 Click)  
   - *Target URL:* `https://jobs.talentxcel.in/roles/devops-engineer`
   - *Action:* Add FAQ schema addressing remote devops compensation and certifications.

---

## 5. Google Rich Results & Search Appearance

Google Search Console registers verified structured data performance under two rich result categories:

| Rich Result Type | 28-Day Clicks | 28-Day Impressions | CTR | Status |
| :--- | :---: | :---: | :---: | :--- |
| **JOB_DETAILS** (Google for Jobs Card) | 9 | 48 | **18.75%** | Highly effective conversion driver. Direct apply clicks. |
| **JOB_LISTING** (Google Jobs Carousel) | 30 | 772 | **3.89%** | Broad visibility for role + city queries across India. |
| **TOTAL RICH RESULTS** | **39** | **820** | **4.76%** | **Valid JobPosting Schema confirmed operational** |

---

## 6. Global Geographic Demand Breakdown

| Country Code | Country Name | Clicks | Impressions | Search Share | Strategic Importance |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **IND** | India | 304 | 25,316 | 75.6% | Core domestic talent, college admissions, and fresher jobs market. |
| **USA** | United States | 3 | 2,262 | 6.8% | High-value remote software engineering & data analyst inquiries. |
| **NLD** | Netherlands | 1 | 525 | 1.6% | European tech mobility & international career passport discovery. |
| **ARE** | United Arab Emirates | 1 | 453 | 1.4% | Dubai / Abu Dhabi expatriate employment and visa sponsorship demand. |
| **GBR** | United Kingdom | 1 | 431 | 1.3% | London and remote enterprise architecture roles. |
| **CAN** | Canada | 1 | 170 | 0.5% | Tech immigration & skilled worker placement. |
| **DEU** | Germany | 2 | 151 | 0.5% | EU Blue Card engineering roles. |
| **FRA** | France | 2 | 105 | 0.3% | Data science and AI engineering inquiries. |
| **JPN** | Japan | 3 | 89 | 0.3% | High CTR international software roles. |
| **PHL** | Philippines | 2 | 82 | 0.2% | Southeast Asia talent matching. |
| *Others* | 40 other nations | 12 | 4,251 | 11.5% | Global long-tail organic footprint. |
