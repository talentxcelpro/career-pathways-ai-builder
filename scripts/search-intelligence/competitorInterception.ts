// scripts/search-intelligence/competitorInterception.ts
// Polite, truthful public SERP & live metadata collector for Phase 3:
// - Reads live TalentXcel HTML <title>, <meta name="description">, <h1>, <h2>
// - Queries public Bing RSS SERP (no CAPTCHA/anti-bot bypass; marks UNAVAILABLE if blocked/non-200)
// - Inspects public competitor page structure conservatively without copying content

import https from 'node:https';
import { computeKeywordFingerprint } from '../../src/lib/seo/demandIntelligence/normalizer';

export interface LivePageMetadata {
  url: string;
  httpStatus: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2s: string[];
  isBotGate: boolean;
}

export interface CompetitorBenchmarkRecord {
  benchmarkKey: string;
  query: string;
  talentxcelTargetUrl: string;
  competitorDomain: string;
  competitorUrl: string;
  sourceMethod: string;
  verificationStatus: 'PUBLIC_SERP_OBSERVED' | 'LIVE_PAGE_INSPECTED' | 'UNAVAILABLE';
  observedTitle: string | null;
  observedH1: string | null;
  observedSections: string[];
  serpFormat: string;
  topicCoverageGaps: string[];
  differentiationAngle: string;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fetchPublicText(urlStr: string, timeoutMs = 8000): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        u,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'TalentXcel-SEO-Intelligence/1.0 (+https://talentxcel.in)',
            Accept: 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
            Connection: 'close',
          },
          timeout: timeoutMs,
        },
        (res) => {
          const status = res.statusCode ?? 0;
          let body = '';
          res.on('data', (chunk) => {
            if (body.length < 250_000) body += chunk.toString('utf8');
          });
          res.on('end', () => resolve({ status, body }));
        }
      );
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, body: '' });
      });
      req.on('error', () => resolve({ status: 0, body: '' }));
      req.end();
    } catch {
      resolve({ status: 0, body: '' });
    }
  });
}

export function parseHtmlMetadata(url: string, status: number, html: string): LivePageMetadata {
  const lower = html.toLowerCase();
  const isBotGate =
    status === 403 ||
    status === 429 ||
    status === 503 ||
    lower.includes('cf-chl-bypass') ||
    lower.includes('captcha') ||
    lower.includes('verify you are human');

  if (status < 200 || status >= 400 || isBotGate) {
    return { url, httpStatus: status, title: null, metaDescription: null, h1: null, h2s: [], isBotGate };
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i) ||
    html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["'][^>]*>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => decodeHtmlEntities(m[1]))
    .filter((s) => s.length >= 3 && s.length <= 120)
    .slice(0, 8);

  return {
    url,
    httpStatus: status,
    title: titleMatch ? decodeHtmlEntities(titleMatch[1]) : null,
    metaDescription: descMatch ? decodeHtmlEntities(descMatch[1]) : null,
    h1: h1Match ? decodeHtmlEntities(h1Match[1]) : null,
    h2s: h2Matches,
    isBotGate: false,
  };
}

export async function inspectLiveUrlMetadata(url: string): Promise<LivePageMetadata> {
  const { status, body } = await fetchPublicText(url, 7000);
  return parseHtmlMetadata(url, status, body);
}

function detectSerpFormat(title: string | null, url: string): string {
  const t = (title || '').toLowerCase();
  const u = url.toLowerCase();
  if (t.includes('salary') || u.includes('salary')) return 'SALARY_BENCHMARK';
  if (t.includes('interview') || t.includes('question')) return 'INTERVIEW_GUIDE';
  if (t.includes('ats') || t.includes('resume')) return 'TOOL_AND_GUIDE';
  if (t.includes('job') || u.includes('jobs') || u.includes('naukri') || u.includes('indeed')) return 'JOB_AGGREGATOR';
  return 'EDITORIAL_OR_HUB';
}

export async function interceptCompetitorsForQuery(params: {
  query: string;
  talentxcelTargetUrl: string;
  realInventoryCount: number;
}): Promise<CompetitorBenchmarkRecord[]> {
  const rssUrl = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(params.query)}`;
  const { status, body } = await fetchPublicText(rssUrl, 8000);

  if (status !== 200 || !body.includes('<item>')) {
    return [
      {
        benchmarkKey: `comp-${computeKeywordFingerprint(`${params.query}|unavailable`).slice(0, 14)}`,
        query: params.query,
        talentxcelTargetUrl: params.talentxcelTargetUrl,
        competitorDomain: 'unavailable',
        competitorUrl: rssUrl,
        sourceMethod: 'bing_public_rss',
        verificationStatus: 'UNAVAILABLE',
        observedTitle: null,
        observedH1: null,
        observedSections: [],
        serpFormat: 'UNAVAILABLE',
        topicCoverageGaps: [],
        differentiationAngle: 'Public SERP source unavailable or rate-limited; retry later without bypassing gates.',
      },
    ];
  }

  const items = [...body.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6);
  const results: CompetitorBenchmarkRecord[] = [];

  for (const itemMatch of items) {
    const itemXml = itemMatch[1];
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const compUrl = linkMatch ? decodeHtmlEntities(linkMatch[1]) : '';
    const serpTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : null;
    if (!compUrl || !compUrl.startsWith('http')) continue;

    let compDomain = '';
    try {
      compDomain = new URL(compUrl).hostname.replace(/^www\./, '');
    } catch {
      continue;
    }
    if (compDomain.endsWith('talentxcel.in')) continue;

    // Inspect at most the first non-TalentXcel domain's live HTML conservatively to extract structural headings
    let verificationStatus: CompetitorBenchmarkRecord['verificationStatus'] = 'PUBLIC_SERP_OBSERVED';
    let observedH1: string | null = null;
    let observedSections: string[] = [];

    if (results.length === 0) {
      const meta = await inspectLiveUrlMetadata(compUrl);
      if (meta.httpStatus === 200 && !meta.isBotGate && (meta.h1 || meta.h2s.length > 0)) {
        verificationStatus = 'LIVE_PAGE_INSPECTED';
        observedH1 = meta.h1;
        observedSections = meta.h2s;
      }
    }

    const serpFormat = detectSerpFormat(serpTitle, compUrl);
    const gaps: string[] = [];
    if (serpFormat === 'SALARY_BENCHMARK') {
      gaps.push('Transparent city/experience salary percentile bands', 'ATS skill match check CTA');
    } else if (serpFormat === 'JOB_AGGREGATOR') {
      gaps.push('Verified active openings count', 'Skill readiness & TalentScore alignment');
    } else if (serpFormat === 'INTERVIEW_GUIDE') {
      gaps.push('Role-specific evaluation rubric', 'Career Passport & ATS resume check link');
    } else {
      gaps.push('Verified employer/role data & structured FAQ schema');
    }

    const diffAngle =
      params.realInventoryCount > 0
        ? `Differentiate with ${params.realInventoryCount} verified TalentXcel openings + instant ATS-Check & TalentScore alignment.`
        : `Differentiate with verified TalentXcel Career Passport, ATS-Check utility, and skill-gap diagnostics.`;

    results.push({
      benchmarkKey: `comp-${computeKeywordFingerprint(`${params.query}|${compUrl}`).slice(0, 14)}`,
      query: params.query,
      talentxcelTargetUrl: params.talentxcelTargetUrl,
      competitorDomain: compDomain,
      competitorUrl: compUrl,
      sourceMethod: verificationStatus === 'LIVE_PAGE_INSPECTED' ? 'bing_public_rss+http_get' : 'bing_public_rss',
      verificationStatus,
      observedTitle: serpTitle,
      observedH1,
      observedSections,
      serpFormat,
      topicCoverageGaps: gaps,
      differentiationAngle: diffAngle,
    });

    if (results.length >= 3) break;
  }

  return results;
}
