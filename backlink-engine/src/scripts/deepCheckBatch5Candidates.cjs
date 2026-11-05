const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const breakdown = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_initial_breakdown.json'), 'utf8'));
const candidates = breakdown.live_200;

console.log(`Starting deep inspection on ${candidates.length} candidates...`);

async function fetchUrl(targetUrl, timeoutMs = 8000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(targetUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(
        u.href,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          rejectUnauthorized: false,
          timeout: timeoutMs
        },
        (res) => {
          let data = '';
          res.on('data', chunk => {
            if (data.length < 100000) data += chunk;
          });
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              finalUrl: res.headers.location || targetUrl,
              html: data
            });
          });
        }
      );
      req.on('error', (err) => resolve({ status: 0, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, error: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ status: 0, error: e.message });
    }
  });
}

function analyzeHtml(html, finalUrl) {
  const lower = html.toLowerCase();
  
  // Submit links
  const submitMatches = [...html.matchAll(/href=["']([^"']*(?:submit|add-tool|add-product|list-your|suggest|nominate|post-tool)[^"']*)["']/gi)]
    .map(m => m[1]);

  // Auth / Login triggers
  const hasLogin = /sign[\s-_]?in|log[\s-_]?in|continue with google|oauth|auth0|supabase\.auth/i.test(html);
  
  // Form checks
  const hasForm = /<form/i.test(html);
  const hasInputs = /<input[^>]+type=["']?(?:text|url|email)/i.test(html);

  // Paid triggers
  const hasPaidOnly = /(?:\$|usd|eur|price|pricing|tier|payment|stripe|checkout|sponsor)/i.test(lower) &&
    !/(?:free\s+plan|free\s+forever|100%\s+free|standard\s*\(free\)|free\s+tier|submit\s+for\s+free)/i.test(lower);
  
  const hasFreeMention = /(?:100%\s*free|free\s+submission|free\s+tier|submit\s+for\s+free|basic\s*\(free\)|free\s+listing|free\s+plan)/i.test(lower);
  const hasPaidMention = /(?:featured|expedited|sponsor|\$\d+|\bpay\b|stripe|checkout)/i.test(lower);

  // Reciprocal badge triggers
  const hasReciprocal = /(?:embed our badge|backlink required|reciprocal|place a link back|add our logo|badge on your (?:footer|website|landing page))/i.test(lower);

  return {
    submitLinks: [...new Set(submitMatches)],
    hasLogin,
    hasForm,
    hasInputs,
    hasPaidOnly,
    hasFreeMention,
    hasPaidMention,
    hasReciprocal
  };
}

async function run() {
  const detailedResults = [];

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    console.log(`[${i+1}/${candidates.length}] Checking #${item.num} ${item.name} (${item.canonicalRoot})...`);
    
    // Check if item itself is not a directory
    const itemLower = (item.name + ' ' + (item.probe.title || '') + ' ' + (item.probe.cleanTextSnippet || '')).toLowerCase();
    
    // Immediate irrelevancy checks:
    // coupon sites, personal portfolios, single SaaS apps that aren't directories
    let isIrrelevant = false;
    let irrelevancyReason = '';

    if (item.canonicalRoot === 'grabon.in') {
      isIrrelevant = true;
      irrelevancyReason = 'Coupon/deals aggregator without SaaS submission directory';
    } else if (item.canonicalRoot === 'selljam.ai') {
      isIrrelevant = true;
      irrelevancyReason = 'Single SaaS product (AI marketing), not a software/tool directory';
    } else if (item.canonicalRoot === 'ankore.io') {
      isIrrelevant = true;
      irrelevancyReason = 'Agency link-building service, no public submission portal';
    } else if (item.canonicalRoot === 'godofprompt.ai') {
      isIrrelevant = true;
      irrelevancyReason = 'Prompt library & AI guides resource, no general tool submission portal';
    }

    // Inspect candidate probe data
    const p = item.probe;
    const submitLink = p.sampleSubmitLink;
    let submitPageAnalysis = null;

    if (!isIrrelevant && submitLink) {
      let fullSubmitUrl = submitLink;
      if (submitLink.startsWith('/')) {
        fullSubmitUrl = new URL(submitLink, p.finalUrl).href;
      } else if (!submitLink.startsWith('http')) {
        fullSubmitUrl = new URL(submitLink, p.finalUrl).href;
      }
      
      const subRes = await fetchUrl(fullSubmitUrl, 6000);
      if (subRes.status === 200) {
        submitPageAnalysis = {
          submitUrl: fullSubmitUrl,
          ...analyzeHtml(subRes.html, subRes.finalUrl)
        };
      } else {
        submitPageAnalysis = {
          submitUrl: fullSubmitUrl,
          status: subRes.status,
          error: subRes.error
        };
      }
    }

    detailedResults.push({
      num: item.num,
      name: item.name,
      domain: item.canonicalRoot,
      group: item.group,
      finalUrl: p.finalUrl,
      title: p.title,
      isIrrelevant,
      irrelevancyReason,
      probeSubmitLinksCount: p.submitLinksCount,
      sampleSubmitLink: p.sampleSubmitLink,
      submitPageAnalysis
    });
  }

  fs.writeFileSync(path.join(__dirname, 'batch5_deep_results.json'), JSON.stringify(detailedResults, null, 2));
  console.log('Saved deep analysis to batch5_deep_results.json');
}

run();
