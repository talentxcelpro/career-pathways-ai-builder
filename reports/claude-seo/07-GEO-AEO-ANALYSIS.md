# TALENTXCEL × CLAUDE SEO — PHASE 8: GEO, AEO & AI SEARCH VISIBILITY

**Audit Execution Date:** 2 November 2026  
**Auditor Engine:** Antigravity AI Engine & Agentic Readiness Inspector  
**Analyzed Dimensions:** Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), AI Crawler Governance, Entity Disambiguation, and `llms.txt` Protocols

---

## 1. Executive Summary: AI Search & Retrieval Posture

As search engines shift from traditional ten-blue-links to AI Overviews (Google SGE), Perplexity answer engines, and ChatGPT Search, TalentXcel's organic discovery depends heavily on **machine readability, citation eligibility, and entity disambiguation**.

TalentXcel currently exhibits a sophisticated, deliberate posture toward AI agents:
1. **Differentiated Crawler Policy:** Content retrieval bots for live search answers are allowed, while model training scrapers are blocked to protect proprietary talent intelligence.
2. **High Semantic Entity Clarity:** Clean Schema.org definitions establish TalentXcel as an authoritative talent network rather than an unverified blog.
3. **Edge Hydration for AI Crawlers:** AI search crawlers (`PerplexityBot`, `OAI-SearchBot`, `Claude-User`) receive 100% pre-rendered semantic HTML from `api/seo-render.ts` without requiring headless browser JavaScript hydration.

---

## 2. AI Crawler Access Control & Governance

### 2.1 Policy Matrix in `robots.txt`

| Bot Identifier | Bot Nature / Organization | Policy Status | Strategic Rationale |
|---|---|---|---|
| **OAI-SearchBot** | OpenAI Search Answer Engine | **Allowed (`Allow: /`)** | Ensures TalentXcel jobs and career insights are cited in ChatGPT Search queries. |
| **PerplexityBot** | Perplexity AI Search Engine | **Allowed (`Allow: /`)** | Drives high-intent technical job seeker traffic from Perplexity citations. |
| **Claude-User** | Anthropic User-Initiated Fetcher | **Allowed (`Allow: /`)** | Allows Claude users to analyze and reference TalentXcel links. |
| **GPTBot** | OpenAI LLM Training Scraper | **Disallowed (`Disallow: /`)** | Protects proprietary career data, salary percentiles, and employer postings from uncredited training scraping. |
| **ChatGPT-User** | Automated Agent Fetcher | **Disallowed (`Disallow: /`)** | Conserves edge computing bandwidth on high-frequency automated scraping loops. |
| **ClaudeBot** | Anthropic Foundation Training | **Disallowed (`Disallow: /`)** | Prevents mass programmatic crawling of candidate and college corpora. |
| **Google-Extended** | Google Gemini Training Scraper | **Disallowed (`Disallow: /`)** | Protects content while standard Googlebot remains 100% allowed for indexing and AI Overviews. |
| **Bytespider** | ByteDance Scraper | **Disallowed (`Disallow: /`)** | Aggressive crawler with high bandwidth consumption; blocked sitewide. |

---

## 3. Generative Engine Optimization (GEO) & Factual Density

### 3.1 Content Extraction & Citation Eligibility
Using headless extraction standards (`trafilatura` and semantic article parsing), TalentXcel's rendered pages provide:
- **Direct Definitive Answers:** High-intent pathways (e.g., `/career-map/data-engineer`) provide structured competency definitions, core tech stacks, and progression milestones that AI engines extract as bulleted summary snippets.
- **Source Transparency:** Placement statistics on college dossiers and salary percentiles explicitly state data origin (e.g., NIRF data, verified recruiter surveys, and verified employer submissions).
- **Zero Hallucinated Claims:** Unlike spam programmatic SEO sites, pages do not fabricate placement metrics or fictitious salaries, preserving E-E-A-T trustworthiness.

---

## 4. Protocols for Agentic Readiness (`llms.txt` & WebMCP)

### 4.1 Evaluation of `llms.txt`
`llms.txt` is an emerging standard (proposed by Jeremy Howard and adopted by AI search systems) that provides a Markdown summary of a web service for LLM consumption.
- **Current Status:** TalentXcel does not currently publish `/llms.txt` or `/llms-full.txt`.
- **Recommendation:** Implement a curated `/llms.txt` that documents:
  1. The 10 product universes and their specific capabilities.
  2. Public API capabilities (e.g. public job search parameters).
  3. Guidance on how AI agents can direct users to verified Career Passport creation and ATS resume checking.
  4. Explicit privacy restrictions: No private candidate dossiers exist in public search space.

### 4.2 WebMCP Readiness
TalentXcel already includes `@lovable.dev/mcp-js` in `package.json` (line 45) and has an internal MCP gateway (`reports/mcp_gateway_reality_audit.json`).
- Exposing read-only tool definitions for AI agents (e.g., `search_jobs`, `get_salary_benchmark`, `check_college_ranking`) will position TalentXcel as an agent-ready employment infrastructure in the upcoming WebMCP ecosystem.
