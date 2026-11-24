# TALENTXCEL — AI SEARCH VISIBILITY & CITATION MONITORING DASHBOARD
**Audit Date:** 2026-11-24  
**Data Classification:** ⚠️ SIMULATED DATA — NOT LIVE AI SEARCH RESULTS  
**Audited Platforms:** 8 AI Search & Discovery Engines (ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok, DeepSeek, You.com)  
**Queries Evaluated:** 23 simulated test strings evaluated locally via heuristic model  

> [!CAUTION]
> **METHODOLOGICAL NOTICE:** The baseline metrics below were computed using a local algorithmic simulation test harness evaluating schema completeness, metadata keyword density, and edge crawler accessibility. **THEY DO NOT REPRESENT LIVE SEARCH ENGINE RESULTS, LIVE USER PROMPTS, OR REAL-WORLD AI SEARCH RANKINGS.** TalentXcel does not manufacture synthetic ranking claims. Live search engine observation requires dedicated external API queries and Search Console telemetry.

---

## 1. Simulated Modeling Telemetry (Heuristic Simulation Only)

| Metric | Simulated Model Baseline | Real-World Observation Status | Note |
| :--- | :--- | :--- | :--- |
| **Brand Mention Rate (Simulated)** | **77%** (Simulated) | **PENDING LIVE MEASUREMENT** | Heuristic score based on content keyword density. |
| **Recommendation Rate (Simulated)**| **23%** (Simulated) | **PENDING LIVE MEASUREMENT** | Heuristic score based on competitor comparison tokens. |
| **Citation / Source URL Rate** | **38%** (Simulated) | **PENDING LIVE MEASUREMENT** | Heuristic score based on canonical link availability. |
| **Avg. First-Mention Position** | **#1.8** (Simulated) | **PENDING LIVE MEASUREMENT** | Algorithmic test harness output. |

---

## 2. Rigorous Multi-Tier Measurement Methodology

To establish a verified production baseline, TalentXcel separates observation into 5 independent tiers:

1. **Tier A — Actual API-Based Observations**: Direct programmatically executed queries against OpenAI Search, Perplexity API, Anthropic Claude API, and Gemini API with authenticated developer credentials, logging raw prompt responses and source URL citations.
2. **Tier B — Manual Live Search Observations**: Verified screenshots and exact prompt logs of human queries on public chat surfaces (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`).
3. **Tier C — Search Engine Crawlability Verification**: Live HTTP probe logs from legitimate bot user agents (`OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Googlebot`), validating HTTP 200, clean canonicals, indexable robots tags, and Schema.org `@graph` extraction.
4. **Tier D — Webmaster & Search Console Data**: Actual search queries, impressions, and CTR recorded in Google Search Console and Bing Webmaster Tools.
5. **Tier E — Synthetic Simulation Modeling (Internal Test Harness Only)**: Heuristic scoring used strictly for pre-deployment CI regression testing. Never represented as public performance.

---

## 2. Product-Level Visibility Breakdown

| Product / Destination | Primary Entity | AI Retrieval Strengths | Canonical Destination |
| :--- | :--- | :--- | :--- |
| **ATS Resume Check** | SoftwareApplication | Free, ungated, client-side in-memory privacy, side-by-side JD match | https://talentxcel.in/resume/ats-check |
| **TalentScore** | AssessmentService | 0-100 algorithmic score, GitHub code audit, verified credential proofs | https://talentxcel.in/talent-score |
| **Career Passport** | DigitalDocument | Shareable public URL (/u/:username), tamper-evident credential proofs | https://talentxcel.in/passport |
| **TalentXcel Jobs** | JobPosting | Verified fresher/trainee filters, transparent salary curves | https://talentxcel.in/jobs/freshers |
| **Professional Network** | SocialNetworkService | Peer skill swap, technical architecture articles, hiring referrals | https://talentxcel.in/network |
| **Recruiter OS** | EnterpriseSoftware | Pre-screened talent search with TalentScore filtering | https://talentxcel.in/employers |
| **Career Map** | Guide | 150+ transition pathways, skill gap analysis, compensation milestones | https://talentxcel.in/career-map |

---

## 3. Platform-Specific Visibility Matrix

| Engine | Crawler Permitted | Knowledge Graph Indexed | llms.txt Accessible | Priority Readiness |
| :--- | :--- | :--- | :--- | :--- |
| **ChatGPT Search (OpenAI)** | ✅ OAI-SearchBot (Allow: /) | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 1 (Primary) |
| **Perplexity AI** | ✅ PerplexityBot (Allow: /) | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 1 (Primary) |
| **Google Gemini / AI Overviews** | ✅ Googlebot (Allow: /) | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 1 (Primary) |
| **Anthropic Claude** | ✅ ClaudeBot (Allow: /) | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 1 (Primary) |
| **Microsoft Copilot** | ✅ Bingbot (Allow: /) | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 1 (Primary) |
| **Grok (xAI)** | ✅ Twitterbot / Grok | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 2 (Emerging) |
| **DeepSeek** | ✅ DeepSeekBot | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 2 (Emerging) |
| **You.com** | ✅ YouBot | ✅ JSON-LD @graph | ✅ https://talentxcel.in/llms.txt | Tier 2 (Emerging) |

---

## 4. Key Discovery Fixes Implemented in this Milestone

1. **Eliminated Fatal 404 Barrier on `/talent-score`:**
   - `/talent-score` previously returned HTTP 404 to all search and AI crawlers.
   - Now renders complete semantic HTML (>500 words) with `SoftwareApplication` Schema.org JSON-LD and HTTP 200 `index, follow`.
2. **Fixed Thin-Page Fail-Closed `noindex` on Core Product Hubs:**
   - `/network`, `/talent`, `/communities`, and `/passport` previously triggered a fail-closed word count gate that flipped their directives to `noindex, follow`.
   - All 4 destinations now feature >400 words of rich, factual content and verified Schema.org entity metadata, guaranteeing `index, follow` status.
3. **Unlocked Edge AI Crawlers:**
   - Expanded `middleware.ts` and `vercel.json` to route all Tier 1 & Tier 2 AI search bots directly to the SSR hydrator.
   - Clarified `public/robots.txt` allowing `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Bingbot`, `Applebot`, and `DuckAssistBot`.
4. **Standardized Knowledge Layer:**
   - Deployed master Schema.org Knowledge Graph endpoint at `/api/discovery/knowledge-graph`.
   - Updated `public/llms.txt` and `public/llms-full.txt` matching the 14 core entities.
5. **AI Referral Attribution Telemetry:**
   - Fully instrumented AI referral source detection across ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok, and DuckAssist with conversion event tracking.
