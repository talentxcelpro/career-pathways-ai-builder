// backlink-engine/src/scripts/probeCandidates.cjs
// Probes candidate URLs live over HTTP/HTTPS, inspecting redirect chains and HTML DOM
// to identify whether a TalentXcel link exists.

const https = require('https');
const http = require('http');
const { getDatabase } = require('../db/schema.cjs');

const TARGETS = [
  // 5 B2B Directories
  { id: 'b2b-startupindia', platform: 'Startup India', url: 'https://www.startupindia.gov.in/content/sih/en/profile.html', type: 'B2B_DIRECTORY' },
  { id: 'b2b-crunchbase', platform: 'Crunchbase', url: 'https://www.crunchbase.com/organization/talentxcel', type: 'B2B_DIRECTORY' },
  { id: 'b2b-clutch', platform: 'Clutch', url: 'https://clutch.co/profile/talentxcel', type: 'B2B_DIRECTORY' },
  { id: 'b2b-softwaresuggest', platform: 'SoftwareSuggest', url: 'https://www.softwaresuggest.com/talentxcel', type: 'B2B_DIRECTORY' },
  { id: 'b2b-producthunt', platform: 'Product Hunt', url: 'https://www.producthunt.com/products/talentxcel', type: 'B2B_DIRECTORY' },

  // 5 Institutional Placement Portals
  { id: 'tpo-iitm', platform: 'IIT Madras', url: 'https://placement.iitm.ac.in', type: 'CAMPUS_TPO' },
  { id: 'tpo-iitd', platform: 'IIT Delhi', url: 'https://ocs.iitd.ac.in', type: 'CAMPUS_TPO' },
  { id: 'tpo-iitb', platform: 'IIT Bombay', url: 'https://campus.placements.iitb.ac.in/', type: 'CAMPUS_TPO' },
  { id: 'tpo-iitk', platform: 'IIT Kanpur', url: 'https://spo.iitk.ac.in', type: 'CAMPUS_TPO' },
  { id: 'tpo-bits', platform: 'BITS Pilani', url: 'https://www.bits-pilani.ac.in/placements', type: 'CAMPUS_TPO' }
];

async function probeUrl(target) {
  const startTime = Date.now();
  return new Promise(resolve => {
    try {
      const u = new URL(target.url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(u, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000,
        rejectUnauthorized: false
      }, res => {
        let body = '';
        res.on('data', chunk => {
          if (body.length < 500000) body += chunk;
        });
        res.on('end', () => {
          const latencyMs = Date.now() - startTime;
          const redirectLocation = res.headers.location || null;
          
          // Parse HTML DOM for anchor tags pointing to talentxcel.in
          const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
          let match;
          const foundAnchors = [];

          while ((match = anchorRegex.exec(body)) !== null) {
            const attrs = match[1];
            const inner = match[2];
            const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
            if (hrefMatch && hrefMatch[1].toLowerCase().includes('talentxcel.in')) {
              const relMatch = attrs.match(/rel\s*=\s*["']([^"']+)["']/i);
              foundAnchors.push({
                href: hrefMatch[1],
                anchorText: inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
                rel: relMatch ? relMatch[1] : 'follow'
              });
            }
          }

          const hasTalentxcelLink = foundAnchors.length > 0;

          resolve({
            id: target.id,
            platform: target.platform,
            url: target.url,
            type: target.type,
            statusCode: res.statusCode,
            latencyMs,
            redirectLocation,
            hasTalentxcelLink,
            foundAnchors,
            error: null
          });
        });
      });

      req.on('error', e => {
        resolve({
          id: target.id,
          platform: target.platform,
          url: target.url,
          type: target.type,
          statusCode: null,
          latencyMs: Date.now() - startTime,
          redirectLocation: null,
          hasTalentxcelLink: false,
          foundAnchors: [],
          error: e.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          id: target.id,
          platform: target.platform,
          url: target.url,
          type: target.type,
          statusCode: null,
          latencyMs: Date.now() - startTime,
          redirectLocation: null,
          hasTalentxcelLink: false,
          foundAnchors: [],
          error: 'TIMEOUT'
        });
      });

      req.end();
    } catch (err) {
      resolve({
        id: target.id,
        platform: target.platform,
        url: target.url,
        type: target.type,
        statusCode: null,
        latencyMs: 0,
        redirectLocation: null,
        hasTalentxcelLink: false,
        foundAnchors: [],
        error: err.message
      });
    }
  });
}

async function runAudit() {
  console.log(`🔎 Auditing ${TARGETS.length} candidate URLs live over HTTP/HTTPS...`);
  const results = [];
  for (const t of TARGETS) {
    const res = await probeUrl(t);
    results.push(res);
    console.log(`   [${res.statusCode || 'ERR'}] ${t.platform} (${t.url}) -> Latency: ${res.latencyMs}ms | Link to TalentXcel: ${res.hasTalentxcelLink ? 'YES' : 'NO'}`);
  }
  return results;
}

if (require.main === module) {
  runAudit().then(res => {
    console.log('\nAudit complete.');
  });
}

module.exports = { runAudit, TARGETS };
