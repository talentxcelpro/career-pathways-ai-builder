// scripts/audit-live-production-evidence.ts
// Queries the live production server (https://talentxcel.in) for all 8 core products
// across both human browser user-agents and major AI search crawlers.

import * as fs from 'fs';
import * as path from 'path';

interface ProductAuditResult {
  product: string;
  url: string;
  human: {
    status: number;
    contentType: string;
    canonical?: string;
    robotsMeta?: string;
    title?: string;
    xRobotsTag?: string;
    isSpaShell: boolean;
  };
  oaiSearchBot: {
    status: number;
    xRobotsTag?: string;
    renderEngine?: string;
    title?: string;
    h1?: string;
    canonical?: string;
    schemaTypes: string[];
    wordCount: number;
  };
  perplexityBot: {
    status: number;
    xRobotsTag?: string;
    renderEngine?: string;
    title?: string;
  };
  claudeBot: {
    status: number;
    xRobotsTag?: string;
    renderEngine?: string;
    title?: string;
  };
}

const PRODUCTS = [
  { name: 'ATS-Check', path: '/resume/ats-check' },
  { name: 'ATS-Check Shortlink', path: '/ats-check' },
  { name: 'TalentScore', path: '/talent-score' },
  { name: 'Career Passport', path: '/passport' },
  { name: 'Jobs', path: '/jobs' },
  { name: 'Talent', path: '/talent' },
  { name: 'Network', path: '/network' },
  { name: 'Recruiter OS', path: '/employers' },
  { name: 'Communities', path: '/communities' },
];

async function fetchRoute(path: string, userAgent: string) {
  const url = `https://talentxcel.in${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'manual'
    });

    const status = res.status;
    const location = res.headers.get('location');
    const xRobotsTag = res.headers.get('x-robots-tag') || undefined;
    const renderEngine = res.headers.get('x-render-engine') || undefined;
    const contentType = res.headers.get('content-type') || '';
    
    let text = '';
    if (status === 200 || status === 404 || status === 410) {
      text = await res.text();
    }

    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const h1Match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : undefined;

    const canonMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const canonical = canonMatch ? canonMatch[1] : undefined;

    const robMatch = text.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    const robotsMeta = robMatch ? robMatch[1] : undefined;

    const schemaMatches = [...text.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const schemaTypes: string[] = [];
    for (const sm of schemaMatches) {
      try {
        const parsed = JSON.parse(sm[1]);
        if (parsed['@type']) schemaTypes.push(parsed['@type']);
        if (Array.isArray(parsed['@graph'])) {
          parsed['@graph'].forEach((g: any) => g['@type'] && schemaTypes.push(g['@type']));
        }
      } catch {}
    }

    const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(' ').length : 0;
    const isSpaShell = text.includes('<div id="root">') && text.includes('/src/main.tsx');

    return {
      status,
      location,
      xRobotsTag,
      renderEngine,
      contentType,
      title,
      h1,
      canonical,
      robotsMeta,
      schemaTypes,
      wordCount,
      isSpaShell
    };
  } catch (err: any) {
    return {
      status: 0,
      error: err.message,
      contentType: '',
      schemaTypes: [],
      wordCount: 0,
      isSpaShell: false
    };
  }
}

async function runAudit() {
  console.log('🔍 COMMENCING LIVE PRODUCTION AUDIT ON HTTPS://TALENTXCEL.IN\n');
  const results: any[] = [];

  for (const prod of PRODUCTS) {
    console.log(`Checking ${prod.name} (${prod.path})...`);
    
    // 1. Regular Human Browser
    const human = await fetchRoute(prod.path, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
    
    // 2. OpenAI SearchBot
    const oai = await fetchRoute(prod.path, 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)');
    
    // 3. PerplexityBot
    const perplx = await fetchRoute(prod.path, 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)');
    
    // 4. ClaudeBot
    const claude = await fetchRoute(prod.path, 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com)');

    results.push({
      product: prod.name,
      path: prod.path,
      human: {
        status: human.status,
        location: human.location,
        title: human.title,
        canonical: human.canonical,
        robotsMeta: human.robotsMeta,
        xRobotsTag: human.xRobotsTag,
        isSpaShell: human.isSpaShell,
        wordCount: human.wordCount
      },
      oaiSearchBot: {
        status: oai.status,
        location: oai.location,
        xRobotsTag: oai.xRobotsTag,
        renderEngine: oai.renderEngine,
        title: oai.title,
        h1: oai.h1,
        canonical: oai.canonical,
        schemaTypes: oai.schemaTypes,
        wordCount: oai.wordCount
      },
      perplexityBot: {
        status: perplx.status,
        xRobotsTag: perplx.xRobotsTag,
        renderEngine: perplx.renderEngine,
        title: perplx.title
      },
      claudeBot: {
        status: claude.status,
        xRobotsTag: claude.xRobotsTag,
        renderEngine: claude.renderEngine,
        title: claude.title
      }
    });
  }

  console.log('\n======================================================');
  console.log('📊 LIVE PRODUCTION AUDIT RESULTS:');
  console.log('======================================================\n');
  console.log(JSON.stringify(results, null, 2));

  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  fs.writeFileSync('reports/live_production_audit_raw.json', JSON.stringify(results, null, 2), 'utf-8');
}

runAudit().catch(console.error);
