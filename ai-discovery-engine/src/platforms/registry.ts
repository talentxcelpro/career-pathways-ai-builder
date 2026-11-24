/**
 * ai-discovery-engine/src/platforms/registry.ts
 * Global AI Platform Registry detailing real retrieval mechanics, crawler agents,
 * API capabilities, and testing methodologies across 15 priority & discovery engines.
 */

import { AiPlatformProfile } from '../types';

export const AI_PLATFORM_REGISTRY: AiPlatformProfile[] = [
  // 1. ChatGPT Search (OpenAI)
  {
    id: 'chatgpt-search',
    name: 'ChatGPT Search (OpenAI)',
    operator: 'OpenAI, Inc.',
    tier: 1,
    crawlerUserAgent: 'OAI-SearchBot / ChatGPT-User',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Search mode requires Responses API with web search tool flag or Plus/Enterprise session; strict bot verification on dynamic JS.',
    testingMethodology: 'Query submission via OpenAI Responses API with search_recency and web_search enabled; inspect citation annotations.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'STRUCTURED_FOOTNOTES',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Official OpenAI SearchBot Documentation & Verified User-Agent Logs',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 2. Google Gemini
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    operator: 'Google LLC',
    tier: 1,
    crawlerUserAgent: 'Google-Extended / Googlebot',
    publicRetrievalMethod: 'API_GROUNDING',
    searchAvailability: 'INTEGRATED_SEARCH',
    apiAvailability: true,
    accessLimitations: 'Grounding via Google Search in Gemini API; dependent on primary Google Web Index freshness and knowledge graph nodes.',
    testingMethodology: 'Submit prompts to Gemini 1.5/2.0 API with google_search grounding tool enabled; parse groundingMetadata.groundingChunks.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Google AI Studio Grounding Documentation & Search Console Web Logs',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 3. Google AI Overviews
  {
    id: 'google-ai-overviews',
    name: 'Google AI Overviews (SGE)',
    operator: 'Google LLC',
    tier: 1,
    crawlerUserAgent: 'Googlebot / Googlebot-Mobile',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: false,
    accessLimitations: 'Triggered algorithmically on organic SERPs; requires high-authority semantic HTML, structured data, and top-ranking snippets.',
    testingMethodology: 'SERP API query extraction checking for ai_overview snippet container and cited card URLs.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'Organic Google Search SERP Observation & GSC Marketing Intelligence',
    cost: 'PAID_API',
    automationStatus: 'SEMI_AUTOMATED'
  },

  // 4. Perplexity AI
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    operator: 'Perplexity, Inc.',
    tier: 1,
    crawlerUserAgent: 'PerplexityBot',
    publicRetrievalMethod: 'HYBRID',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Perplexity Sonar API provides citations array; real-time web retrieval heavily relies on accessible markdown & SSR snapshots.',
    testingMethodology: 'Query Perplexity Sonar API; inspect citations field and extract exact domain references.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'STRUCTURED_FOOTNOTES',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Perplexity API Documentation & Bot Access Log Tracking',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 5. Microsoft Copilot
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot (Bing AI)',
    operator: 'Microsoft Corporation',
    tier: 1,
    crawlerUserAgent: 'Bingbot',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Pulls directly from Bing Index; accelerated via IndexNow protocol; requires valid XML sitemaps registered in Bing Webmaster Tools.',
    testingMethodology: 'Query Bing Web Search API with Copilot summary extraction or manual web audit in edge session.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'STRUCTURED_FOOTNOTES',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Bing Webmaster Tools & IndexNow API Dispatches',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 6. Claude (Anthropic)
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    operator: 'Anthropic PBC',
    tier: 1,
    crawlerUserAgent: 'ClaudeBot / Claude-Web',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'INTEGRATED_SEARCH',
    apiAvailability: true,
    accessLimitations: 'Anthropic Claude web search is rolling out; relies on unblocked crawler access in robots.txt and llms.txt context files.',
    testingMethodology: 'Query Anthropic Messages API with web-search tool enabled where provisioned; otherwise manual browser verification.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'Anthropic ClaudeBot Documentation & robots-resume.txt allowlist',
    cost: 'PAID_API',
    automationStatus: 'SEMI_AUTOMATED'
  },

  // 7. Grok (xAI)
  {
    id: 'grok',
    name: 'Grok (xAI)',
    operator: 'xAI Corp.',
    tier: 1,
    crawlerUserAgent: 'GrokBot / xAI',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'xAI API supports search mode; synthesizes live web results and social discussions from X platform.',
    testingMethodology: 'Submit test prompts to xAI API (grok-2) with search enabled; evaluate citation presence.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'xAI API Documentation & Social Discussion Graph',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 8. Meta AI
  {
    id: 'meta-ai',
    name: 'Meta AI',
    operator: 'Meta Platforms, Inc.',
    tier: 1,
    crawlerUserAgent: 'Meta-ExternalAgent / FacebookBot',
    publicRetrievalMethod: 'HYBRID',
    searchAvailability: 'INTEGRATED_SEARCH',
    apiAvailability: false,
    accessLimitations: 'Meta AI consumer assistant uses Bing and Google partnerships for web search; no public direct search API for third-party auditing.',
    testingMethodology: 'Standardized manual prompt benchmarking in Meta AI web/mobile interface; recording citation screenshots.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'Meta AI Web Interface & OpenGraph Verification',
    cost: 'FREE',
    automationStatus: 'MANUAL_AUDIT'
  },

  // 9. DeepSeek
  {
    id: 'deepseek',
    name: 'DeepSeek (DeepSeek Search)',
    operator: 'DeepSeek Inc.',
    tier: 1,
    crawlerUserAgent: 'DeepSeekBot',
    publicRetrievalMethod: 'HYBRID',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'DeepSeek Chat API with search enabled (deepseek-chat); requires clean UTF-8 text and fast server response times.',
    testingMethodology: 'Query DeepSeek Chat API with online search toggle; inspect returned references.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'STRUCTURED_FOOTNOTES',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'DeepSeek API Documentation & Open Source Model Weights',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 10. Brave Search / AI
  {
    id: 'brave-search',
    name: 'Brave Search AI Summarizer',
    operator: 'Brave Software, Inc.',
    tier: 2,
    crawlerUserAgent: 'Bravebot',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Brave Search API includes AI summary object and source list; completely independent web index from Google/Bing.',
    testingMethodology: 'Submit queries to Brave Search API (v1/search) with summary=1; parse extra_snippets and summary citations.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Brave Search API Documentation & Independent Crawler Verification',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 11. You.com
  {
    id: 'you-com',
    name: 'You.com (YouSearch)',
    operator: 'SuSea, Inc.',
    tier: 2,
    crawlerUserAgent: 'YouBot',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'You.com Search & News API returns real-time LLM-ready context snippets and citation links.',
    testingMethodology: 'Query You.com Search API; check hits array for canonical URL inclusion.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'You.com Developer API Docs',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 12. Kagi
  {
    id: 'kagi',
    name: 'Kagi FastGPT / Quick Answer',
    operator: 'Kagi Inc.',
    tier: 2,
    crawlerUserAgent: 'KagiBot',
    publicRetrievalMethod: 'LIVE_SEARCH_CRAWL',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Kagi FastGPT API provides sourced answers; requires paid Kagi API key; prioritizes high-quality, non-ad-heavy domains.',
    testingMethodology: 'Query Kagi FastGPT API; parse references array and domain rankings.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'STRUCTURED_FOOTNOTES',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'HIGH',
    dataProvenance: 'Kagi Developer API Documentation',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 13. Mistral AI (Le Chat)
  {
    id: 'mistral-ai',
    name: 'Mistral AI (Le Chat Web Search)',
    operator: 'Mistral AI',
    tier: 2,
    crawlerUserAgent: 'MistralBot',
    publicRetrievalMethod: 'HYBRID',
    searchAvailability: 'NATIVE_LIVE',
    apiAvailability: true,
    accessLimitations: 'Mistral API (mistral-large-latest) with web search integration; primarily strong in European languages (EN, FR, DE, ES).',
    testingMethodology: 'Query Mistral API with web-search enabled; inspect returned tool citation blocks.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'Mistral AI API Documentation & European Language Benchmarks',
    cost: 'PAID_API',
    automationStatus: 'AUTOMATED_API'
  },

  // 14. DuckDuckGo AI Features
  {
    id: 'duckduckgo-ai',
    name: 'DuckDuckGo DuckAssist & AI Chat',
    operator: 'DuckDuckGo, Inc.',
    tier: 2,
    crawlerUserAgent: 'DuckDuckBot / DuckAssistBot',
    publicRetrievalMethod: 'RAG_RETRIEVAL',
    searchAvailability: 'INTEGRATED_SEARCH',
    apiAvailability: false,
    accessLimitations: 'No public API for DuckAssist; pulls from Wikipedia, authoritative documentation, and Bing index.',
    testingMethodology: 'Manual browser query verification through DuckDuckGo search interface; recording DuckAssist citation sources.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'DuckDuckGo Public Search Engine & Crawler Policy',
    cost: 'FREE',
    automationStatus: 'MANUAL_AUDIT'
  },

  // 15. Poe Discovery Ecosystem
  {
    id: 'poe',
    name: 'Poe Discovery Ecosystem (Quora)',
    operator: 'Quora, Inc.',
    tier: 2,
    crawlerUserAgent: 'PoeBot / QuoraBot',
    publicRetrievalMethod: 'HYBRID',
    searchAvailability: 'INTEGRATED_SEARCH',
    apiAvailability: true,
    accessLimitations: 'Aggregates multiple underlying model providers (Claude, GPT-4o, Gemini); utilizes internal web browsing tool.',
    testingMethodology: 'Query Poe API with web-enabled bot models; examine markdown response links.',
    queryCoverage: 'GLOBAL',
    citationExtractionCapability: 'INLINE_LINKS',
    urlExtractionCapability: true,
    observationTimestamp: '2026-11-24T21:55:00Z',
    confidenceLevel: 'MEDIUM',
    dataProvenance: 'Poe API & Developer Protocol Documentation',
    cost: 'PAID_API',
    automationStatus: 'SEMI_AUTOMATED'
  }
];
