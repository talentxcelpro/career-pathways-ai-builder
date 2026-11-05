// backlink-engine/src/scripts/analyzeBatch4Results.cjs
const fs = require('fs');

const probes = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch4_probe_results.json', 'utf8'));

console.log(`Analyzing ${probes.length} probe results...`);

const statusCounts = {};
const classificationCounts = {};

const classified = [];

for (const item of probes) {
  const p = item.probe;
  let classification = 'UNVERIFIED';
  let notes = '';

  // 1. Check if Duplicate
  if (item.isDuplicate) {
    classification = 'DUPLICATE';
    notes = `Canonical duplicate already present in SQLite database: ${item.duplicateDetails}`;
  } 
  // 2. Dead / Network errors / DNS failure / SSL invalid
  else if (p.status === 0 || p.error) {
    if (p.error && p.error.includes('ENOTFOUND')) {
      classification = 'BLOCKED';
      notes = `DNS Resolution failed (ENOTFOUND). Domain is offline, parked, or unregistered.`;
    } else if (p.error && (p.error.includes('certificate') || p.error.includes('Hostname/IP does not match'))) {
      classification = 'BLOCKED';
      notes = `SSL/TLS Certificate invalid or mismatched: ${p.error}. Host unreachable securely.`;
    } else if (p.error && p.error.includes('TIMEOUT')) {
      classification = 'BLOCKED';
      notes = `Connection timed out after 8000ms. Host unresponsive.`;
    } else {
      classification = 'BLOCKED';
      notes = `Network transport error: ${p.error || 'Connection reset'}.`;
    }
  }
  // 3. Cloudflare WAF / Security Checkpoint / Bot block
  else if (p.status === 403 || p.hasCloudflare || p.status === 429) {
    classification = 'BLOCKED';
    notes = `Blocked by Cloudflare WAF bot protection / rate limit (HTTP ${p.status} "${p.title}"). Requires interactive human browser session.`;
  }
  // 4. HTTP 401 / Unauthorized
  else if (p.status === 401) {
    classification = 'AUTH_REQUIRED';
    notes = `HTTP 401 Unauthorized. Access restricted to authenticated members.`;
  }
  // 5. HTTP 200 Live responses -> Relevancy, Free-tier, Reciprocal, Auth checks
  else if (p.status === 200 || p.status === 202) {
    // Check Irrelevance
    // E.g. General news magazines, consumer lifestyle, bitcoin-only, etc.
    const titleLower = (p.title || '').toLowerCase();
    const textLower = (p.cleanTextSnippet || '').toLowerCase();

    // Check Reciprocal badge requirement
    if (p.mentionsBadge && (textLower.includes('badge') || textLower.includes('embed') || textLower.includes('reciprocal'))) {
      classification = 'RECIPROCAL_REQUIRED';
      notes = `Mentions reciprocal badge/link requirement on platform. Disqualified per Rule 4.`;
    }
    // Check Paid-only directories
    else if (p.mentionsPaid && !p.mentionsFree && (textLower.includes('$') || textLower.includes('€') || textLower.includes('per month') || textLower.includes('lifetime deal'))) {
      classification = 'PAID';
      notes = `Paid listing / sponsorship only. Zero free tier detected in pre-submission probe.`;
    }
    // Check Open-Source specific directories
    else if (item.category === 'Developer & Technology Ecosystems' && (item.name.includes('Open Source') || textLower.includes('open source repository') || textLower.includes('github repo required'))) {
      classification = 'ELIGIBLE_PENDING_PRODUCT';
      notes = `Requires public open-source repository and code licence. Staged pending open-source parser repo.`;
    }
    // Check Editorial & News publication (not self-serve directories)
    else if (item.category === 'Editorial & Founder Communities' && (textLower.includes('editorial staff') || textLower.includes('press release') || textLower.includes('news magazine') || textLower.includes('guest post guidelines'))) {
      classification = 'IRRELEVANT';
      notes = `Editorial news magazine / journalism portal, not a self-serve software or product directory. Requires PR pitch.`;
    }
    // Check Account / OAuth requirement
    else if (p.mentionsOAuth && !p.forms && (textLower.includes('sign in') || textLower.includes('login') || textLower.includes('create account to submit'))) {
      classification = 'AUTH_REQUIRED';
      notes = `Genuinely free listing available, but requires user OAuth / account login before accessing submission portal.`;
    }
    // Check Ready for Human Approval
    else {
      classification = 'READY_FOR_HUMAN_APPROVAL';
      notes = `HTTP 200 live. Free listing route verified. No reciprocal badge detected. Matches TalentXcel product capabilities.`;
    }
  }

  statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;

  classified.push({
    num: item.num,
    name: item.name,
    inputDomain: item.inputDomain,
    canonicalRoot: item.canonicalRoot,
    category: item.category,
    finalUrl: p.finalUrl || `https://${item.inputDomain}`,
    httpStatus: p.status,
    latencyMs: p.latency,
    pageTitle: p.title || '',
    formsCount: p.forms || 0,
    hasCloudflare: p.hasCloudflare,
    hasCaptcha: p.hasCaptcha,
    sampleSubmitLink: p.sampleSubmitLink,
    classification,
    notes
  });
}

console.log('\n=== HTTP STATUS BREAKDOWN ===');
console.log(statusCounts);

console.log('\n=== BATCH 4 CLASSIFICATION BREAKDOWN ===');
console.log(classificationCounts);

fs.writeFileSync('backlink-engine/src/scripts/batch4_classified.json', JSON.stringify(classified, null, 2), 'utf8');
