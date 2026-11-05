// backlink-engine/src/scripts/revalidate52Candidates.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_classified_final.json'), 'utf8'));
const submitAudits = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), 'utf8'));
const auditMap = new Map();
submitAudits.forEach(s => auditMap.set(s.num, s));

// The 52 candidates previously marked READY_FOR_HUMAN_APPROVAL
const candidates = list.filter(c => c.status === 'READY_FOR_HUMAN_APPROVAL');

console.log(`Deep revalidating all ${candidates.length} candidates...`);

async function fetchPage(urlStr, timeoutMs = 8000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(u.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        rejectUnauthorized: false,
        timeout: timeoutMs
      }, (res) => {
        let data = '';
        res.on('data', chunk => { if (data.length < 150000) data += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, html: data }));
      });
      req.on('error', e => resolve({ statusCode: 0, error: e.message, html: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, error: 'TIMEOUT', html: '' }); });
    } catch (err) {
      resolve({ statusCode: 0, error: err.message, html: '' });
    }
  });
}

function analyzeForm(html) {
  const lower = html.toLowerCase();

  // Inputs
  const inputMatches = [...html.matchAll(/<input[^>]+name=["']([^"']+)["']/gi)].map(m => m[1]);
  const textareaMatches = [...html.matchAll(/<textarea[^>]+name=["']([^"']+)["']/gi)].map(m => m[1]);
  const selectMatches = [...html.matchAll(/<select[^>]+name=["']([^"']+)["']/gi)].map(m => m[1]);
  const hasSubmitButton = /type=["']submit["']|<button[^>]*>[\s\S]*?(?:submit|add|publish|send|list|claim)[\s\S]*?<\/button>/i.test(html);

  // Field semantics
  const hasUrlField = /url|website|link/i.test(inputMatches.join(' '));
  const hasNameField = /name|title|tool/i.test(inputMatches.join(' '));
  const hasEmailField = /email/i.test(inputMatches.join(' '));
  const hasDescField = textareaMatches.length > 0 || /description|summary/i.test(inputMatches.join(' '));

  // Pricing analysis
  const hasFreeMention = /free\s*submission|free\s*tier|100%\s*free|\$0|standard\s*\(free\)|free\s*forever|basic\s*\(free\)/i.test(lower);
  const explicitPrices = [...lower.matchAll(/\$\d+/g)].map(m => m[0]);
  const uniquePrices = [...new Set(explicitPrices)];
  const hasPaidOnly = uniquePrices.length > 0 && !hasFreeMention;

  // Reciprocal conditions
  const hasReciprocalMention = /embed\s*(?:our)?\s*badge|backlink\s*required|reciprocal\s*link|badge\s*on\s*your\s*website|place\s*our\s*logo/i.test(lower);

  // Categories accepted
  const mentionsCareerOrProductivity = /productivity|career|resume|hr|work|business|general|all\s*categories|other/i.test(lower);

  return {
    fields: {
      inputs: inputMatches,
      textareas: textareaMatches,
      selects: selectMatches,
      hasUrlField,
      hasNameField,
      hasEmailField,
      hasDescField,
      hasSubmitButton
    },
    pricing: {
      hasFreeMention,
      uniquePrices,
      hasPaidOnly
    },
    hasReciprocalMention,
    mentionsCareerOrProductivity
  };
}

async function run() {
  const auditResults = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    console.log(`[${i+1}/${candidates.length}] Auditing #${c.num} ${c.name} (${c.domain})...`);
    
    const page = await fetchPage(c.submissionUrl);
    let analysis = null;

    if (page.statusCode === 200 && page.html.length > 0) {
      analysis = analyzeForm(page.html);
    }

    auditResults.push({
      num: c.num,
      name: c.name,
      domain: c.domain,
      submissionUrl: c.submissionUrl,
      fetchStatus: page.statusCode,
      fetchError: page.error || null,
      analysis
    });
  }

  fs.writeFileSync(path.join(__dirname, 'revalidate_52_results.json'), JSON.stringify(auditResults, null, 2), 'utf8');
  console.log('Saved revalidate_52_results.json');
}

run();
