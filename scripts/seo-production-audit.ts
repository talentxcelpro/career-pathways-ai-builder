// scripts/seo-production-audit.ts
// TalentXcel Live Production SEO Quality & Crawlability Audit Suite

import https from 'https';
import http from 'http';

interface AuditTarget {
  category: string;
  url: string;
  expectedH1?: string;
  expectedSchema?: string;
}

const AUDIT_TARGETS: AuditTarget[] = [
  // 1. Core Platform & Entity
  { category: 'Core', url: 'https://talentxcel.in/', expectedSchema: 'WebSite' },
  { category: 'Company', url: 'https://talentxcel.in/company/talentxcel', expectedH1: 'TalentXcel Services', expectedSchema: 'Organization' },
  { category: 'Company', url: 'https://talentxcel.in/company/talentxcel-services', expectedH1: 'TalentXcel Services', expectedSchema: 'Organization' },

  // 2. Commercial Services
  { category: 'Service', url: 'https://talentxcel.in/services/ai-recruitment', expectedSchema: 'Service' },
  { category: 'Service', url: 'https://talentxcel.in/services/staffing-recruitment', expectedSchema: 'Service' },
  { category: 'Service', url: 'https://talentxcel.in/services/rpo', expectedSchema: 'Service' },
  { category: 'Service', url: 'https://talentxcel.in/services/it-services', expectedSchema: 'Service' },
  { category: 'Service', url: 'https://talentxcel.in/services/career-services', expectedSchema: 'Service' },

  // 3. Jobs
  { category: 'Job', url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1', expectedSchema: 'JobPosting' },
  { category: 'Job', url: 'https://talentxcel.in/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1', expectedSchema: 'JobPosting' },
  { category: 'Job', url: 'https://talentxcel.in/jobs/marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1', expectedSchema: 'JobPosting' },
  { category: 'Job', url: 'https://talentxcel.in/jobs/sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1', expectedSchema: 'JobPosting' },
  { category: 'Job', url: 'https://talentxcel.in/jobs/b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1', expectedSchema: 'JobPosting' },

  // 4. Topic Hubs
  { category: 'Topic', url: 'https://talentxcel.in/topics/artificial-intelligence', expectedSchema: 'CollectionPage' },
  { category: 'Topic', url: 'https://talentxcel.in/topics/recruitment', expectedSchema: 'CollectionPage' },
  { category: 'Topic', url: 'https://talentxcel.in/topics/careers', expectedSchema: 'CollectionPage' },
  { category: 'Topic', url: 'https://talentxcel.in/topics/technology', expectedSchema: 'CollectionPage' },
  { category: 'Topic', url: 'https://talentxcel.in/topics/leadership', expectedSchema: 'CollectionPage' },

  // 5. Public Posts
  { category: 'Post', url: 'https://talentxcel.in/post/718e7888-97cc-41ba-8a1a-88a6c063615d', expectedSchema: 'SocialMediaPosting' },
  { category: 'Post', url: 'https://talentxcel.in/post/f815fc92-e678-4785-98fe-e3c1d2030411', expectedSchema: 'SocialMediaPosting' },
  { category: 'Post', url: 'https://talentxcel.in/post/fda6e304-6f44-4458-9145-ed061ad04ecf', expectedSchema: 'SocialMediaPosting' },

  // 6. Sitemaps & Technical
  { category: 'Technical', url: 'https://talentxcel.in/sitemap.xml' },
  { category: 'Technical', url: 'https://talentxcel.in/robots.txt' },
];

function fetchLiveUrl(targetUrl: string): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve) => {
    const client = targetUrl.startsWith('https') ? https : http;
    const req = client.get(
      targetUrl,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body }));
      }
    );
    req.on('error', (err) => resolve({ status: 0, headers: {}, body: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 408, headers: {}, body: 'Timeout' });
    });
  });
}

async function runProductionAudit() {
  console.log('================================================================');
  console.log('🌐 TALENTXCEL PRODUCTION SEO QUALITY & CRAWLABILITY AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let warned = 0;
  let failed = 0;

  for (const target of AUDIT_TARGETS) {
    const res = await fetchLiveUrl(target.url);
    const isXml = target.url.endsWith('.xml');
    const isTxt = target.url.endsWith('.txt');

    if (res.status !== 200) {
      console.log(`❌ [FAIL] [${target.category}] ${target.url} returned HTTP ${res.status}`);
      failed++;
      continue;
    }

    if (isXml || isTxt) {
      console.log(`✅ [PASS] [${target.category}] ${target.url} — HTTP 200 OK (${res.headers['content-type']})`);
      passed++;
      continue;
    }

    const hasTitle = /<title>(.*?)<\/title>/i.test(res.body);
    const hasCanonical = /<link\s+rel=["']canonical["'][^>]*>/i.test(res.body);
    const hasMetaDesc = /<meta\s+name=["']description["'][^>]*>/i.test(res.body);
    const hasSchema = /<script\s+type=["']application\/ld\+json["']/i.test(res.body);

    const isHealthy = hasTitle && hasCanonical && hasMetaDesc;

    if (isHealthy) {
      console.log(`✅ [PASS] [${target.category}] ${target.url}`);
      console.log(`   └─ Canonical: Yes | Title: Yes | Desc: Yes | Schema: ${hasSchema ? 'Yes' : 'No'}`);
      passed++;
    } else {
      console.log(`⚠️ [WARN] [${target.category}] ${target.url}`);
      console.log(`   └─ Canonical: ${hasCanonical} | Title: ${hasTitle} | Desc: ${hasMetaDesc}`);
      warned++;
    }
  }

  console.log('\n================================================================');
  console.log(`AUDIT RESULTS: Total: ${AUDIT_TARGETS.length} | Passed: ${passed} | Warned: ${warned} | Failed: ${failed}`);
  console.log('================================================================\n');
}

runProductionAudit().catch(console.error);
