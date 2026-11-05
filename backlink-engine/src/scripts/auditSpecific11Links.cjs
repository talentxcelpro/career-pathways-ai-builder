const https = require('https');
const http = require('http');

const linksToCheck = [
  { id: 1, source: 'https://rentry.co/q4ofexi2', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' },
  { id: 2, source: 'https://rentry.co/q4ofexi2', target: 'https://talentxcel.in', expectedAnchor: 'TalentXcel Career OS' },
  { id: 3, source: 'https://rentry.co/hfnfmzmh', target: 'https://salary.talentxcel.in', expectedAnchor: 'TalentXcel Salary Benchmark Index' },
  { id: 4, source: 'https://rentry.co/b7raewys', target: 'https://talentxcel.in/employers', expectedAnchor: 'TalentXcel Employer Talent Acquisition Portal' },
  { id: 5, source: 'https://rentry.co/6fy7ioyi', target: 'https://talentxcel.in/colleges', expectedAnchor: 'TalentXcel University Placement Infrastructure' },
  { id: 6, source: 'https://rentry.co/ywv4r74o', target: 'https://talentxcel.in/learning', expectedAnchor: 'TalentXcel Skill Verification Engine' },
  { id: 7, source: 'https://rentry.co/pk5hz336', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' },
  { id: 8, source: 'https://rentry.co/yn9cnbrr', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' },
  { id: 9, source: 'https://rentry.co/cmmub6td', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' },
  { id: 10, source: 'https://rentry.co/gbc3zn8g', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' },
  { id: 11, source: 'https://rentry.co/dtfweo6r', target: 'https://talentxcel.in/resume-scanner', expectedAnchor: 'TalentXcel ATS Resume Diagnostic Scanner' }
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => { if (body.length < 150000) body += chunk; });
        res.on('end', () => {
          resolve({
            url,
            statusCode: res.statusCode,
            headers: res.headers,
            latencyMs: Date.now() - start,
            body
          });
        });
      });
      req.on('error', err => resolve({ url, error: err.message, latencyMs: Date.now() - start }));
      req.on('timeout', () => { req.destroy(); resolve({ url, error: 'TIMEOUT', latencyMs: Date.now() - start }); });
    } catch (e) {
      resolve({ url, error: e.message, latencyMs: Date.now() - start });
    }
  });
}

async function runAudit() {
  console.log('Initiating live forensic audit of the 11 specified backlink pairs...\n');
  const results = [];

  // Group by unique source URL to avoid fetching the same Rentry page multiple times unnecessarily
  const sourcePages = {};
  for (const item of linksToCheck) {
    if (!sourcePages[item.source]) {
      console.log(`Auditing Source Rentry Page: ${item.source}`);
      sourcePages[item.source] = await fetchUrl(item.source);
    }
  }

  // Audit destinations
  const destinations = {};
  for (const item of linksToCheck) {
    if (!destinations[item.target]) {
      console.log(`Auditing Destination Target: ${item.target}`);
      destinations[item.target] = await fetchUrl(item.target);
    }
  }

  console.log('\n--- EVALUATING FORENSIC INTEGRITY ---\n');

  for (const item of linksToCheck) {
    const src = sourcePages[item.source];
    const dst = destinations[item.target];

    // Inspect Source DOM
    let linkFound = false;
    let exactTag = '';
    let exactAnchor = '';
    let relAttr = 'ABSENT';
    
    if (src.body) {
      // Find all <a> tags
      const aTags = src.body.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
      for (const tag of aTags) {
        if (tag.includes(item.target)) {
          linkFound = true;
          exactTag = tag;
          const anchorMatch = tag.match(/>([^<]+)<\/a>/i);
          exactAnchor = anchorMatch ? anchorMatch[1].trim() : 'EMPTY_OR_NESTED';
          const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
          relAttr = relMatch ? relMatch[1] : 'ABSENT';
          break;
        }
      }
    }

    // Inspect Destination DOM & Headers
    let canonicalUrl = 'NONE';
    let robotsMeta = 'NONE';
    let xRobotsTag = dst.headers && dst.headers['x-robots-tag'] ? dst.headers['x-robots-tag'] : 'NONE';

    if (dst.body) {
      const canonMatch = dst.body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                         dst.body.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      canonicalUrl = canonMatch ? canonMatch[1] : 'NOT_FOUND';

      const robotsMatch = dst.body.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) ||
                          dst.body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
      robotsMeta = robotsMatch ? robotsMatch[1] : 'NOT_FOUND';
    }

    results.push({
      id: item.id,
      source: item.source,
      sourceStatus: src.statusCode || src.error,
      sourceLatency: src.latencyMs,
      target: item.target,
      targetStatus: dst.statusCode || dst.error,
      targetLatency: dst.latencyMs,
      linkFound,
      exactAnchor,
      relAttr,
      canonicalUrl,
      robotsMeta,
      xRobotsTag,
      isSelfCanonical: canonicalUrl === item.target || canonicalUrl === item.target + '/'
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

runAudit();
